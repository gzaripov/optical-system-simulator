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
   * @param {float} leftDiameter Left radius of lens
   * @param {float} rightDiameter Right ridius of lens
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

  denormalizedCoords(w, h) {
    const [x1, y1, x2, y2] = this.coords();
    const [nx1, ny1] = denormalizeCords(x1, y1, w, h);
    const [nx2, ny2] = denormalizeCords(x2, y2, w, h);
    return [nx1, ny1, nx2, ny2];
  }

  contains(pos) {
    const [x1, y1, x2, y2] = this.coords();
    const px = pos[0];
    const py = pos[1];
    return px >= x1 && px <= x2 && py >= y1 && py <= y2;
  }

  drawToCanvas(ctx, w, h) {
    const [x, y] = denormalizeCords(...this.pos, w, h);
    const { width } = this;
    const lr = this.leftDiameter / 2;
    const cLeft = lr - width / 2;
    const leftHeight = Math.sqrt(lr * lr - cLeft * cLeft) * 2;
    const height = Math.min(this.height, leftHeight || this.height);
    const side = Math.min(w, h);
    const wc = w / (w / side);
    const leftAng = height / this.leftDiameter;
    const rightAng = height / this.rightDiameter;
    ctx.beginPath();
    ctx.lineWidth = '1';
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      x + (this.leftDiameter - width) / 2 * wc,
      y,
      this.leftDiameter / 2 * wc,
      Math.PI - leftAng,
      Math.PI + leftAng,
    );
    ctx.arc(
      x - (this.rightDiameter - width) / 2 * wc,
      y,
      this.rightDiameter / 2 * wc,
      -rightAng,
      rightAng,
    );
    ctx.closePath();
    ctx.stroke();
    this.drawRect(ctx, w, h);
  }

  drawLensBorders() {}

  drawRect(ctx, w, h) {
    const [x1, y1, x2, y2] = this.denormalizedCoords(w, h);
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }
}
