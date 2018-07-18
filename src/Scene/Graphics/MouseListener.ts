import { normalizeCords } from "../../util/MathUtils";
import Point from "./core/Point";

class MouseListener {
  private mouseUpHandler: any;
  private mouseMoveHandler: any;
  private mouseStart: Point;
  private mouseLast: Point;

  constructor(
    private target: HTMLCanvasElement,
    private scale: number,
    private mouseDownCallback: (pos: Point) => void,
    private mouseUpCallback: (pos: Point) => void,
    private mouseMoveCallback: (
      bias: Point,
      endPos: Point,
      startPos: Point
    ) => void
  ) {
    const empty = () => void 0;
    this.target = target;
    this.mouseDownCallback = mouseDownCallback || empty;
    this.mouseUpCallback = mouseUpCallback || empty;
    this.mouseMoveCallback = mouseMoveCallback || empty;
    this.scale = scale || 1.0;
    this.mouseUpHandler = this.mouseUp.bind(this);
    this.mouseMoveHandler = this.mouseMove.bind(this);

    target.addEventListener("mousedown", evt => this.mouseDown(evt));
  }

  private mouseDown(evt: MouseEvent) {
    evt.preventDefault();
    this.mouseStart = this.mapMouseEvent(evt);
    this.mouseLast = this.mouseStart;
    this.mouseDownCallback(this.mouseStart);
    document.addEventListener("mouseup", this.mouseUpHandler);
    document.addEventListener("mousemove", this.mouseMoveHandler);
  }

  private mouseUp(evt: MouseEvent) {
    this.mouseUpCallback(this.mapMouseEvent(evt));
    document.removeEventListener("mouseup", this.mouseUpHandler);
    document.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  private mouseMove(evt: MouseEvent) {
    const newPoint = this.mapMouseEvent(evt);
    const diff = newPoint.minus(this.mouseLast);
    this.mouseMoveCallback(diff, newPoint, this.mouseStart);
    this.mouseLast = newPoint;
  }

  private mapMouseEvent(evt: MouseEvent) {
    const rect = this.target.getBoundingClientRect();
    const { clientX, clientY } = evt;
    const [x, y] = normalizeCords(clientX, clientY, rect.width, rect.height);
    return new Point(x, y);
  }
}

export default MouseListener;
