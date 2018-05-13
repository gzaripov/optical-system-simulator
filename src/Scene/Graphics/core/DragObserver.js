export default class DragObserver {
  selected = -1;
  movables = [];

  addMovable(movables) {
    this.movables.push(...movables);
  }

  select(pos) {
    this.selected = this.movables.findIndex(movable => movable.contains(pos));
  }

  move(pos) {
    this.movables[this.selected].move(pos[0], pos[1]);
  }

  hasSelectedElement() {
    return this.selected !== -1;
  }

  deselect() {
    this.selected = -1;
  }
}
