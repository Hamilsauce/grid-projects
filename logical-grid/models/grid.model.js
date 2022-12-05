import { GridObject } from './grid-object.model.js';
import { Position, Cell, Row, Column } from './index.js';


class Griderator {
  constructor(grid) {
    this.x = 0;
    this.y = 0;
    this.grid = grid;
  }

  next() {
    if (this.y == this.grid.height) return { done: true };

    let value = {
      x: this.x,
      y: this.y,
      value: this.grid.get(this.y, this.x)
    };

    this.x++;

    if (this.x == this.grid.width) {
      this.x = 0;
      this.y++;
    }

    return { value, done: false };
  }
}

export class LogicalGrid extends GridObject {
  #name;
  #unit = 1;
  #width = 0;
  #height = 0;
  #cells = new Map();

  constructor(width, height, element = (row, column) => null) {
    super();

    this.#width = width || 0;

    this.#height = height || 0;

    for (let row = 0; row < this.#height; row++) {
      for (let column = 0; column < this.#width; column++) {
        this.#cells.set([row, column].toString(), element instanceof Function ? element(row, column) : null);
      }
    }
  }

  get height() { return this.#height }

  get width() { return this.#width }

  get(row, column) {
    return this.#cells.get([row, column].toString()) //[row * this.#width + column];
  }

  set(row, column, value = null) {
    this.#width = column >= this.#width ? column : this.#width
    this.#height = row >= this.#height ? row : this.#height

    if (value instanceof Function) {
      this.#cells.set([row, column].toString(), value(x, y));

    } else this.#cells.set([row, column].toString(), value)
  }

  range(start, end) {

  }

  insertColumn(values = []) {
    for (let row = 0; row < this.#height; row++) {
      this.#cells.set([row, this.#width].toString(), values[row] || null)
    }

    this.#width += 1
  }
  
  removeColumn(column = this.#width) {
    for (let row = 0; row < this.#height; row++) {
      this.#cells.delete([row, column].toString());
    }

    this.#width -= 1
  }
 
  insertRow(values) {
    for (let column = 0; column < this.#width; column++) {
      this.#cells.set([this.#height, column].toString(), values[column] || null)
    }

    this.#height += 1
  }
  
  removeRow(row = this.#height) {
    for (let column = 0; column < this.#width; column++) {
      this.#cells.delete([row, column].toString());
    }

    this.#height -= 1
  }

  print() {
    return [...this.#cells]
      .sort(([aAdd, aVal], [bAdd, bVal]) => {
        const [aRow, aCol] = aAdd.split(',').map(_ => +_)
        const [bRow, bCol] = bAdd.split(',').map(_ => +_)

        if (aRow === bRow) {
          return aCol - bCol
        } else return aRow - bRow

      })
      .reduce((acc, [address, value], i) => {
        const [row, column] = address.split(',').map(_ => +_)
        return `${acc}${column===0 ? '\n\n' : ' | '}${value}`.trim()
      }, '');
  }

  [Symbol.iterator]() {
    return new Griderator(this);
  };
};
