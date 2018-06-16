#extension GL_EXT_draw_buffers : require
#include "preamble"
#include "rand"
#include "csg-intersect"
#include "bsdf"
#include "intersect"

const highp int ELEMENT_COUNT = 20;

uniform sampler2D PosData;
uniform sampler2D RngData;
uniform sampler2D RgbData;

uniform int LensLength;
uniform int PrismLength;
uniform Lens Lenses[ELEMENT_COUNT];
uniform Prism Prisms[ELEMENT_COUNT];

varying vec2 vTexCoord;

void intersect(Ray ray, inout Intersection isect, 
    Lens lenses[ELEMENT_COUNT], int lensesLength,
    Prism prisms[ELEMENT_COUNT], int prismsLength
    ) {
    bboxIntersect(ray, vec2(0.0), vec2(1.0, 1.7), 0.0, isect);

    for (int i = 0; i < ELEMENT_COUNT; i++) {
        if (i >= lensesLength) {
            break;
        }
        lensIntersect(ray, isect, lenses[i]);
    }

     for (int i = 0; i < ELEMENT_COUNT; i++) {
        if (i >= prismsLength) {
            break;
        }
        prismIntersect(ray, isect, prisms[i]);
    }

}

vec2 sample(inout vec4 state, Intersection isect, float lambda, vec2 wiLocal, inout vec3 throughput) {
    if (isect.mat == LENS_ID) {
        float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.0596, 147.4688), lambda)/1.4;
        return sampleDielectric(state, wiLocal, ior);
    } else if (isect.mat == PRSIM_ID) {
       float ior = sellmeierIor(vec3(1.6215, 0.2563, 1.6445), vec3(0.0122, 0.0596, 17.4688), lambda)/1.8;
        return sampleRoughDielectric(state, wiLocal, 0.1, ior);
    }
    else {
        throughput *= vec3(0.5);
        return sampleDiffuse(state, wiLocal);
    }
}

Ray unpackRay(vec4 posDir) {
    vec2 pos = posDir.xy;
    vec2 dir = posDir.zw;
    dir.x = abs(dir.x) < 1e-5 ? 1e-5 : dir.x; /* The nuclear option to fix NaN issues on some platforms */
    dir.y = abs(dir.y) < 1e-5 ? 1e-5 : dir.y;
    return Ray(pos, normalize(dir), 1.0/dir, sign(dir));
}

void main() {
    vec4 posDir    = texture2D(PosData, vTexCoord);
    vec4 state     = texture2D(RngData, vTexCoord);
    vec4 rgbLambda = texture2D(RgbData, vTexCoord);
    
    Ray ray = unpackRay(posDir);
    Intersection isect;
    isect.tMin = 1e-4;
    isect.tMax = 1e30;

    intersect(ray, isect, Lenses, LensLength, Prisms, PrismLength);
    
    vec2 t = vec2(-isect.n.y, isect.n.x);
    vec2 wiLocal = -vec2(dot(t, ray.dir), dot(isect.n, ray.dir));
    vec2 woLocal = sample(state, isect, rgbLambda.w, wiLocal, rgbLambda.rgb);
    
    if (isect.tMax == 1e30) {
        rgbLambda.rgb = vec3(0.0);
    } 
    else {
        posDir.xy = ray.pos + ray.dir*isect.tMax;
        posDir.zw = woLocal.y*isect.n + woLocal.x*t;
    }
    
    gl_FragData[0] = posDir;
    gl_FragData[1] = state;
    gl_FragData[2] = rgbLambda;
}
