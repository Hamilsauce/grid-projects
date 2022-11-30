export class GridObject {
  constructor() {}

  get type() { return this.constructor.name.toLowerCase() };
}
