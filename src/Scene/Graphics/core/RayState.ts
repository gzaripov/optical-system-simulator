import { RenderTarget, Shader, Texture } from "../gl";

class RayState {
  public rngTex: Texture;
  public posTex: Texture;
  public rgbTex: Texture;

  private size: number;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, size: number) {
    this.gl = gl;
    this.size = size;
    this.initialize();
  }

  public initialize() {
    const { gl, size } = this;
    const posData = new Float32Array(size * size * 4);
    const rngData = new Float32Array(size * size * 4);
    const rgbData = new Float32Array(size * size * 4);

    for (let i = 0; i < size * size; i++) {
      const theta = Math.random() * Math.PI * 2.0;
      posData[i * 4 + 0] = 0.0;
      posData[i * 4 + 1] = 0.0;
      posData[i * 4 + 2] = Math.cos(theta);
      posData[i * 4 + 3] = Math.sin(theta);

      for (let t = 0; t < 4; t++) {
        rngData[i * 4 + t] = Math.random() * 4194167.0;
      }

      for (let t = 0; t < 4; t++) {
        rgbData[i * 4 + t] = 0.0;
      }
    }

    this.posTex = new Texture(gl, size, size, 4, true, false, true, posData);
    this.rngTex = new Texture(gl, size, size, 4, true, false, true, rngData);
    this.rgbTex = new Texture(gl, size, size, 4, true, false, true, rgbData);
  }

  public bind(shader: Shader) {
    this.posTex.bind(0);
    this.rngTex.bind(1);
    this.rgbTex.bind(2);
    shader.uniformTexture("PosData", this.posTex);
    shader.uniformTexture("RngData", this.rngTex);
    shader.uniformTexture("RgbData", this.rgbTex);
  }

  public attach(fbo: RenderTarget) {
    fbo.attachTexture(this.posTex, 0);
    fbo.attachTexture(this.rngTex, 1);
    fbo.attachTexture(this.rgbTex, 2);
  }

  public detach(fbo: RenderTarget) {
    fbo.detachTexture(0);
    fbo.detachTexture(1);
    fbo.detachTexture(2);
  }
}

export default RayState;
