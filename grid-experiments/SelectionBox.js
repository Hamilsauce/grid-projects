const SVG_NS = 'http://www.w3.org/2000/svg';

export class TileSelector {
  #self;
  #selectionBox;

  #points = {
    start: { x: null, y: null },
    end: { x: null, y: null },
  };

  #handles = {
    start: null,
    end: null,
  };

  constructor(ctx) {
    if (!ctx || !(ctx instanceof SVGElement)) return;

    this.ctx = ctx;

    this.#self = document.createElementNS(SVG_NS, 'g');

    this.#selectionBox = document.createElementNS(SVG_NS, 'rect');

    const start = document.createElementNS(SVG_NS, 'circle');
    start.classList.add('selection-handle');
    start.dataset.handle = 'start';
    start.id = 'start-handle';

    const end = document.createElementNS(SVG_NS, 'circle');
    end.classList.add('selection-handle');
    end.dataset.handle = 'end';
    end.id = 'end-handle';

    this.#handles = { start, end };

    this.init();

    this.#handles.start.addEventListener('pointermove', this.onDragHandle.bind(this));
    this.#handles.end.addEventListener('pointermove', this.onDragHandle.bind(this));
  }

  get parent() { return this.#self.parentElement };

  get isRendered() { return !!this.parent };

  get dom() { return this.#self };

  get startPoint() { return this.#points.start };

  get endPoint() { return this.#points.end };

  get boundingBox() { return this.#selectionBox.getBoundingClientRect() };

  get width() { return this.endPoint.x - this.startPoint.x || 1 }

  get height() { return this.endPoint.y - this.startPoint.y || 1 }

  get x() { return +this.#selectionBox.getAttribute('x') }

  get y() { return +this.#selectionBox.getAttribute('y') }


  domPoint(x, y, dir = 'floor') {
    const p = new DOMPoint(x, y).matrixTransform(
      this.ctx.getScreenCTM().inverse()
    )

    return { x: dir === 'floor' ? Math.floor(p.x) : Math.ceil(p.x), y: dir === 'floor' ? Math.floor(p.y) : Math.ceil(p.y) }
  }

  init() {
    this.#selectionBox.setAttribute('stroke-width', 0.07);
    this.#selectionBox.setAttribute('stroke', 'green');
    this.#selectionBox.setAttribute('fill', 'none');

    this.#self.append(this.#selectionBox);

    this.#handles.start.setAttribute('r', 0.25);
    this.#handles.start.setAttribute('fill', 'white');
    this.#handles.start.setAttribute('stroke-width', 0.07);
    this.#handles.start.setAttribute('stroke', 'green');

    this.#handles.end.setAttribute('r', 0.25);
    this.#handles.end.setAttribute('fill', 'white');
    this.#handles.end.setAttribute('stroke-width', 0.07);
    this.#handles.end.setAttribute('stroke', 'green');

    this.#self.append(this.#handles.start, this.#handles.end);
  }

  render() {
    if (this.isRendered) { this.remove(); }

    this.ctx.append(this.#self);

    return this;
  }

  insertAt(tile) {
    this.setStartPoint({
      x: +tile.dataset.x,
      y: +tile.dataset.y,
    });
  }

  remove() {
    if (this.isRendered) { this.#self.remove(); }

    this.resetPoints();

    return this;
  }

  setStartPoint({ x, y }) {
    this.#points.start = {
      x: +x,
      y: +y,
    }

    if (!this.endPoint || this.endPoint.x === null) {
      this.setEndPoint({ x: x + 1, y: y + 1 });
    }

    this.updateSelection();

    return this;
  }

  setEndPoint({ x, y }) {
    this.#points.end = {
      x: +x || null,
      y: +y || null,
    }

    this.updateSelection();

    return this;
  }

  resetPoints() {
    // this.#points = {
    //   start: { x: null, y: null },
    //   end: { x: null, y: null },
    // }
    this.setStartPoint({ x: null, y: null })
    this.setEndPoint({ x: null, y: null })
    return this;
  }

  updateSelection() {
    this.#selectionBox.setAttribute('width', this.width);
    this.#selectionBox.setAttribute('height', this.height);
    this.#selectionBox.setAttribute('x', this.startPoint.x);
    this.#selectionBox.setAttribute('y', this.startPoint.y);

    this.#handles.start.setAttribute('cx', this.startPoint.x);
    this.#handles.start.setAttribute('cy', this.startPoint.y);

    this.#handles.end.setAttribute('cx', this.endPoint.x);
    this.#handles.end.setAttribute('cy', this.endPoint.y);
  }

  onDragHandle(e) {
    const handle = e.target.closest('.selection-handle');
    const { clientX, clientY } = e;

    if (handle.dataset.handle === 'start') {
      this.setStartPoint(this.domPoint(clientX, clientY));
    }
    else {
      this.setEndPoint(this.domPoint(clientX, clientY));
    }

    this.emitRange()
  }

  emitRange() {
    this.#self.dispatchEvent(new CustomEvent('selection', { bubbles: true, detail: { start: this.startPoint, end: this.endPoint } }))
  }

}



let SelectorInstance = null;

export const getTileSelector = (ctx = document.querySelector('#scene')) => {
  if (SelectorInstance !== null) {
    return SelectorInstance;
  }

  SelectorInstance = new TileSelector(ctx);
  return SelectorInstance;
};
