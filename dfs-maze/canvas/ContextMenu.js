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
}];

const defaultContextMenuItems = [
{
  type: 'tile-type',
  value: 'empty',
  textContent: 'Empty',
  list: 'primary',
},
{
  type: 'tile-type',
  value: 'barrier',
  textContent: 'Barrier',
  list: 'primary',
},
{
  type: 'tile-type',
  value: 'start',
  textContent: 'Start',
  list: 'primary',
},
{
  type: 'tile-type',
  value: 'goal',
  textContent: 'Goal',
  list: 'primary',
},
{
  type: 'tile-type',
  value: 'teleport',
  textContent: 'Teleport',
  list: 'primary',
},
{
  type: 'tile-action',
  value: 'link-teleport',
  textContent: 'Link to...',
  list: 'secondary',
}, ];

export class ContextMenu extends CanvasObject {
  #menuItems = {
    primary: [],
    secondary: [],
  };
  
  #menuLists = {
    primary: null,
    secondary: null,
  };
  
  
  constructor(ctx, menuItems = defaultContextMenuItems) {
    super(ctx, 'context-menu', contextMenuTransforms);
    
    this.#menuLists = {
      primary: this.getEl('.context-menu-list.primary'),
      secondary: this.getEl('.context-menu-list.secondary'),
    }
    
    this.#menuItems = menuItems.reduce((items, {
      type,
      value,
      textContent,
      list,
    }, i) => {
      const el = document.createElement('li');
      
      el.dataset.value = value;
      el.dataset.type = type;
      el.textContent = textContent;
      items[list].append(el);
      
      return items;
    }, this.#menuItems);
  };
  
  onMenuClick(e) {
    const value = e.target.dataset.value
    this.dispatchEvent('')
  }
  
  toggleSecondaryMenu() {}
  
  get prop() { return this.#prop };
  
  get prop() { return this.#prop };
  
  set prop(newValue) { this._prop = newValue };
}