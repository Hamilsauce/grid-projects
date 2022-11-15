import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils } = ham;
const CSS = `
  .grid-slot {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 25px;
    height: 25px;
    // width: fit-content;
    // height: fit-content;
    padding: 2px;
    gap: 0px;
    background: #223DDD;
    border: 1px solid #E4E4E4;
    overflow: hidden;
  }
  .grid-slot-content {
    width: 100%;
    height: 100%;
  }
`;


class GridSlot extends HTMLElement {
  #self;
  #style;
  #shadow;
  #type = 'GridSlot'

  static get observedAttributes() {
    return ['x', 'y'];
  }

  constructor() {
    const self = super();

    this.#self = self;

    this.#shadow = this.attachShadow({ mode: 'open' });

    this.#style = document.createElement('style');
    this.#style.textContent = CSS;

    this.#shadow.append(this.#style, template('grid-slot'))
  }

  get #contentElement() { return this.#shadow.querySelector('.grid-slot-content'); }

  get type() { return this.#type; }

  get x() { return +this.getAttribute('x') || null }

  set x(v) {
    if (v) { this.setAttribute('x', v); }
    else { this.removeAttribute('x'); }
  }

  get y() { return +this.getAttribute('y') || null }

  set y(v) {
    if (v) { this.setAttribute('y', v); }
    else { this.removeAttribute('y'); }
  }

  get isSlotted() { return +this.getAttribute('isSlotted') || null }

  set isSlotted(v) {
    if (v) { this.setAttribute('is-slotted', v); }
    else { this.removeAttribute('is-slotted'); }
  }

  insertContent(content) {
    this.#contentElement.append(content)
    this.isSlotted = true;
  }
  
  connectedCallback() {
    console.log('Custom square element added to page.');
    // updateStyle(this);
  }

  disconnectedCallback() {
    console.log('Custom square element removed from page.');
  }

  adoptedCallback() {
    console.log('Custom square element moved to new page.');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue
    }
  }
}

customElements.define('grid-slot', GridSlot);
