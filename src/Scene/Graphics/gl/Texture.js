class Texture {
  constructor(
    gl,
    width,
    height,
    channels,
    isFloat,
    isLinear,
    isClamped,
    texels
  ) {
    var coordMode = isClamped ? gl.CLAMP_TO_EDGE : gl.REPEAT;
    this.type = isFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;
    this.format = [gl.LUMINANCE, gl.RG, gl.RGB, gl.RGBA][channels - 1];
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.glName = gl.createTexture();
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

  setSmooth(smooth) {
    const { gl } = this;
    let interpMode = smooth ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, interpMode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, interpMode);
  }

  copy(texels) {
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

  bind(unit) {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, this.glName);
    this.boundUnit = unit;
  }
}

export default Texture;
