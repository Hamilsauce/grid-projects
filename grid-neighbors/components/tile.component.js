export class TileView {

  #type;
  #address;

  constructor() {
    this.root;
  }

  create() {}

  neighbors() {}

  isNeighborOf() {}

  select() {}

  setState(stateObject) {
    /* Proxy for dataset  */

    Object.assign(this.#dataset, stateObject);

    return this;
  }

  setAttribute(k, v) {
    this.self.setAttribute(k, v)

    return this;
  }

  activate(isActive = true) {
    this.setState({ isActive });

    return this;
  }

  get isSelected() { return this.#dataset.isSelected === 'true' ? true : false }

  get isActive() { return this.#dataset.isActive === 'true' ? true : false }

  get #dataset() { return this.self.dataset }
}
