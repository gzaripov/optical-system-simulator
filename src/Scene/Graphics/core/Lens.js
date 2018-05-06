import Shader from "../gl";

export default class Lens {
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
    this.type = type;
    this.pos = pos;
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

  // to4fvFormat() {
  //   const { type, pos, height, width, leftRadius, rightRadius } = this;
  //   return [...pos, height, width, leftRadius, rightRadius, type, 0.0];
  // }
}
