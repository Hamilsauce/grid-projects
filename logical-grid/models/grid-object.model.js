import { EventEmitter } from 'https://hamilsauce.github.io/hamhelper/event-emitter.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { utils } = ham;
// const { template, utils } = ham;

export class GridObject {
  #id;

  constructor() {
    this.#id = GridObject.#uuid(name)
  }

  get id() { return this.#id };

  get type() { return this.constructor.name.toLowerCase() };

  static #uuid(name) {
    return `${(name || 'o').slice(0,1).toLowerCase()}${utils.uuid()}`;
  }
}
