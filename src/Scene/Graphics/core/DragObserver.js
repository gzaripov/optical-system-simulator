export default class DragObserver {
  selected = null;
  movables = [];

  addMovable(movables) {
    this.movables.push(...movables);
  }

  select(pos) {
    const { movables } = this;
    //console.log(pos);
    this.selected = movables.find(movable => movable.contains(pos)) || null;
  }

  move(pos) {
    const { selected } = this;

    selected && selected.move(pos[0], pos[1]);
  }

  unselect() {
    this.selected = null;
  }
}
