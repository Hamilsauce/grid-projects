const SVG_NS = 'http://www.w3.org/2000/svg';

export class SelectionBox {
  #self;
  #selectionBox;
  #handles = {
    start: null,
    end: null,
  };

  constructor(initialPoint) {
    this.#self = document.createElementNS(SVG_NS, 'g');
    
    this.#selectionBox = document.createElementNS(SVG_NS, 'rect');

    const start = document.createElementNS(SVG_NS, 'circle');
    start.classList.add('selection-handle');
    start.id = 'start-handle';

    const end = document.createElementNS(SVG_NS, 'circle');
    end.classList.add('selection-handle');
    end.id = 'end-handle';

    this.#handles = { start, end, };

    this.init(initialPoint, 1);
  }

  appendTo(el) { el.appendChild(this.panel) }

  init(point, unitSize = 1) {
    this.#selectionBox.setAttribute('width', 1);
    this.#selectionBox.setAttribute('height', 1);
    this.#selectionBox.setAttribute('x', point.x);
    this.#selectionBox.setAttribute('y', point.y);
    this.#selectionBox.setAttribute('stroke-width', 0.07);
    this.#selectionBox.setAttribute('stroke', 'green');
    this.#selectionBox.setAttribute('fill', 'none');

    this.#self.appendChild(this.#selectionBox);

    this.#handles.start.setAttribute('r', 0.25);
    this.#handles.start.setAttribute('cx', point.x);
    this.#handles.start.setAttribute('cy', point.y);
    this.#handles.start.setAttribute('fill', 'white');
    this.#handles.start.setAttribute('stroke-width', 0.1);
    this.#handles.start.setAttribute('stroke', 'green');

    this.#handles.end.setAttribute('r', 0.25);
    this.#handles.end.setAttribute('cx', point.x + this.width);
    this.#handles.end.setAttribute('cy', point.y + this.height);
    this.#handles.end.setAttribute('fill', 'white');
    this.#handles.end.setAttribute('stroke-width', 0.07);
    this.#handles.end.setAttribute('stroke', 'green');

    this.#self.append(this.#handles.start, this.#handles.end);
  }

  removeFrom(el) {
    el.removeChild(this.panel);
  }

  get dom() { return this.#self };

  get boundingBox2() { return this.#self.getBoundingClientRect() };

  get boundingBox() { return this.#selectionBox.getBoundingClientRect() };

  get width() { return +this.#selectionBox.getAttribute('width') }

  get height() { return +this.#selectionBox.getAttribute('height') }

  get x() { return +this.#selectionBox.getAttribute('x') }

  get y() { return +this.#selectionBox.getAttribute('y') }
}