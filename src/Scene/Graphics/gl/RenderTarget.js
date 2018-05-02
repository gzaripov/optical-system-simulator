class RenderTarget {
  constructor(gl, multiBufExt) {
    this.glName = gl.createFramebuffer();
    this.gl = gl;
    this.multiBufExt = multiBufExt;
  }

  bind() {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glName);
  }

  unbind() {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  attachTexture(texture, index) {
    const { gl } = this;
    this.gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + index,
      gl.TEXTURE_2D,
      texture.glName,
      0
    );
  }

  detachTexture(index) {
    const { gl } = this;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + index,
      gl.TEXTURE_2D,
      null,
      0
    );
  }

  drawBuffers(numBufs) {
    var buffers = [];
    for (let i = 0; i < numBufs; ++i) {
      buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
    }
    this.multiBufExt.drawBuffersWEBGL(buffers);
  }
}

export default RenderTarget;
