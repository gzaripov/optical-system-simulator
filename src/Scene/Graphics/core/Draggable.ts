import Point from "./Point";

export default class {
  public pos: Point;

  constructor(pos: Point) {
    this.pos = pos;
  }

  public move(x: number, y: number) {
    this.pos = this.pos.move(x, y);
  }

  public contains(pos: Point): boolean {
    throw new Error(`You have to implement the method contains(${pos})!`);
  }
}
