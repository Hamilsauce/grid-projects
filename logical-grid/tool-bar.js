export class Toolbar {
  #self;
  #buttonActionMap = new Map();

  constructor(el = document.createElement('div'), options) {
    this.#self = el;

    this.self.querySelectorAll('.tool-button')
      .forEach((b, i) => {
        console.log('b, i', b, i)
        this.#buttonActionMap.set(b, b.dataset.action)
      });

    this.self.addEventListener('click', this.handleClick.bind(this));
  };

  get self() { return this.#self };

  // set prop(v) { this.#prop = v };

  handleClick(e) {
    const action = this.getAction(e);
  console.log('new CustomEvent([Toolbar] Action, { bubbles: true, detail: { action } })', new CustomEvent('[Toolbar] Action', { bubbles: true, detail: { action } }))
    if (action) {
      this.self.dispatchEvent(new CustomEvent('[Toolbar] Action', { bubbles: true, detail: { action } }))
    }
  }

  getAction(event) {
    const btn = event.target.closest('.tool-button')
    if (btn) {
      return this.#buttonActionMap.get(btn)
    }

    return null;
  }
}
