import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
// import {Cang} from './dfs-maze/canvas/CanvasObject.js';
const { template, utils } = ham;
const slot = document.querySelector('grid-slot');
console.log(slot);
setTimeout(() => {
  slot.setAttribute('x', 'fick')
  slot.x = 'fuck'

  slot.insertContent(template('tile'))
  console.log('slot.contentElement', slot.contentElement)
  console.log(' ', );
}, 1000)
