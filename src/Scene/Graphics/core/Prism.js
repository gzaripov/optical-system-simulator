import { denormalizeCords } from 'helpers';
import uniqid from 'uniqid';
import Draggable from './Draggable';

function sign(p1, p2, p3) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
}

function pointInTriangle(p, v1, v2, v3) {
  const b1 = sign(p, v1, v2) < 0;
  const b2 = sign(p, v2, v3) < 0;
  const b3 = sign(p, v3, v1) < 0;
  return b1 === b2 && b2 === b3;
}

export default class Prism extends Draggable /* Drawable */ {
  /**
   * @constructor
   * @param {string} id Lens id
   * @param {[float, float]} pos Prism center position
   * @param {float} radius radius of circumscribed circle
   */
  constructor({
    id, pos, radius, selected,
  }) {
    super(pos);
    this.id = id || uniqid();
    this.selected = selected || false;
    this.radius = radius;
  }

  isSelected() {
    return this.selected;
  }

  to4fvFormat(shader, index) {
    const { pos, radius } = this;
    shader.uniform2F(`Prisms[${index}].center`, ...pos);
    shader.uniformF(`Prisms[${index}].radius`, radius);
  }

  coords() {
    const {
      pos: [x, y],
      radius,
    } = this;
    const v1 = [x, y + radius];
    const v2 = [x + 0.866 * radius, y + -0.5 * radius];
    const v3 = [x - 0.866 * radius, y + -0.5 * radius];
    return [v1, v2, v3];
  }

  normalizePoint(p, w, h) {
    return denormalizeCords(p[0], p[1], w, h);
  }

  absCoords(w, h) {
    return this.coords().map(p => this.normalizePoint(p, w, h));
  }

  absCoordsCtx(ctx) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    return this.absCoords(canvasWidth, canvasHeight);
  }

  contains(point) {
    const [v1, v2, v3] = this.coords();
    return pointInTriangle(point, v1, v2, v3);
  }

  drawLine(ctx, p1, p2) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }

  drawToCanvas(ctx) {
    ctx.lineWidth = '1';
    ctx.strokeStyle = this.isSelected() ? 'red' : 'white';
    ctx.beginPath();
    const [p1, p2, p3] = this.absCoordsCtx(ctx);
    this.drawLine(ctx, p1, p2);
    this.drawLine(ctx, p2, p3);
    this.drawLine(ctx, p3, p1);
    ctx.stroke();
  }
}
