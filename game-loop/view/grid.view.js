import { View } from './view.js';
import { pointToAddress, addressToPoint } from '../../lib/tile-address.js';

export class GridView extends View {
  #tiles = new Map();
  
  constructor() {
    super('grid');

  }

  get prop() { return this.#prop };
  set prop(v) { this.#prop = v };
}