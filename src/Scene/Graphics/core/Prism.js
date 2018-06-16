import { denormalizeCords } from 'helpers';
import uniqid from 'uniqid';
import Draggable from './Draggable';

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
    shader.uniformI(`Prisms[${index}].pos`, ...pos);
    shader.uniform2F(`Prisms[${index}].radius`, radius);
  }

  coords() {
    const x = this.pos[0];
    const y = this.pos[1];
    const x1 = x - this.width;
    const y1 = y - this.height;
    const x2 = x + this.width;
    const y2 = y + this.height;
    return [x1, y1, x2, y2];
  }

  rectAbsCoords(w, h) {
    const [x1, y1, x2, y2] = this.coords();
    const [nx1, ny1] = denormalizeCords(x1, y1, w, h);
    const [nx2, ny2] = denormalizeCords(x2, y2, w, h);
    return [nx1, ny1, nx2, ny2];
  }

  denormalizeDataWithCtx(ctx) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const cords = this.rectAbsCoords(canvasWidth, canvasHeight);
    const [x, y] = denormalizeCords(...this.pos, canvasWidth, canvasHeight);
    const side = Math.min(canvasWidth, canvasHeight);
    const abscissaScale = canvasWidth / (canvasWidth / side);
    return {
      canvasWidth,
      canvasHeight,
      abscissaScale,
      x,
      y,
      x1: cords[0],
      y1: cords[1],
      x2: cords[2],
      y2: cords[3],
    };
  }

  contains(pos) {
    const [x1, y1, x2, y2] = this.coords();
    const px = pos[0];
    const py = pos[1];
    return px >= x1 && px <= x2 && py >= y1 && py <= y2;
  }

  drawArc({ ctx, left, right }) {
    const { abscissaScale, x, y } = this.denormalizeDataWithCtx(ctx);
    const { width, leftRadius, rightRadius } = this;

    const leftCenter = leftRadius - width / 2;
    const leftHeight = Math.sqrt(leftRadius * leftRadius - leftCenter * leftCenter) * 2;
    const height = Math.min(this.height, leftHeight || this.height);

    const leftAng = height / this.leftDiameter;
    const rightAng = height / this.rightDiameter;

    if (left) {
      if (!left.inner) {
        ctx.arc(
          x + (leftRadius - width / 2) * abscissaScale,
          y,
          leftRadius * abscissaScale,
          Math.PI - leftAng,
          Math.PI + leftAng,
        );
      } else {
        ctx.arc(
          x - (rightRadius + width / 2) * abscissaScale,
          y,
          rightRadius * abscissaScale,
          rightAng,
          -rightAng,
          true,
        );
      }
    }

    if (right) {
      if (!right.inner) {
        ctx.arc(
          x - (rightRadius - width / 2) * abscissaScale,
          y,
          rightRadius * abscissaScale,
          -rightAng,
          rightAng,
        );
      } else {
        ctx.arc(
          x + (leftRadius + width / 2) * abscissaScale,
          y,
          leftRadius * abscissaScale,
          Math.PI + leftAng,
          Math.PI - leftAng,
          true,
        );
      }
    }
  }

  drawPlane(ctx, left, right) {
    const {
      x1, y1, x2, y2,
    } = this.denormalizeDataWithCtx(ctx);

    if (left) {
      ctx.lineTo(x1, y2);
      ctx.lineTo(x1, y1);
    }

    if (right) {
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y1);
    }
  }

  drawToCanvas(ctx) {
    ctx.lineWidth = '1';
    ctx.strokeStyle = 'white';
    ctx.beginPath();

    ctx.closePath();
    ctx.stroke();

    // this.drawRect(ctx);
  }

  drawLensBorders() {}

  drawRect(ctx) {
    const {
      x1, y1, x2, y2,
    } = this.denormalizeDataWithCtx(ctx);
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }
}
