export default class Point {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public move(x: number, y: number) {
    return new Point(this.x + x, this.y + y);
  }

  public negate() {
    return new Point(-this.x, -this.y);
  }

  public minus(point: Point) {
    const p = point.negate();
    return this.move(p.x, p.y);
  }
}
