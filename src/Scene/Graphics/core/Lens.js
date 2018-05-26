import { denormalizeCords } from 'helpers';
import uniqid from 'uniqid';
import Draggable from './Draggable';

export default class Lens extends Draggable /* Drawable */ {
  static TYPE = {
    BICONVEX: 0,
    PLANOCONVEX: 1,
    MENISCUS: 2,
    PLANOCONCAVE: 3,
    BICONCAVE: 4,
  };
  /**
   * @constructor
   * @param {float} type Lens type
   * @param {[float, float]} pos Lens center position
   * @param {float} height Height of lens
   * @param {float} width Width of lens
   * @param {float} leftDiameter Left diameter of lens
   * @param {float} rightDiameter Right diameter of lens
   */
  constructor({
    type, pos, height, width, leftDiameter, rightDiameter,
  }) {
    super(pos);
    this.id = uniqid();
    this.type = type;
    this.height = height;
    this.width = width;
    this.leftDiameter = leftDiameter || 0.0;
    this.rightDiameter = rightDiameter || 0.0;
    this.leftRadius = this.leftDiameter / 2;
    this.rightRadius = this.rightDiameter / 2;
  }

  to4fvFormat(shader, index) {
    const {
      type, pos, height, width, leftDiameter, rightDiameter,
    } = this;
    shader.uniformI(`Lenses[${index}].type`, type);
    shader.uniform2F(`Lenses[${index}].pos`, ...pos);
    shader.uniformF(`Lenses[${index}].height`, height);
    shader.uniformF(`Lenses[${index}].width`, width);
    shader.uniformF(`Lenses[${index}].leftDiameter`, leftDiameter);
    shader.uniformF(`Lenses[${index}].rightDiameter`, rightDiameter);
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
    switch (this.type) {
      case Lens.TYPE.BICONVEX:
        this.drawArc({ ctx, left: { inner: false }, right: { inner: false } });
        break;
      case Lens.TYPE.PLANOCONVEX:
        this.drawArc({ ctx, left: { inner: false } });
        this.drawPlane(ctx, false, true);
        break;
      case Lens.TYPE.MENISCUS:
        this.drawArc({ ctx, left: { inner: false }, right: { inner: true } });
        break;
      case Lens.TYPE.PLANOCONCAVE:
        this.drawArc({ ctx, left: { inner: true } });
        this.drawPlane(ctx, false, true);
        break;
      case Lens.TYPE.BICONCAVE:
        this.drawArc({ ctx, left: { inner: true }, right: { inner: true } });
        break;
      default:
    }
    ctx.closePath();
    ctx.stroke();

    // this.drawRect(ctx, w, h);
  }

  drawLensBorders() {}

  drawRect(ctx, w, h) {
    const [x1, y1, x2, y2] = this.rectAbsCoords(w, h);
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }
}
