import Texture from "./Texture";

class RenderTarget {
  private glName: WebGLFramebuffer;
  private gl: WebGLRenderingContext;
  private multiBufExt: WEBGL_draw_buffers;

  constructor(gl: WebGLRenderingContext, multiBufExt: WEBGL_draw_buffers) {
    this.gl = gl;
    this.glName = gl.createFramebuffer()!;
    this.multiBufExt = multiBufExt;
  }

  public bind() {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.glName);
  }

  public unbind() {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  public attachTexture(texture: Texture, index: number) {
    const { gl } = this;
    this.gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + index,
      gl.TEXTURE_2D,
      texture.glName,
      0
    );
  }

  public detachTexture(index: number) {
    const { gl } = this;
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + index,
      gl.TEXTURE_2D,
      null,
      0
    );
  }

  public drawBuffers(numBufs: number) {
    const buffers = [];
    for (let i = 0; i < numBufs; ++i) {
      buffers.push(this.gl.COLOR_ATTACHMENT0 + i);
    }
    this.multiBufExt.drawBuffersWEBGL(buffers);
  }
}

export default RenderTarget;
