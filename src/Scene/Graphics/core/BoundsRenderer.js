import Lens from './Lens';
import Prism from './Prism';

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
    if (drawable instanceof Lens || drawable instanceof Prism) {
      drawable.drawToCanvas(this.ctx);
    }
  }
}
