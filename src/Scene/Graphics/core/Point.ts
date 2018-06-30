export default class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public move(x: number, y: number) {
    return new Point(this.x + x, this.y + y);
  }
}
