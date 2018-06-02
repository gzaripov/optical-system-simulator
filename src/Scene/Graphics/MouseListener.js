import { normalizeCords } from 'helpers';

class MouseListener {
  constructor({
    target, mouseDownCallback, mouseUpCallback, mouseMoveCallback, scale,
  }) {
    const empty = () => {};
    this.target = target;
    this.mouseDownCallback = mouseDownCallback || empty;
    this.mouseUpCallback = mouseUpCallback || empty;
    this.mouseMoveCallback = mouseMoveCallback || empty;
    this.scale = scale || 1.0;
    this.mouseUpHandler = this.mouseUp.bind(this);
    this.mouseMoveHandler = this.mouseMove.bind(this);

    target.addEventListener('mousedown', evt => this.mouseDown(evt));
  }

  mouseDown(evt) {
    evt.preventDefault();
    this.mouseStart = this.mapMouseEvent(evt);
    this.mouseLast = this.mouseStart;
    this.mouseDownCallback(this.mouseStart);
    document.addEventListener('mouseup', this.mouseUpHandler);
    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  mouseUp(evt) {
    this.mouseUpCallback(this.mapMouseEvent(evt));
    document.removeEventListener('mouseup', this.mouseUpHandler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);
  }

  mouseMove(evt) {
    const newPoint = this.mapMouseEvent(evt);
    const diff = newPoint.map((item, index) => item - this.mouseLast[index]);
    this.mouseMoveCallback(diff, newPoint, this.mouseStart);
    this.mouseLast = newPoint;
  }

  mapMouseEvent(evt) {
    const rect = this.target.getBoundingClientRect();
    const { clientX, clientY } = evt;
    return normalizeCords(clientX, clientY, rect.width, rect.height);
  }
}

export default MouseListener;
