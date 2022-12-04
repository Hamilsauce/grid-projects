// import { GridObject } from './index.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// import { EventEmitter } from 'https://hamilsauce.github.io/event-emitter.js';
const { template, utils } = ham;
import { Position } from './models/index.js';

const GRID_OBJECT_TYPES = new Set(['position', 'range', 'cell', 'row', 'column', 'grid'])


import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
import { EventEmitter } from 'https://hamilsauce.github.io/event-emitter.js';
const { utils } = ham;

export const OBJECT_TYPES = new Set(['view', 'model'])

export class LogicalGrid extends GridObject {
  #cells;
  #rows;
  #columns;
  #id;

  constructor(width, height, options) {
    super();


  };

  // get id() { return this.#id };

  // get type() { return this.#objectType };

  // static #uuid(name) {
  //   return `${(name || 'o').slice(0,1).toLowerCase()}${utils.uuid()}`;
  // }
};
