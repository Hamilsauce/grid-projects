import { GridObject } from './index.js';

export class Position extends GridObject {
  #row;
  #column;

  constructor({ row, column }) {
    if (isNaN(+row) || isNaN(+column)) throw new Error('Invalid row/col passed to Position')

    super();

    this.#row = row;

    this.#column = column;
  }

  get row() { return this.#row };

  get column() { return this.#column };

  get address() { return [this.row, this.column].toString() };
}
