export default class {
  /**
   * @constructor
   * @param {[float, float]} pos Emitter position
   */
  constructor(pos) {
    this.pos = pos;
  }

  move(x, y) {
    this.pos = [this.pos[0] + x, this.pos[1] + y];
  }

  contains(pos) {
    throw new Error(`You have to implement the method contains(${pos})!`);
  }
}
