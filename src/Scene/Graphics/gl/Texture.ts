class Texture {
  public glName: WebGLTexture;
  public boundUnit: number;

  private type: number;
  private format: number;
  private gl: WebGLRenderingContext;
  private width: number;
  private height: number;

  constructor(
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    channels: number,
    isFloat: boolean,
    isLinear: boolean,
    isClamped: boolean,
    texels: Float32Array
  ) {
    const coordMode = isClamped ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    this.type = isFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;
    this.format = [gl.LUMINANCE, 0, gl.RGB, gl.RGBA][channels - 1];
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.glName = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.glName);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.format,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      texels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, coordMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, coordMode);
    this.setSmooth(isLinear);

    this.boundUnit = -1;
  }

  public copy(texels: Float32Array) {
    const { gl } = this;
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.format,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      texels
    );
  }

  public bind(unit: number) {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.glName);
    this.boundUnit = unit;
  }

  private setSmooth(smooth: boolean) {
    const { gl } = this;
    const interpMode = smooth ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, interpMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, interpMode);
  }
}

export default Texture;
