const SVG_NS = 'http://www.w3.org/2000/svg';


const domPoint = (element, x, y) => {
  return new DOMPoint(x, y).matrixTransform(
    element.getScreenCTM().inverse()
  )
};

const roundPoint = (p, dir = 'floor') => {
  return { x: dir === 'floor' ? Math.floor(p.x) : Math.ceil(p.x), y: dir === 'floor' ? Math.floor(p.y) : Math.ceil(p.y) }
};


export class TileSelector {
  #self;
  #selectionBox;



  #points = {
    start: null,
    end: null,
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
    start.id = 'start-handle';

    const end = document.createElementNS(SVG_NS, 'circle');
    end.classList.add('selection-handle');
    end.id = 'end-handle';

    this.#handles = { start, end };

    this.init();

    this.#handles.end.addEventListener('pointermove', this.onHandleDrag.bind(this));
  }

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

  insertAt(tile) {
    this.setStartPoint({
      x: +tile.dataset.x,
      y: +tile.dataset.y,
    });
  }

  render() {
    if (this.isRendered) {
      this.remove()
    }

    this.ctx.append(this.#self);

    return this;
  }

  remove() {
    if (this.isRendered) {
      this.#self.remove();
    }

    this.resetPoints();

    return this;
  }

  resetPoints() {

  }

  setStartPoint({ x, y }) {
    this.#points.start = {
      x: +x,
      y: +y,
    }

    this.setEndPoint({ x: x + 1, y: y + 1 });

    this.updateSelection();

    return this;
  }

  setEndPoint({ x, y }) {
    this.#points.end = {
      x: +x,
      y: +y,
    }

    this.updateSelection();

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

  onHandleDrag(e) {
    const { clientX, clientY } = e
    this.setEndPoint(this.domPoint(clientX, clientY))
  }

  get parent() { return this.#self.parentElement };

  get isRendered() { return !!this.parent };

  get dom() { return this.#self };

  get boundingBox2() { return this.#self.getBoundingClientRect() };

  get startPoint() { return this.#points.start };

  get endPoint() { return this.#points.end };

  get boundingBox() { return this.#selectionBox.getBoundingClientRect() };

  get width() {
    return this.endPoint.x -
      this.startPoint.x || 1

  }

  get height() { return this.endPoint.y - this.startPoint.y || 1 }

  get width2() { return +this.#selectionBox.getAttribute('width') }

  get height2() { return +this.#selectionBox.getAttribute('height') }

  get x() { return +this.#selectionBox.getAttribute('x') }

  get y() { return +this.#selectionBox.getAttribute('y') }
}

let SelectorInstance = null;

const getTileSelector = (ctx = document.querySelector('#scene')) => {
  if (SelectorInstance !== null) {
    return SelectorInstance;
  }
  SelectorInstance = new TileSelector()
  return SelectorInstance;

};