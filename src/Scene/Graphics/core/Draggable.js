export default class {
  /**
   * @constructor
   * @param {[float, float]} pos Emitter position
   */
  constructor(pos) {
    this.pos = pos;
  }

  move(x, y) {
    console.log(this.pos);
    console.log([x, y]);
    this.pos = [this.pos[0] + x, this.pos[1] + y];
    console.log(this.pos);
    console.log("\n");
  }

  contains(pos) {
    return false;
  }
}
