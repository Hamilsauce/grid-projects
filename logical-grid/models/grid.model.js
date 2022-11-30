import { GridObject } from './index.js';

export class LogicalGrid extends GridObject {
  #name;
  #unit = 1;
  #width = 0;
  #height = 0;


  constructor(name) {
    if (!name) throw new Error('No name passed to constructor for ', this.constructor.name);
    super();

    this.#name = name;
  }

  insertCell() {}

  insertRow() {}

  insertColumn() {}

  get name() { return this.#name };
};
