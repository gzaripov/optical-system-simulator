import { dispatch } from '@rematch/core';

export default class DragObserver {
  movables = [];
  elementSelected = false;

  setMovables(movables) {
    this.movables = [...movables];
  }

  select(pos) {
    const selected = this.movables.find(movable => movable.contains(pos));
    dispatch.scene.selectLens(selected);
    this.elementSelected = true;
  }

  move(pos) {
    if (this.hasSelectedElement()) {
      dispatch.scene.moveLens(pos);
    }
  }

  hasSelectedElement() {
    return this.elementSelected;
  }

  deselect() {
    if (!this.hasSelectedElement()) {
      dispatch.scene.deselect();
      this.elementSelected = false;
    }
  }
}
