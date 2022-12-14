import { Position } from './position.model.js';

export class Cell extends Position {
  #value;

  constructor({ row, column, value }) {
    super({ row, column });

    this.#value = value || null;
  }

  get value() { return this.#value };
}
