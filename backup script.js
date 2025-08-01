import { Graph, TILE_TYPE_INDEX } from './lib/store.js';
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

const copyTextToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};


const useTemplate = (templateName, options = {}) => {
  const el = document.querySelector(`[data-template="${templateName}"]`).cloneNode(true)
  
  delete el.dataset.template
  
  if (options.dataset) Object.assign(el.dataset, options.dataset)
  
  if (options.id) el.id = options.id
  
  if (options.fill) el.style.fill = options.fill
  
  
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

const ANIM_RATE = 75

const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')

const canvasEl = document.querySelector('#canvas');
const canvas = new SVGCanvas(canvasEl)
const svgCanvas = new SVGCanvas(canvasEl)
const scene = document.querySelector('#scene');
const tileLayer = scene.querySelector('#tile-layer');
const surfaceLayer = scene.querySelector('#surface-layer');
const mapInput = document.querySelector('#map-input');
const objectLayer = scene.querySelector('#object-layer');


const pageScrolling = {
  get isEnabled() {
    return document.body.style.touchAction === 'none';
  },
  
  enable() {
    document.body.style.overflow = ''
    svgCanvas.dom.style.overflow = ''
    document.body.style.touchAction = ''
    svgCanvas.dom.style.touchAction = ''
    document.body.style.userSelect = ''
    svgCanvas.dom.style.userSelect = ''
    
  },
  
  disable() {
    document.body.style.overflow = 'hidden'
    svgCanvas.dom.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    svgCanvas.dom.style.touchAction = 'none'
    document.body.style.userSelect = 'none'
    svgCanvas.dom.style.userSelect = 'none'
    
    svgCanvas.dom.style.touchAction = 'none'
    console.warn('svgCanvas.dom.style.touchAction ', svgCanvas.dom.style.touchAction)
    
  }
  
}


const actor1 = useTemplate('actor', {
  dataset: { moving: false, teleporting: false },
  id: 'actor1'
});

const actor2 = useTemplate('actor', {
  dataset: { moving: false, teleporting: false },
  fill: '#C1723B',
  id: 'actor2'
});

actor2.setAttribute('transform', 'translate(12,21) rotate(0) scale(1)')

const contextMenu = useTemplate('context-menu');

objectLayer.setAttribute('transform', 'translate(0,0) rotate(0) scale(1)')
objectLayer.append(actor1, actor2, contextMenu);

const sceneBCR = scene.getBoundingClientRect();
const sceneBBox = scene.getBBox();
const canvasViewBox = canvas.viewBox;

canvas.setViewBox({
  width: graph.width,
  height: graph.height
})

canvas.setCanvasDimensions()

// console.warn({
//   sceneBCR,
//   sceneBBox,
//   canvasViewBox
// });

const mapInput$ = fromEvent(mapInput, 'change')
const pointerDown$ = fromEvent(canvas, 'click')
const pointerup$ = fromEvent(canvas, 'pointerup')

mapInput$.pipe(
  tap(({ target }) => {
    const sel = target.selectedOptions[0].value;
    
    const selectedMap = maps[sel];
    graph.fromMap(selectedMap);
    
    canvas.setViewBox({
      x: 0,
      y: 0,
      width: graph.width,
      height: graph.height
    });
    
    canvas.layers.tile.innerHTML = '';
    
    graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
      if (tileType === 'start') {
        actor1.setAttribute('transform', `translate(${x},${y})`);
      }
      
      canvas.layers.tile.append(
        canvas.createRect({
          width: 1,
          height: 1,
          textContent: `${x},${y}`,
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

pointerup$.pipe(
  tap(x => pageScrolling.enable()),
).subscribe()


const { width, height } = scene.getBoundingClientRect()

graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
  tileLayer.append(
    canvas.createRect({
      width: 1,
      height: 1,
      textContent: `${x},${y}`,
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
  if (contextMenu.dataset.show === 'true') return;
  
  let tile = detail.target.closest('.tile');
  let activeActor;
  
  const actorTarget = detail.target.closest('.actor');
  
  if (actorTarget) {
    const actors = [...scene.querySelectorAll('.actor')];
    activeActor = actors.find(t => actorTarget != t);
    tile = canvas.querySelector(`.tile[data-x="${actorTarget.dataset.x}"][data-y="${actorTarget.dataset.y}"]`);
  }
  else {
    activeActor = actor1;
  }
  
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
  
  const targetNodeEl = actorTarget ? tile : canvas.querySelector('.tile[data-active="true"]');
  
  const startNode = graph.getNodeAtPoint({ x: +startNodeEl.dataset.x, y: +startNodeEl.dataset.y });
  
  const targetNode = graph.getNodeAtPoint({ x: +targetNodeEl.dataset.x, y: +targetNodeEl.dataset.y });
  
  const dfsPath = graph.getPath(startNode, targetNode);
  
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
  activeActor.dataset.moving = isMoving;
  
  if (isMoving) {
    let dx;
    let dy;
    
    let intervalHandle = setInterval(async () => {
      curr = dfsPath[pointer];
      
      if (!curr) {
        clearInterval(intervalHandle);
        isMoving = false;
        activeActor.dataset.moving = isMoving;
      }
      
      else {
        const el = canvas.querySelector(`.tile[data-x="${curr.x}"][data-y="${curr.y}"]`);
        
        const lastX = +activeActor.dataset.x
        const lastY = +activeActor.dataset.y
        
        activeActor.dataset.x = curr.x
        activeActor.dataset.y = curr.y
        activeActor.setAttribute(
          'transform',
          `translate(${curr.x},${curr.y}) rotate(0) scale(1)`
        );
        
        canvas.panViewport({
          x: (curr.x - (canvas.viewBox.width / 2)) * 0.025,
          y: (curr.y - (canvas.viewBox.height / 2)) * 0.025,
        })
        
        if (el === startNodeEl) {
          startNodeEl.dataset.current = false;
        }
        
        el.dataset.isPathNode = true;
        
        pointer++;
        
        if (el === goalTile) {
          // console.warn('----- GOAL FOUND -----');
        }
        
        if (el === targetNodeEl) {
          el.dataset.active = true;
          el.dataset.current = true;
          
          return
        }
        
        if (el.dataset.tileType === 'teleport') {
          actor1.dataset.teleporting = true;
          
          if (el === startNodeEl) {
            el.dataset.active = false;
            el.dataset.current = false;
            
            return
          }
          
          el.dataset.active = true;
          el.dataset.current = true;
          
          const tels = [...canvas.querySelectorAll('.tile[data-tile-type="teleport"]')];
          const otherTele = tels.find(t => el != t && t.dataset.current != 'true');
          
          activeActor.dataset.x = el.dataset.x;
          activeActor.dataset.y = el.dataset.y;
          
          activeActor.setAttribute(
            'transform',
            `translate(${el.dataset.x},${el.dataset.y}) rotate(0) scale(1)`,
          );
          
          el.dataset.active = false;
          el.dataset.current = false;
          
          otherTele.dataset.active = false;
          otherTele.dataset.current = false;
          
          await sleep(10);
          
          activeActor.dataset.teleporting = false;
        }
      }
    }, ANIM_RATE)
  }
});


const saveButton = document.querySelector('#save-map')
saveButton.addEventListener('click', e => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  
  const graphOut = graph.toMap();
  copyTextToClipboard(graphOut)
  console.warn('graphOut\n\n', graphOut)
});


contextMenu.addEventListener('click', e => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  
  const targ = e.target.closest('li');
  const selectedTile = canvas.layers.tile.querySelector('.tile[data-selected="true"]');
  
  if (!targ || !selectedTile) return;
  
  const node = graph.getNodeAtPoint({
    x: +selectedTile.dataset.x,
    y: +selectedTile.dataset.y,
  })
  
  const selectedTileTypeName = targ.dataset.value;
  
  node.setType(selectedTileTypeName);
  
  selectedTile.dataset.tileType = selectedTileTypeName;
  selectedTile.dataset.selected = false;
  
  contextMenu.dataset.show = false;
});

canvas.layers.tile.addEventListener('contextmenu', e => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation()
  
  const targ = e.target.closest('.tile');
  
  targ.dataset.selected = true
  
  contextMenu.setAttribute(
    'transform',
    `translate(${+targ.dataset.x+1.5},${+targ.dataset.y-2}) rotate(0) scale(0.05)`,
  );
  
  contextMenu.dataset.show = true;
  
  const blurContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation()
    pageScrolling.enable();
    
    console.log(pageScrolling.isEnabled)
    if (contextMenu.dataset.show === 'true') {
      targ.dataset.selected = false;
      
      contextMenu.dataset.show = false;
      contextMenu.setAttribute('transform', `translate(0,0) rotate(0) scale(0.05)`);
      
      canvas.removeEventListener('click', blurContextMenu);
      svgCanvas.dispatchEvent('blurContextMenu');
      
    }
  };
  canvas.addEventListener('click', blurContextMenu);
});