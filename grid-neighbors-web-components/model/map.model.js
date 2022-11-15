import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { utils } = ham;


export class GridGraph {
  dims = {};
  constructor() {
    this.root;
  }
  
  createGrid(nodes) {
    if (!nodes) {
      this.dims = {
        y: 25,
        width : 25
      }
      
      
    }
  }
  
  
  get prop() { return this.#prop };
  set prop(v) { this.#prop = v };
}
