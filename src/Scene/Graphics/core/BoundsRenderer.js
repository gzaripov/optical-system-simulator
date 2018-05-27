import Lens from './Lens';

export default class BoundsRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  clear() {
    const { ctx } = this;
    const { width, height } = this.ctx.canvas;
    ctx.clearRect(0, 0, width, height);
  }

  draw(drawable) {
    if (drawable instanceof Lens && drawable.isSelected()) {
      drawable.drawToCanvas(this.ctx);
    }
  }
}
