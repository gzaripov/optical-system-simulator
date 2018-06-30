import * as uniqid from "uniqid";
import { denormalizeCords } from "../../../helpers";
import { Shader } from "../gl";
import Draggable from "./Draggable";
import Drawable from "./Drawable";
import Point from "./Point";

function sign(p1: Point, p2: Point, p3: Point) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInTriangle(p: Point, v1: Point, v2: Point, v3: Point) {
  const b1 = sign(p, v1, v2) < 0;
  const b2 = sign(p, v2, v3) < 0;
  const b3 = sign(p, v3, v1) < 0;
  return b1 === b2 && b2 === b3;
}

export default class Prism extends Draggable implements Drawable {
  public pos: Point;

  private id: string;
  private radius: number;
  private selected: boolean;

  constructor(id: string, pos: Point, radius: number, selected: boolean) {
    super(pos);
    this.id = id || uniqid();
    this.selected = selected || false;
    this.radius = radius;
  }

  public isSelected() {
    return this.selected;
  }

  public to4fvFormat(shader: Shader, index: number) {
    const { pos, radius } = this;
    shader.uniform2F(`Prisms[${index}].center`, pos.x, pos.y);
    shader.uniformF(`Prisms[${index}].radius`, radius);
  }

  public contains(point: Point) {
    const [v1, v2, v3] = this.coords();
    return pointInTriangle(point, v1, v2, v3);
  }

  public drawToCanvas(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.isSelected() ? "red" : "white";
    ctx.beginPath();
    const [p1, p2, p3] = this.absCoordsCtx(ctx);
    this.drawLine(ctx, p1, p2);
    this.drawLine(ctx, p2, p3);
    this.drawLine(ctx, p3, p1);
    ctx.stroke();
  }

  private coords(): Point[] {
    const {
      pos: { x, y },
      radius
    } = this;

    const v1 = new Point(x, y + radius);
    const v2 = new Point(x + 0.866 * radius, y + -0.5 * radius);
    const v3 = new Point(x - 0.866 * radius, y + -0.5 * radius);
    return [v1, v2, v3];
  }

  private normalizePoint(p: Point, w: number, h: number) {
    const cords = denormalizeCords(p[0], p[1], w, h);
    return new Point(cords[0], cords[1]);
  }

  private absCoords(w: number, h: number): Point[] {
    return this.coords().map(p => this.normalizePoint(p, w, h));
  }

  private absCoordsCtx(ctx: CanvasRenderingContext2D) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    return this.absCoords(canvasWidth, canvasHeight);
  }

  private drawLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point) {
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
}
