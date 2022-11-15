export class Collection {
  #entries = new Map()

  constructor(name, entries = []) {
    if (entries) {
      entries.forEach(e => this.set(e))
    }
  }

  set(key, entry) {
    if (!key) return;
    this.#entries.set(key, entry || null);

    return this;
  }

  get(key) {
    return this.#entries.get(key) || null;
  }

  remove(key) {
    const item = this.get(key);

    this.#entries.delete(key);

    return item;
  }

  has(key) {
    return this.#entries.has(key) || null;
  }

  clear() {
    this.#entries.clear();
    return this;
  }

  each(callback) {
    if (!callback) return;

    this.values.forEach(callback);

    return this;
  }

  find(callback) {
    if (!callback) return;

    return this.values.find(callback)
  }

  findAll(callback) {
    if (!callback) return;

    return this.values.filter(callback)
  }

  get keys() { return [...this.#entries.keys()] }

  get values() { return [...this.#entries.values()] }

  get entries() { return [...this.#entries.entries()] }
}
