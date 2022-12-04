import { GridObject } from './grid-object.model.js';
import { Position, Cell, Row, Column } from './index.js';

export class LogicalGrid extends GridObject {
  #name;
  #unit = 1;
  #width = 0;
  #height = 0;
  #cells = [];


  constructor(width, height, element = (row, column) => null) {
    super();

    this.#width = width || 0;

    this.#height = height || 0;

    for (let row = 0; row < this.#height; row++) {
      for (let column = 0; column < this.#width; column++) {
        this.#cells[row * this.#width + column] = element instanceof Function ? element(row, column) : null;
      }
    }
  }

  get(row, column) {
    return this.#cells[row * this.#width + column];
  }

  set(row, column, value = null) {
    if (value instanceof Function) {
      this.#cells[row * this.#width + column] = value(x, y);

    } else this.#cells[row * this.#width + column] = value;
  }
  
  range(start, end) {
    
  }

  insertColumn(column) {}
  
  insertRow(row) {}

  get name() { return this.#name };
};
