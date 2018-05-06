export default class DragObserver {
  selected = -1;
  movables = [];

  addMovable(movables) {
    this.movables.push(...movables);
  }

  select(pos) {
    console.log("select");
    this.selected = this.movables.findIndex(movable => movable.contains(pos));
    console.log(this.selected);
  }

  move(pos) {
    this.movables[this.selected].move(pos[0], pos[1]);
  }

  hasSelectedElement() {
    return this.selected !== -1;
  }

  deselect() {
    console.log("unselect");
    this.selected = -1;
    console.log(this.selected);
  }
}
