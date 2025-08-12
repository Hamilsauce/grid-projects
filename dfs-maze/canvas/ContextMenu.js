import { CanvasObject, DefaultCanvasObjectOptions } from '../../dfs-maze/canvas/CanvasObject.js';

const contextMenuTransforms = [
{
  type: 'translate',
  values: [0, 0],
  position: 0,
},
{
  type: 'rotate',
  values: [0, 0, 0],
  position: 1,
},
{
  type: 'scale',
  values: [0.05, 0.05],
  position: 2,
}, ]

export class ContextMenu extends CanvasObject {
  constructor(ctx) {
    super(ctx, 'context-menu', contextMenuTransforms);
    
    this.root;
  };
  get prop() { return this._prop };
  set prop(newValue) { this._prop = newValue };
}