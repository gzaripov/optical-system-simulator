export default class {
  public pos: [number, number];

  constructor(pos: [number, number]) {
    this.pos = pos;
  }

  public move(x: number, y: number) {
    this.pos = [this.pos[0] + x, this.pos[1] + y];
  }

  public contains(pos: [number, number]): boolean {
    throw new Error(`You have to implement the method contains(${pos})!`);
  }
}
