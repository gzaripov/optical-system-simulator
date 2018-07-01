import Texture from "./Texture";
class Shader {
  public program: WebGLProgram;
  private gl: WebGLRenderingContext;
  private vertex: WebGLShader;
  private fragment: WebGLShader;
  private uniforms: Map<string, number> = new Map();

  constructor(
    gl: WebGLRenderingContext,
    shaderDict: Map<string, string>,
    vert: string,
    frag: string
  ) {
    this.gl = gl;
    this.vertex = this.createShaderObject(shaderDict, vert, false);
    this.fragment = this.createShaderObject(shaderDict, frag, true);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vertex);
    gl.attachShader(this.program, this.fragment);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      // tslint:disable-next-line:no-console
      console.error("Could not initialize shaders");
    }
  }

  public bind() {
    this.gl.useProgram(this.program);
  }

  public uniformIndex(name: string) {
    const { gl } = this;
    if (!(name in this.uniforms)) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
    return this.uniforms[name];
  }

  public uniformTexture(name: string, texture: Texture) {
    const { gl } = this;
    const id = this.uniformIndex(name);
    if (id !== -1) {
      gl.uniform1i(id, texture.boundUnit);
    }
  }

  public uniformF(name: string, floatNumber: number) {
    const { gl } = this;
    const id = this.uniformIndex(name);
    if (id !== -1) {
      gl.uniform1f(id, floatNumber);
    }
  }

  public uniform2F(
    name: string,
    firstFloatNumber: number,
    secondFloatNumber: number
  ) {
    const { gl } = this;
    const id = this.uniformIndex(name);
    if (id !== -1) {
      gl.uniform2f(id, firstFloatNumber, secondFloatNumber);
    }
  }

  public uniform4fv(name: string, fv4Array: Float32Array | ArrayLike<number>) {
    const { gl } = this;
    const id = this.uniformIndex(name);
    if (id !== -1) {
      gl.uniform4fv(id, fv4Array);
    }
  }

  public uniformI(name: string, integerNumber: number) {
    const { gl } = this;
    const id = this.uniformIndex(name);
    if (id !== -1) {
      gl.uniform1i(id, integerNumber);
    }
  }

  private createShaderObject(
    shaderDict: Map<string, string>,
    name: string,
    isFragment: boolean
  ): WebGLShader {
    const { gl } = this;
    let shaderSource = this.resolveShaderSource(shaderDict, name);
    const shaderObject = gl.createShader(
      isFragment ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER
    )!;
    gl.shaderSource(shaderObject, shaderSource);
    gl.compileShader(shaderObject);

    if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
      /* Add some line numbers for convenience */
      const lines = shaderSource.split("\n");
      for (let i = 0; i < lines.length; ++i) {
        lines[i] = `${`   ${i + 1}`.slice(-4)} | ${lines[i]}`;
      }
      shaderSource = lines.join("\n");

      throw new Error(
        `${
          isFragment ? "Fragment" : "Vertex"
        } shader compilation error for shader '${name}':\n\n    
        ${gl
          .getShaderInfoLog(shaderObject)!
          .split("\n")
          .join(
            "\n    "
          )}\nThe expanded shader source code was:\n\n${shaderSource}`
      );
    }
    return shaderObject;
  }

  private resolveShaderSource(shaderDict: Map<string, string>, name: string) {
    if (!(name in shaderDict)) {
      throw new Error(`Unable to find shader source for '${name}'`);
    }
    let shaderSource = shaderDict[name];

    /* Rudimentary include handling for convenience.
           Not the most robust, but it will do for our purposes */
    const pattern = new RegExp('#include "(.+)"');
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = pattern.exec(shaderSource))) {
      shaderSource =
        shaderSource.slice(0, match.index) +
        this.resolveShaderSource(shaderDict, match[1]) +
        shaderSource.slice(match.index + match[0].length);
    }

    return shaderSource;
  }
}

export default Shader;
