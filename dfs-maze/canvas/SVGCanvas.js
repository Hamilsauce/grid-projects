import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { createCustomEvent } from '../../dfs-maze/lib/create-event.js';
import { CanvasObject, DefaultCanvasObjectOptions } from '../../dfs-maze/canvas/CanvasObject.js';
const { addPanAction, template, utils, download, TwoWayMap } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

export class SVGCanvas extends EventTarget {
  #self = null;
  #isContextMenuActive = false;
  
  constructor(svg) {
    super();
    
    this.#self = svg;
    
    this.surfaceLayer = this.dom.querySelector('#surface-layer');
    
    this.surface = this.surfaceLayer.querySelector('#surface');
    
    this.layers = {
      surface: this.dom.querySelector('#surface-layer'),
      tile: this.dom.querySelector('#tile-layer'),
      object: this.dom.querySelector('#object-layer'),
    };
    
    this.layers.tile.addEventListener('contextmenu', (e) => {
      this.#isContextMenuActive = true;
      console.warn('this.isContextMenuActive ', this.isContextMenuActive);
      
      this.dom.addEventListener('click', this.toggleScroll);
      document.querySelector('#context-menu').addEventListener('click', this.toggleScroll);
    });
    
    this.addEventListener('blurContextMenu', (e) => {
      this.#isContextMenuActive = false;
      console.warn('PPOP.#blurContextMenu', this.#isContextMenuActive);
    });
    
    this.panAction$ = addPanAction(this.dom, (vb) => {
      // if (this.isContextMenuActive) {
      //   return
      // }
      this.panViewport(vb)
    })
    
    this.panAction$.subscribe()
    
    this.clickDOM$ = fromEvent(this.#self, 'click')
      .pipe(
        tap(e => {
          e.preventDefault();
          e.stopPropagation();
        }),
      );
    
    this.eventEmits$ = this.clickDOM$
      .pipe(
        map(({ type, target, clientX, clientY }) => {
          const point = this.domPoint(clientX, clientY)
          
          return {
            type,
            detail: {
              target,
              x: point.x,
              y: point.y,
            }
          }
        }),
        map(({ type, detail }) => createCustomEvent(type, detail)),
        tap((event) => this.dispatchEvent(event)),
      );
    
    this.toggleScroll = this.#toggleScroll.bind(this);
    this.clickDOMSubscription = this.eventEmits$.subscribe();
  }
  
  get dom() { return this.#self }
  
  get isContextMenuActive() { return this.#isContextMenuActive }
  
  get scene() { return this.#self.querySelector('#scene') }
  
  get parentElement() { return this.#self.parentElement }
  
  get viewBox() { return this.#self.viewBox.baseVal }
  
  get viewport() { return this.dom.getBoundingClientRect(); }
  
  useTemplate(templateName, options = {}) {
    const el = this.#self.querySelector(`[data-template="${templateName}"]`).cloneNode(true);
    
    delete el.dataset.template;
    
    if (options.dataset) Object.assign(el.dataset, options.dataset);
    
    if (options.id) el.id = options.id;
    
    if (options.fill) el.style.fill = options.fill;
    
    return el;
  };
  
  domPoint(x, y) {
    return new DOMPoint(x, y).matrixTransform(
      this.dom.getScreenCTM().inverse()
    );
  }
  
  createCanvasObject(type, options = DefaultCanvasObjectOptions) {
    const cObj = new CanvasObject(this, type, options);
    
    return cObj;
  }
  
  #toggleScroll(x, y) {
    this.#isContextMenuActive = !this.#isContextMenuActive;
    
    if (this.isContextMenuActive) {
      this.dom.removeEventListener('contextmenu', this.toggleScroll);
      this.dom.addEventListener('click', this.toggleScroll);
    } else {
      this.dom.addEventListener('contextmenu', this.toggleScroll);
      this.dom.removeEventListener('click', this.toggleScroll);
    }
  }
  
  createRect({ classList, width, height, x, y, textContent, dataset }) {
    const g = document.createElementNS(SVG_NS, 'g');
    const r = document.createElementNS(SVG_NS, 'rect');
    
    Object.assign(g.dataset, dataset);
    g.setAttribute('transform', `translate(${dataset.x},${dataset.y})`);
    g.classList.add(...(classList || ['tile']));
    g.id = 'rect' + utils.uuid();
    
    r.setAttribute('width', width);
    r.setAttribute('height', height);
    
    g.append(r);
    
    if (textContent) {
      const t = this.createText({ textContent });
      g.append(t);
    }
    
    return g;
  }
  
  createText({ textContent }) {
    const textNode = document.createElementNS(SVG_NS, 'text');
    textNode.style.fontSize = '0.0175rem';
    textNode.style.textAnchor = 'middle';
    textNode.style.dominantBaseline = 'middle';
    textNode.textContent = textContent;
    textNode.setAttribute('transform', 'translate(0.5,0.5)');
    
    return textNode;
  }
  
  setCanvasDimensions({ width, height } = {}) {
    if (+width) {
      height = +height ? height : width;
      
      this.#self.setAttribute('width', width);
      this.#self.setAttribute('height', height);
    }
    else if (this.parentElement) {
      const { width, height } = this.parentElement.getBoundingClientRect();
      
      this.#self.setAttribute('width', width);
      this.#self.setAttribute('height', height);
    }
    
    else {
      this.#self.setAttribute('width', window.innerWidth);
      this.#self.setAttribute('height', window.innerHeight);
    }
    
    return this;
  }
  
  panViewport({ x, y }) {
    Object.assign(this.viewBox, { x, y });
  }
  
  setViewBox({ x = 0, y = 0, width = 100, height = 100 }) {
    Object.assign(this.viewBox, { x, y, width, height, });
    
    setTimeout(() => {
      const tileBB = this.layers.tile.getBBox()
      this.surface.setAttribute('transform', `translate(0,0) rotate(0) scale(${tileBB.width/10},${tileBB.height/15})`);
    }, 0);
    
    return this;
  }
  
  // isInView(coords) {
  //   const { x, y, width, height } = this.viewBox;
  
  //   return coords.x >= x &&
  //     coords.y >= y &&
  //     coords.x <= width &&
  //     coords.y <= height;
  // }
  
  getPixelAspectRatio() {
    const { width, height } = this.#self.getBoundingClientRect();
    
    return width / height;
  }
  
  getAspectRatio() {
    const { width, height } = this.#self.getBBox();
    
    return width / height;
  }
  
  querySelector(selector) { return this.#self.querySelector(selector) }
  
  querySelectorAll(selector) { return [...this.#self.querySelectorAll(selector)] }
}