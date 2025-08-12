import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import { TransformList } from '../../dfs-maze/canvas/TransformList.js';
import { SVGCanvas } from '../../dfs-maze/canvas/SVGCanvas.js';

export const DefaultCanvasObjectOptions = {
  id: '',
  classList: [],
  dataset: {
    active: false,
    selected: false,
  },
  attributes: {
    fill: '#000000',
    stroke: '#FFFFFF',
    'stroke-width': 0.05,
    r: 0.4,
    width: 1,
    height: 1,
  },
  transforms: [],
}

export class CanvasObject extends EventEmitter {
  #context;
  #type;
  #id;
  #self;
  #transformList;
  
  constructor(context = new SVGCanvas(), type, options = DefaultCanvasObjectOptions) {
    super();
    this.#context = context;
    this.#type = type;
    this.#id = options.id;
    this.#self = this.#context.createCanvasObject(type, options);
    this.#transformList = new TransformList(this.#context, this.#self)
  }
  
  get context() { return this.#context }
  
  get self() { return this.#self }
  
  get transforms() { return this.#transformList }
  
  get type() { return this.#type }
  
  get id() { return this.#id }
  
  get layer() { return this.self.closest('g.layer') }
  
  
  translate() {}
  rotate() {}
  scale() {}

  remove() {}
}