function stripClass(node, className) {
  node.className = node.className.replace(new RegExp(`(?:^|\\s)${className}(?!\\S)`), '');
}

function addClass(node, className) {
  if (node.className.indexOf(className) === -1) node.className += ` ${className}`;
}

class ButtonGroup {
  constructor(targetId, vertical, labels, selectionCallback) {
    this.selectionCallback = selectionCallback;
    this.selectedButton = 0;

    const target = document.getElementById(targetId);
    if (!target) {
      /* Silently failing is always the best option! I am a good developer! */
      return;
    }

    this.group = document.createElement(vertical ? 'ul' : 'div');
    this.group.className = vertical ? 'button-group-vert' : 'button-group-horz';
    this.buttons = [];

    for (let i = 0; i < labels.length; ++i) {
      const button = document.createElement(vertical ? 'li' : 'div');
      button.className = vertical ? 'button-vert' : 'button-horz';
      button.appendChild(document.createTextNode(labels[i]));

      this.buttons.push(button);
      this.group.appendChild(button);

      button.addEventListener(
        'click',
        function select(idx) {
          this.select(idx);
        }.bind(this, i),
      );
    }
    this.select(0);

    target.parentNode.replaceChild(this.group, target);
  }

  select(idx) {
    if (idx < 0 || idx >= this.buttons.length) return;

    stripClass(this.buttons[this.selectedButton], 'active');
    addClass(this.buttons[idx], 'active');

    if (this.selectedButton !== idx && this.selectionCallback) this.selectionCallback(idx);
    this.selectedButton = idx;
  }
}

class Slider {
  constructor(targetId, minValue, maxValue, hasLabel, callback) {
    const target = document.getElementById(targetId);
    if (!target) return;

    this.sliderBackground = document.createElement('div');
    this.sliderBackground.className = 'slider';

    this.minValue = minValue;
    this.maxValue = maxValue;
    this.callback = callback;

    this.sliderBar = document.createElement('div');
    this.sliderBar.className = 'slider-bar';
    this.sliderBackground.appendChild(this.sliderBar);

    this.sliderHandle = document.createElement('a');
    this.sliderHandle.className = 'slider-handle';
    this.sliderBackground.appendChild(this.sliderHandle);

    const mouseMoveListener = this.mouseMove.bind(this);
    function mouseUpListener() {
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
    }

    this.sliderHandle.addEventListener('mousedown', (event) => {
      event.preventDefault();
      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);
    });

    const parent = target.parentNode;
    parent.replaceChild(this.sliderBackground, target);

    if (hasLabel) {
      this.label = document.createElement('p');
      this.label.className = 'slider-label';
      parent.insertBefore(this.label, this.sliderBackground.nextSibling);
    }

    this.setPosition(0.45);
  }

  mouseMove(event) {
    const rect = this.sliderBackground.getBoundingClientRect();
    this.setPosition((event.clientX - rect.left) / (rect.right - rect.left));
  }

  setLabel(text) {
    if (this.label) this.label.textContent = text;
  }

  setValue(value) {
    value = Math.min(this.maxValue, Math.max(this.minValue, value));
    if (value !== this.value) {
      this.value = value;
      const percentage = Math.max(
        Math.min(
          Math.floor(100.0 * (value - this.minValue) / (this.maxValue - this.minValue)),
          100.0,
        ),
        0.0,
      );
      this.sliderHandle.style.left = `${percentage}%`;
      this.sliderBar.style.width = `${percentage}%`;

      if (this.callback) this.callback(value, this);
    }
  }

  setPosition(position) {
    this.setValue(Math.floor(this.minValue + position * (this.maxValue - this.minValue)));
  }

  show(show) {
    const display = show ? 'block' : 'none';
    this.sliderBackground.style.display = display;
    if (this.label) this.label.style.display = display;
  }
}

class ButtonGrid {
  constructor(targetId, numCols, labels, selectionCallback) {
    const target = document.getElementById(targetId);
    if (!target) return;

    this.cols = numCols;
    this.selectionCallback = selectionCallback;
    this.selectedButton = 0;

    this.container = document.createElement('div');
    this.container.className = 'button-grid';

    this.columns = [];
    for (let i = 0; i < this.cols; ++i) {
      const column = document.createElement('div');
      column.className = 'button-grid-column';

      this.container.appendChild(column);
      this.columns.push(column);
    }

    this.cells = [];
    for (let i = 0; i < labels.length; ++i) {
      const column = i % this.cols;
      const cell = document.createElement('div');
      cell.className = 'button stretch-button button-grid-button';
      cell.appendChild(document.createTextNode(labels[i]));

      if (i === 0) addClass(cell, 'button-grid-tl');
      if (i === this.cols - 1) addClass(cell, 'button-grid-tr');
      if (i + this.cols >= labels.length) {
        if (column === 0) addClass(cell, 'button-grid-bl');
        if (column === this.cols - 1 || i === labels.length - 1) addClass(cell, 'button-grid-br');
      }

      cell.addEventListener(
        'click',
        function selectIdx(idx) {
          this.select(idx);
        }.bind(this, i),
      );

      this.columns[column].appendChild(cell);
      this.cells.push(cell);
    }

    this.select(0);

    target.parentNode.replaceChild(this.container, target);
  }

  select(idx) {
    if (idx < 0 || idx >= this.cells.length) return;

    stripClass(this.cells[this.selectedButton], 'active');
    addClass(this.cells[idx], 'active');

    if (this.selectedButton !== idx && this.selectionCallback) this.selectionCallback(idx);
    this.selectedButton = idx;
  }

  show(show) {
    this.container.style.display = show ? 'flex' : 'none';
  }
}

const empty = () => {};

class MouseListener {
  constructor({
    target, mouseDownCallback, mouseUpCallback, mouseMoveCallback, scale,
  }) {
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
    const diff = newPoint.map((item, index) => item - this.mouseStart[index]);
    this.mouseMoveCallback(diff);
    this.mouseStart = newPoint;
  }

  mapMouseEvent(evt) {
    const rect = this.target.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    return [x / rect.width * 2 - 1, -(y / rect.height * 2 - 1)];
  }
}

export { ButtonGroup, Slider, ButtonGrid, MouseListener };
