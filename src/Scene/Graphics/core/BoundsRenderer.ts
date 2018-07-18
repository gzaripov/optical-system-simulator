import Drawable from "../../../Scene/Graphics/core/Drawable";

export default class BoundsRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public clear() {
    const { ctx } = this;
    const { width, height } = this.ctx.canvas;
    ctx.clearRect(0, 0, width, height);
  }

  public draw(drawable: Drawable) {
    drawable.drawToCanvas(this.ctx);
  }
}
