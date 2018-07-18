import Draggable from "../../../Scene/Graphics/core/Draggable";
import Point from "../../../Scene/Graphics/core/Point";

export default class DragObserver {
  private movables: Draggable[] = [];
  private elementSelected = false;
  private start: [number, number] | null = null;

  public setMovables(movables: Draggable[]) {
    this.movables = [...movables];
  }

  public select(pos: [number, number]) {
    this.start = pos;
    this.elementSelected = true;
    const selected = this.movables.find(movable =>
      movable.contains(new Point(pos[0], pos[1]))
    );
    if (selected) {
      // dispatch.scene.selectLens(selected);
    } else {
      // dispatch.scene.deselect();
      this.elementSelected = false;
      // dispatch.scene.moveLightSource(this.start, this.start);
    }
  }

  public move(
    bias: number,
    endPos: [number, number],
    startPos: [number, number]
  ) {
    if (this.hasSelectedElement()) {
      // dispatch.scene.moveLens(bias);
    } else {
      // dispatch.scene.moveLightSource(startPos, endPos);
    }
  }

  public hasSelectedElement() {
    return this.elementSelected;
  }

  public deselect() {
    this.start = null;
    if (!this.hasSelectedElement()) {
      // dispatch.scene.deselect();
      this.elementSelected = false;
    }
  }
}
