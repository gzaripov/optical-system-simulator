import { dispatch } from '@rematch/core';

export default class DragObserver {
  movables = [];
  elementSelected = false;
  start = null;

  setMovables(movables) {
    this.movables = [...movables];
  }

  select(pos) {
    this.start = [...pos];
    this.elementSelected = true;
    const selected = this.movables.find(movable => movable.contains(pos));
    if (selected) {
      dispatch.scene.selectLens(selected);
    } else {
      dispatch.scene.deselect();
      this.elementSelected = false;
      dispatch.scene.moveLightSource(this.start, this.start);
    }
  }

  move(bias, endPos, startPos) {
    if (this.hasSelectedElement()) {
      dispatch.scene.moveLens(bias);
    } else {
      dispatch.scene.moveLightSource(startPos, endPos);
    }
  }

  hasSelectedElement() {
    return this.elementSelected;
  }

  deselect() {
    this.start = null;
    if (!this.hasSelectedElement()) {
      dispatch.scene.deselect();
      this.elementSelected = false;
    }
  }
}
