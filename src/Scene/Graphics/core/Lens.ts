import * as uniqid from "uniqid";
import { denormalizeCords } from "../../../helpers";
import { Shader } from "../gl";
import Draggable from "./Draggable";
import Drawable from "./Drawable";
import Point from "./Point";

export enum LensType {
  BICONVEX = 0,
  PLANOCONVEX = 1,
  MENISCUS = 2,
  PLANOCONCAVE = 3,
  BICONCAVE = 4
}

export class Lens extends Draggable implements Drawable {
  public pos: Point;

  private id: string;
  private type: LensType;
  private height: number;
  private width: number;
  private leftDiameter: number;
  private rightDiameter: number;
  private leftRadius = this.leftDiameter / 2;
  private rightRadius = this.rightDiameter / 2;
  private selected: boolean;

  constructor(
    id: string,
    type: LensType,
    pos: Point,
    height: number,
    width: number,
    leftDiameter: number,
    rightDiameter: number,
    selected: boolean
  ) {
    super(pos);
    this.id = id || uniqid();
    this.type = type;
    this.height = height;
    this.width = width;
    this.selected = selected || false;
    this.leftDiameter = leftDiameter || 0.0;
    this.rightDiameter = rightDiameter || 0.0;
    this.leftRadius = this.leftDiameter / 2;
    this.rightRadius = this.rightDiameter / 2;
  }

  public isSelected() {
    return this.selected;
  }

  public to4fvFormat(shader: Shader, index: number) {
    const { type, pos, height, width, leftDiameter, rightDiameter } = this;
    shader.uniformI(`Lenses[${index}].type`, type);
    shader.uniform2F(`Lenses[${index}].pos`, pos.x, pos.y);
    shader.uniformF(`Lenses[${index}].height`, height);
    shader.uniformF(`Lenses[${index}].width`, width);
    shader.uniformF(`Lenses[${index}].leftDiameter`, leftDiameter);
    shader.uniformF(`Lenses[${index}].rightDiameter`, rightDiameter);
  }

  public drawToCanvas(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.isSelected() ? "red" : "white";
    ctx.beginPath();
    switch (this.type) {
      case LensType.BICONVEX:
        // this.drawArc({ ctx, false , right: { inner: false } });
        break;
      case LensType.PLANOCONVEX:
        // this.drawArc({ ctx, left: { inner: false } });
        this.drawPlane(ctx, false, true);
        break;
      case LensType.MENISCUS:
        // this.drawArc({ ctx, left: { inner: false }, right: { inner: true } });
        break;
      case LensType.PLANOCONCAVE:
        // this.drawArc({ ctx, left: { inner: true } });
        this.drawPlane(ctx, false, true);
        break;
      case LensType.BICONCAVE:
        // this.drawArc({ ctx, left: { inner: true }, right: { inner: true } });
        break;
      default:
    }
    ctx.closePath();
    ctx.stroke();

    // this.drawRect(ctx);
  }

  public contains(pos: Point) {
    const [x1, y1, x2, y2] = this.coords();
    const px = pos.x;
    const py = pos.y;
    return px >= x1 && px <= x2 && py >= y1 && py <= y2;
  }

  private coords() {
    const x = this.pos[0];
    const y = this.pos[1];
    const x1 = x - this.width;
    const y1 = y - this.height;
    const x2 = x + this.width;
    const y2 = y + this.height;
    return [x1, y1, x2, y2];
  }

  private rectAbsCoords(w: number, h: number) {
    const [x1, y1, x2, y2] = this.coords();
    const [nx1, ny1] = denormalizeCords(x1, y1, w, h);
    const [nx2, ny2] = denormalizeCords(x2, y2, w, h);
    return [nx1, ny1, nx2, ny2];
  }

  private denormalizeDataWithCtx(ctx: CanvasRenderingContext2D) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const cords = this.rectAbsCoords(canvasWidth, canvasHeight);
    const [x, y] = denormalizeCords(
      this.pos.x,
      this.pos.y,
      canvasWidth,
      canvasHeight
    );
    const side = Math.min(canvasWidth, canvasHeight);
    const abscissaScale = canvasWidth / (canvasWidth / side);
    return {
      abscissaScale,
      canvasHeight,
      canvasWidth,
      x,
      x1: cords[0],
      x2: cords[2],
      y,
      y1: cords[1],
      y2: cords[3]
    };
  }

  private drawArc(
    ctx: CanvasRenderingContext2D,
    left: boolean,
    right: boolean
  ) {
    const { abscissaScale, x, y } = this.denormalizeDataWithCtx(ctx);
    const { width, leftRadius, rightRadius } = this;

    const leftCenter = leftRadius - width / 2;
    const leftHeight =
      Math.sqrt(leftRadius * leftRadius - leftCenter * leftCenter) * 2;
    const height = Math.min(this.height, leftHeight || this.height);

    const leftAng = height / this.leftDiameter;
    const rightAng = height / this.rightDiameter;

    if (left) {
      /*       if (!left.inner) {
        ctx.arc(
          x + (leftRadius - width / 2) * abscissaScale,
          y,
          leftRadius * abscissaScale,
          Math.PI - leftAng,
          Math.PI + leftAng
        );
      } else { */
      ctx.arc(
        x - (rightRadius + width / 2) * abscissaScale,
        y,
        rightRadius * abscissaScale,
        rightAng,
        -rightAng,
        true
      );
      // }
    }

    if (right) {
      /* if (!right.inner) {
        ctx.arc(
          x - (rightRadius - width / 2) * abscissaScale,
          y,
          rightRadius * abscissaScale,
          -rightAng,
          rightAng
        );
      } else { */
      ctx.arc(
        x + (leftRadius + width / 2) * abscissaScale,
        y,
        leftRadius * abscissaScale,
        Math.PI + leftAng,
        Math.PI - leftAng,
        true
      );
      // }
    }
  }

  private drawPlane(
    ctx: CanvasRenderingContext2D,
    left: boolean,
    right: boolean
  ) {
    const { x1, y1, x2, y2 } = this.denormalizeDataWithCtx(ctx);

    if (left) {
      ctx.lineTo(x1, y2);
      ctx.lineTo(x1, y1);
    }

    if (right) {
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y1);
    }
  }

  private drawRect(ctx: CanvasRenderingContext2D) {
    const { x1, y1, x2, y2 } = this.denormalizeDataWithCtx(ctx);
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }
}
