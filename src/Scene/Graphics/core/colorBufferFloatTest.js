import { Texture, RenderTarget, Shader, VertexBuffer } from "../gl";
import shaders from "../shaders";

function colorBufferFloatTest(gl, multiBufExt) {
  /* This one is slightly awkward. The WEBGL_color_buffer_float
       extension is apparently causing a lot of troubles for
       ANGLE, so barely anyone bothers to implement it. On the other
       hand, most platforms do actually implicitly support float render
       targets just fine, even though they pretend they don't.
       So to *actually* figure out whether we can do float attachments
       or not, we have to do a very hacky up-front blending test
       and see whether the results come out correct.
       Hurray WebGL! */

  var shader = new Shader(gl, shaders, "blend-test-vert", "blend-test-frag");
  var packShader = new Shader(
    gl,
    shaders,
    "blend-test-vert",
    "blend-test-pack-frag"
  );
  var target = new Texture(
    gl,
    1,
    1,
    4,
    true,
    false,
    false,
    new Float32Array([-6.0, 10.0, 30.0, 2.0])
  );
  var fbo = new RenderTarget(gl, multiBufExt);
  var vbo = new VertexBuffer(gl);
  vbo.bind();
  vbo.addAttribute("Position", 3, gl.FLOAT, false);
  vbo.init(4);
  vbo.copy(
    new Float32Array([
      1.0,
      1.0,
      0.0,
      -1.0,
      1.0,
      0.0,
      -1.0,
      -1.0,
      0.0,
      1.0,
      -1.0,
      0.0
    ])
  );

  gl.viewport(0, 0, 1, 1);

  fbo.bind();
  fbo.drawBuffers(1);
  fbo.attachTexture(target, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);

  shader.bind();
  vbo.draw(shader, gl.TRIANGLE_FAN);
  vbo.draw(shader, gl.TRIANGLE_FAN);

  fbo.unbind();
  gl.disable(gl.BLEND);

  /* Of course we can neither read back texture contents or read floating point
       FBO attachments in WebGL, so we have to do another pass, convert to uint8
       and check whether the results are ok.
       Hurray WebGL! */
  packShader.bind();
  target.bind(0);
  packShader.uniformTexture("Tex", target);
  vbo.draw(packShader, gl.TRIANGLE_FAN);

  var pixels = new Uint8Array([0, 0, 0, 0]);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (
    pixels[0] !== 8 ||
    pixels[1] !== 128 ||
    pixels[2] !== 16 ||
    pixels[3] !== 4
  ) {
    console.log(
      "Floating point blending test failed. Result was " +
        pixels +
        " but should have been " +
        [8, 128, 16, 4]
    );
    throw new Error(
      "Your platform does not support floating point attachments"
    );
  }
}

export default colorBufferFloatTest;
