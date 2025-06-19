import { Graph } from './lib/store.js';
import { SVGCanvas } from './lib/SVGCanvas.js';
import { MAP_9X15_1, BLANK_MAP_9X15_1, maps } from './maps.js';

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

const { sleep, template, utils, download, TwoWayMap } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const graph = new Graph(maps.BIG_ASS_MAP);

const domPoint = (element, x, y) => {
  return new DOMPoint(x, y).matrixTransform(
    element.getScreenCTM().inverse()
  )
};

const useTemplate = (templateName, options) => {
  const el = document.querySelector(`[data-template="${templateName}"]`).cloneNode(true)
  
  delete el.dataset.template;
  
  el.id = `${templateName}-${utils.uuid()}`;
  
  return el;
};

const setCanvasDimensions = (canvas) => {
  if (canvas.parentElement) {
    const { width, height } = canvas.parentElement.getBoundingClientRect();
    
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
  }
  
  else {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
  }
  
  return canvas
};

const getAspectRatio = (canvas) => {
  const { width, height } = canvas.getBoundingClientRect();
  
  return width / height;
};

const updateStateDisplay = () => {
  const display = document.querySelector('#app-state-display');
  
  
};

const ANIM_RATE = 75

const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')

const canvasEl = document.querySelector('#canvas');
const canvas = new SVGCanvas(canvasEl)
const scene = document.querySelector('#scene');
const tileLayer = scene.querySelector('#tile-layer');
const surfaceLayer = scene.querySelector('#surface-layer');
const mapInput = document.querySelector('#map-input');
const objectLayer = scene.querySelector('#object-layer');

const actor1 = useTemplate('actor');
objectLayer.append(actor1);
objectLayer.setAttribute('transform', 'translate(0,0) rotate(0) scale(1)')


const sceneBCR = scene.getBoundingClientRect();
const sceneBBox = scene.getBBox();
const canvasViewBox = canvas.viewBox;

canvas.setViewBox({
  width: graph.width,
  height: graph.height
})

canvas.setCanvasDimensions()

const Mixin = {
  shit() {
    return this.dom || 'no dom'
  }
}

Object.assign(SVGCanvas.prototype, Mixin)

// console.warn({
//   sceneBCR,
//   sceneBBox,
//   canvasViewBox
// });

const mapInput$ = fromEvent(mapInput, 'change')
const pointerDown$ = fromEvent(canvas, 'click')

mapInput$.pipe(
  // tap(x => console.warn('CANVAS pointerDown$')),
  tap(({ target }) => {
    const sel = target.selectedOptions[0].value
    
    const selectedMap = maps[sel]
    graph.fromMap(selectedMap)
    
    canvas.setViewBox({
      x: 0,
      y: 0,
      width: graph.width,
      height: graph.height
    });
    
    canvas.layers.tile.innerHTML = ''
    
    graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
      if (tileType === 'start') {
        actor1.setAttribute('transform', `translate(${x},${y})`);
      }
      
      
      canvas.layers.tile.append(
        canvas.createRect({
          width: 1,
          height: 1,
          text: `${x},${y}`,
          classList: ['tile'],
          dataset: {
            tileType,
            x: x,
            y: y,
            current: false,
            active: false,
            isPathNode: false,
          },
        }))
    });
    
  }),
).subscribe()

pointerDown$.pipe(
  // tap(x => console.warn('CANVAS pointerDown$')),
  // map(({ target, clientX, clientY }) => {
  //   return domPoint(canvas, clientX, clientY)
  // }),
).subscribe()


const { width, height } = scene.getBoundingClientRect()

// const tiles = new Array(9 * 15).fill(null).map((_, i) => {})

graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
  // tileLayer.innerHTML = ''
  
  tileLayer.append(
    canvas.createRect({
      width: 1,
      height: 1,
      text: `${x},${y}`,
      classList: ['tile'],
      dataset: {
        tileType,
        x: x,
        y: y,
        current: false,
        active: false,
        isPathNode: false,
      },
    }))
});

let isMoving = false;


const goalTile = tileLayer.querySelector('[data-tile-type="goal"]');

canvas.addEventListener('click', async ({ detail }) => {
  if (isMoving) return;
  
  const tile = detail.target.closest('.tile');
  
  const pathNodes = canvas.querySelectorAll('.tile[data-is-path-node="true"]');
  
  pathNodes.forEach((el, i) => { el.dataset.isPathNode = false });
  
  if (tile && tile.dataset.tileType !== 'barrier') {
    const activeTiles = canvas.querySelectorAll('.tile[data-active="true"]');
    
    const highlightedTiles = canvas.querySelectorAll('.tile[data-highlight="true"]');
    
    activeTiles.forEach((el, i) => { el.dataset.active = false });
    
    highlightedTiles.forEach((el, i) => { el.dataset.highlight = false });
    
    const pt = { x: +tile.dataset.x, y: +tile.dataset.y }
    
    const tileNode = graph.getNodeAtPoint(pt);
    
    const neighbors = graph.getNeighbors(tileNode);
    
    tile.dataset.active = true;
    
    [...neighbors.values()].forEach((node, i) => {
      const el = canvas.querySelector(`.tile[data-x="${node.x}"][data-y="${node.y}"]`)
      el.dataset.highlight = true;
    });
  }
  
  const startNodeEl = canvas.querySelector('.tile[data-current="true"]') || canvas.querySelector('.tile[data-tile-type="start"]');
  
  const targetNodeEl = canvas.querySelector('.tile[data-active="true"]');
  
  const startNode = graph.getNodeAtPoint({ x: +startNodeEl.dataset.x, y: +startNodeEl.dataset.y });
  
  const targetNode = graph.getNodeAtPoint({ x: +targetNodeEl.dataset.x, y: +targetNodeEl.dataset.y });
  
  const dfsPath = graph.getPath(startNode, targetNode);
  // const linkedList = graph.toLinkedList(dfsPath)
  // console.log('linkedList', linkedList)
  if (dfsPath === null) {
    return
  }
  
  let oppositeDirMap = new TwoWayMap([
    ['up', 'down'],
    ['left', 'right'],
  ]);
  
  let pointer = 0;
  let curr = dfsPath;
  
  let path = [];
  
  while (curr) {
    let previous = curr.previous
    path.push(curr);
    curr = previous;
  }
  
  path.reverse();
  curr = dfsPath[pointer];
  
  isMoving = true;
  actor1.dataset.moving = isMoving;
  
  if (isMoving) {
    let dx;
    let dy;
    
    let intervalHandle = setInterval(async () => {
      curr = dfsPath[pointer];
      
      if (!curr) {
        clearInterval(intervalHandle);
        isMoving = false;
        actor1.dataset.moving = isMoving;
      }
      
      else {
        const el = canvas.querySelector(`.tile[data-x="${curr.x}"][data-y="${curr.y}"]`);
        
        
        
        actor1.setAttribute('transform', `translate(${curr.x},${curr.y})`);
        const isInView = canvas.isInView(curr)
        console.warn('isInView', isInView)
        
        // if (!isInView) {
        
        //   canvas.panViewport({
        //     x: curr.x - (canvas.viewBox.width / 2),
        //     y: curr.y - (canvas.viewBox.height / 2),
        //   })
        // }
        
        if (el === startNodeEl) {
          startNodeEl.dataset.current = false;
        }
        
        el.dataset.isPathNode = true;
        
        pointer++;
        
        if (el === goalTile) {
          // console.warn('----- GOAL FOUND -----');
        }
        
        if (el === targetNodeEl) {
          // console.warn('----- TARGET FOUND -----');
          el.dataset.active = true;
          el.dataset.current = true;
          
          return
        }
        
        if (el.dataset.tileType === 'teleport') {
          
          // let actorParent = actor1.parentElement
          
          // if (!actorParent) {
          //   objectLayer.append(actor1)
          // }
          // actor1.remove();
          // actor1.setAttribute('transform', `translate(${el.dataset.x},${el.dataset.y})`);
          actor1.dataset.teleporting = true;
          
          
          
          if (el === startNodeEl) {
            el.dataset.active = false;
            el.dataset.current = false;
            
            return
          }
          
          el.dataset.active = true;
          el.dataset.current = true;
          
          
          const tels = [...canvas.querySelectorAll('.tile[data-tile-type="teleport"]')]
          
          // el.dataset.current = false;
          
          const otherTele = tels.find(t => el != t && t.dataset.current != 'true')
          
          
          
          // otherTele.dataset.active = false;
          // otherTele.dataset.current = false;
          // el.dataset.active = false;
          
          // const actorParent = actor1.parentElement
          // actor1.remove();
          // actor1.style.opacity = 0
          actor1.setAttribute('transform', `translate(${el.dataset.x},${el.dataset.y})`);
          // actor1.style.opacity = 1
          
          // actorParent.append(actor1)
          
          el.dataset.active = false;
          el.dataset.current = false;
          
          
          otherTele.dataset.active = false;
          otherTele.dataset.current = false;
          await sleep(10)
          actor1.dataset.teleporting = false;
          
          // const startNodeEl = canvas.querySelector('.tile[data-current="true"]') || canvas.querySelector('.tile[data-tile-type="start"]');
        }
      }
      
      // console.log('interval');
    }, ANIM_RATE)
    
    // targetNodeEl.dataset.active = true;
    // targetNodeEl.dataset.current = true;
  }
});