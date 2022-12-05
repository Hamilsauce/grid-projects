import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils } = ham;

const SVG_NS = 'http://www.w3.org/2000/svg';

const validatePoint = ({ x, y }) => {
  return !isNaN(+x) && !isNaN(+y) ? true : false
};

const validatePoints = (...points) => {
  return points.every(point => validatePoint(point))
};

export class TileSelector extends EventEmitter {
  #self;
  #selectionBox;
  #unitSize = 1;
  #points = {
    start: { x: null, y: null },
    end: { x: null, y: null },
  };

  #handles = {
    start: null,
    end: null,
  };

  constructor(ctx, options = {}) {
    if (!ctx || !(ctx instanceof SVGElement)) return;
    super();

    this.ctx = ctx;

    this.#unitSize = options.unitSize ? options.unitSize : this.#unitSize;

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

    this.dragHandler = this.onDragHandle.bind(this)
    this.dragEndHandler = this.onDragEnd.bind(this)

    this.#handles.start.addEventListener('pointermove', this.dragHandler);
    this.#handles.start.addEventListener('pointerup', this.dragEndHandler);
    this.#handles.end.addEventListener('pointermove', this.dragHandler);
    this.#handles.end.addEventListener('pointerup', this.dragEndHandler);
  }

  get parent() { return this.#self.parentElement };

  get isRendered() { return !!this.parent };

  get dom() { return this.#self };

  get startPoint() { return this.#points.start };

  get endPoint() { return this.#points.end };

  get boundingBox() { return this.#selectionBox.getBoundingClientRect() };

  get width() { return this.endPoint.x - this.startPoint.x || this.#unitSize }

  get height() { return this.endPoint.y - this.startPoint.y || this.#unitSize }

  get x() { return +this.#selectionBox.getAttribute('x') }

  get y() { return +this.#selectionBox.getAttribute('y') }

  get selectedDistance() {
    return this.getDistance(this.startPoint, this.endPoint)
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

    this.#handles.start.setAttribute('r', 0.33);
    this.#handles.start.setAttribute('fill', 'orange');
    this.#handles.start.setAttribute('stroke-width', 0.07);
    this.#handles.start.setAttribute('stroke', 'green');

    this.#handles.end.setAttribute('r', 0.33);
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
    this.render();

    this.setStartPoint({
      x: +tile.dataset.x,
      y: +tile.dataset.y,
    });

    this.updateSelection();

    this.emitRange();
  }

  remove() {
    if (this.isRendered) { this.#self.remove(); }

    this.resetPoints();

    return this;
  }

  setStartPoint({ x, y }) {
    if (!validatePoint({ x, y })) return console.error('Invalid point in selector');

    this.#points.start = {
      x: +x,
      y: +y,
    }

    if (!this.endPoint || this.endPoint.x === null) {
      this.setEndPoint({ x: x + this.#unitSize, y: y + this.#unitSize });
    }

    return this;
  }

  setEndPoint({ x, y }) {
    this.#points.end = {
      x: +x || null,
      y: +y || null,
    }

    return this;
  }

  resetPoints() {
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

  getDistance(from, to) {
    if (!validatePoints(from, to)) {
      console.error('Invalid point in selector');
      return null;
    }

    return (to.x + to.y) - (from.x + from.y);
  }

  onDragHandle(e) {
    const handle = e.target.closest('.selection-handle');

    if (!handle) return;

    const pt = this.domPoint(e.clientX, e.clientY);

    if (!validatePoint(pt)) return;

    if (handle.dataset.handle === 'start' && this.getDistance(this.endPoint, pt) <= -this.#unitSize) {
      this.setStartPoint(pt);
    }

    else if (this.getDistance(this.startPoint, pt) >= this.#unitSize) {
      this.setEndPoint(pt);
    }

    this.updateSelection();
  }

  onDragEnd(e) {
    this.emitRange()
  }

  emitRange() {
    this.emit('selection', { start: this.startPoint, end: this.endPoint })
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