import Draggable from "./Draggable";

export default class Lens extends Draggable {
  static TYPE = {
    BICONVEX: 0,
    PLANOCONVEX: 1,
    MENISCUS: 2,
    PLANOCONCAVE: 3,
    BICONCAVE: 4
  };
  /**
   * @constructor
   * @param {float} type Lens type
   * @param {[float, float]} pos Lens center position
   * @param {float} height Height of lens
   * @param {float} width Width of lens
   * @param {float} leftRadius Left radius of lens
   * @param {float} rightRadius Right ridius of lens
   */
  constructor({ type, pos, height, width, leftRadius, rightRadius }) {
    super(pos);
    this.type = type;
    this.height = height;
    this.width = width;
    this.leftRadius = leftRadius || 0.0;
    this.rightRadius = rightRadius || 0.0;
  }

  to4fvFormat(shader, index) {
    const { type, pos, height, width, leftRadius, rightRadius } = this;
    shader.uniformI(`Lenses[${index}].type`, type);
    shader.uniform2F(`Lenses[${index}].pos`, ...pos);
    shader.uniformF(`Lenses[${index}].height`, height);
    shader.uniformF(`Lenses[${index}].width`, width);
    shader.uniformF(`Lenses[${index}].leftRadius`, leftRadius);
    shader.uniformF(`Lenses[${index}].rightRadius`, rightRadius);
  }

  contains(pos) {
    const x = this.pos[0];
    const y = this.pos[1];
    const x1 = x - this.width;
    const y1 = y - this.height;
    const x2 = x + this.width;
    const y2 = y + this.height;
    const px = pos[0];
    const py = pos[1];
    return px >= x1 && px <= x2 && py >= y1 && py <= y2;
  }

  // to4fvFormat() {
  //   const { type, pos, height, width, leftRadius, rightRadius } = this;
  //   return [...pos, height, width, leftRadius, rightRadius, type, 0.0];
  // }
}
