import { Graph, TILE_TYPE_INDEX } from './lib/store.js';
import { SVGCanvas } from './lib/SVGCanvas.js';
import { maps } from './maps.js';
import { copyTextToClipboard } from '../dfs-maze/lib/utils.js';
import { getTileSelector } from '../selection-box/SelectionBox.js';
import { initMapControls } from '../dfs-maze/ui/map-selection.js';
import { scheduleOscillator, AudioNote, audioEngine } from '../audio/index.js';

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { sleep, template, utils, download, TwoWayMap } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const useTemplate = (templateName, options = {}) => {
  const el = document.querySelector(`[data-template="${templateName}"]`).cloneNode(true)
  
  delete el.dataset.template
  
  if (options.dataset) Object.assign(el.dataset, options.dataset)
  
  if (options.id) el.id = options.id
  
  if (options.fill) el.style.fill = options.fill
  
  return el;
};


const audioNote1 = (new AudioNote(audioEngine))

const graph = new Graph();
graph.fromMap(maps.BABY_MAP_6X6)

// await sleep(1000)
// setTimeout(() => {
  const canvasEl = document.querySelector('#canvas');
  const svgCanvas = new SVGCanvas(canvasEl)
  
  const actor1 = useTemplate('actor', {
    dataset: { moving: false, teleporting: false },
    id: 'actor1'
  });
  
  const actor2 = useTemplate('actor', {
    dataset: { moving: false, teleporting: false },
    fill: '#C1723B',
    id: 'actor2'
  });
  
  initMapControls(graph, svgCanvas, actor1)
  
  const domPoint = (element, x, y) => {
    return new DOMPoint(x, y).matrixTransform(
      element.getScreenCTM().inverse()
    )
  };
  
  const setCanvasDimensions = (svgCanvas) => {
    if (svgCanvas.parentElement) {
      const { width, height } = svgCanvas.parentElement.getBoundingClientRect();
      
      svgCanvas.setAttribute('width', width);
      svgCanvas.setAttribute('height', height);
    }
    
    else {
      svgCanvas.setAttribute('width', window.innerWidth);
      svgCanvas.setAttribute('height', window.innerHeight);
    }
    
    return svgCanvas
  };
  
  const getAspectRatio = (svgCanvas) => {
    const { width, height } = svgCanvas.getBoundingClientRect();
    
    return width / height;
  };
  
  const ANIM_RATE = 75
  
  const app = document.querySelector('#app');
  const appBody = app.querySelector('#app-body')
  
  
  const scene = svgCanvas.dom.querySelector('#scene');
  const tileLayer = scene.querySelector('#tile-layer');
  const objectLayer = scene.querySelector('#object-layer');
  
  const selectionBox = getTileSelector(objectLayer)
  
  let selectedRange = []
  let getSelectedRange = () => [...tileLayer.querySelectorAll('.tile[data-selected="true"]')];
  
  const tileAt = (x, y) => tileLayer.querySelector(`.tile[data-y="${y}"][data-x="${x}"]`);
  
  const deselectRange = () => {
    getSelectedRange().forEach((t, i) => {
      t.dataset.selected = false;
    });
  }
  
  const getRange = ({ start, end }) => {
    let range = [];
    
    deselectRange()
    
    for (let x = start.x; x < end.x; x++) {
      for (let y = start.y; y < end.y; y++) {
        const tile = tileAt(x, y);
        
        tile.dataset.selected = true;
        
        range.push(tile);
      }
    }
    
    return range;
  };
  
  
  selectionBox.on('selection', range => {
    selectedRange = getRange(range);
    
    const { startPoint, endPoint } = selectionBox
    
    contextMenu.setAttribute(
      'transform',
      `translate(${endPoint.x+1.5},${endPoint.y-5}) rotate(0) scale(0.05)`,
    );
    
    graph.getRange(range, (tile) => tile.selected = true)
  });
  
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
    }
  }
  
  actor2.setAttribute('transform', 'translate(12,21) rotate(0) scale(1)')
  
  const contextMenu = useTemplate('context-menu');
  
  objectLayer.setAttribute('transform', 'translate(0,0) rotate(0) scale(1)')
  objectLayer.append(actor1, actor2, contextMenu);
  
  const sceneBCR = scene.getBoundingClientRect();
  const sceneBBox = scene.getBBox();
  const canvasViewBox = svgCanvas.viewBox;
  
  svgCanvas.setViewBox({
    x: -0.5,
    y: -0.5,
    width: graph.width + 1,
    height: graph.height + 1
  })
  
  svgCanvas.setCanvasDimensions()
  
  const pointerup$ = fromEvent(svgCanvas, 'pointerup')
  
  pointerup$.pipe(
    tap(x => pageScrolling.enable()),
  ).subscribe()
  
  
  const { width, height } = scene.getBoundingClientRect()
  
  graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
    tileLayer.append(
      svgCanvas.createRect({
        width: 1,
        height: 1,
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
  
  const lastX = tileLayer.lastElementChild.dataset.x;
  const lastY = tileLayer.lastElementChild.dataset.y;
  tileLayer.dataset.width = lastX;
  tileLayer.dataset.height = lastY;
  let isMoving = false;
  
  
  const goalTile = tileLayer.querySelector('[data-tile-type="goal"]');
  
  const oppositeDirMap = new TwoWayMap([
    ['up', 'down'],
    ['left', 'right'],
  ]);
  
  
  svgCanvas.addEventListener('click', async ({ detail }) => {
    if (isMoving) return;
    if (contextMenu.dataset.show === 'true') return;
    
    deselectRange();
    
    selectedRange = [];
    
    selectionBox.remove();
    
    let tile = detail.target.closest('.tile');
    let activeActor;
    
    const actorTarget = detail.target.closest('.actor');
    
    if (actorTarget) {
      const actors = [...scene.querySelectorAll('.actor')];
      activeActor = actors.find(t => actorTarget != t);
      tile = svgCanvas.querySelector(`.tile[data-x="${actorTarget.dataset.x}"][data-y="${actorTarget.dataset.y}"]`);
    }
    else {
      activeActor = actor1;
    }
    
    const pathNodes = svgCanvas.querySelectorAll('.tile[data-is-path-node="true"]');
    
    pathNodes.forEach((el, i) => { el.dataset.isPathNode = false });
    
    if (tile && tile.dataset.tileType !== 'barrier') {
      const activeTiles = svgCanvas.querySelectorAll('.tile[data-active="true"]');
      const highlightedTiles = svgCanvas.querySelectorAll('.tile[data-highlight="true"]');
      
      activeTiles.forEach((el, i) => { el.dataset.active = false });
      highlightedTiles.forEach((el, i) => { el.dataset.highlight = false });
      
      const pt = { x: +tile.dataset.x, y: +tile.dataset.y }
      
      const tileNode = graph.getNodeAtPoint(pt);
      
      const neighbors = graph.getNeighbors(tileNode);
      
      tile.dataset.active = true;
      
      [...neighbors.values()].forEach((node, i) => {
        const el = svgCanvas.querySelector(`.tile[data-x="${node.x}"][data-y="${node.y}"]`)
        el.dataset.highlight = true;
      });
    }
    
    const startNodeEl = svgCanvas.querySelector('.tile[data-current="true"]') || svgCanvas.querySelector('.tile[data-tile-type="start"]');
    
    const targetNodeEl = actorTarget ? tile : svgCanvas.querySelector('.tile[data-active="true"]');
    
    const startNode = graph.getNodeAtPoint({ x: +startNodeEl.dataset.x, y: +startNodeEl.dataset.y });
    
    const targetNode = graph.getNodeAtPoint({ x: +targetNodeEl.dataset.x, y: +targetNodeEl.dataset.y });
    
    const bfsPath = graph.getPath(startNode, targetNode);
    
    if (bfsPath === null) {
      return
    }
    
    let pointer = 0;
    let curr = bfsPath;
    
    let path = [];
    
    while (curr) {
      let previous = curr.previous
      path.push(curr);
      curr = previous;
    }
    
    path.reverse();
    curr = bfsPath[pointer];
    
    isMoving = true;
    activeActor.dataset.moving = isMoving;
    
    if (isMoving) {
      let dx;
      let dy;
      
      let intervalHandle = setInterval(async () => {
        curr = bfsPath[pointer];
        audioNote1.velocity(0.01).play()
        
        if (!curr) {
          isMoving = false;
          activeActor.dataset.moving = isMoving;
          clearInterval(intervalHandle);
        }
        
        else {
          
          const freqX = ((curr.x + 2) * 2) // < 120 ? 120 : ((curr.x + 1) * 2)
          const freqY = ((curr.y + 2) * 1.5) // < 120 ? 120 : ((curr.y + 1) * 1.5)
          
          let freq = ((freqX) * (freqY)) * 1.5
          freq = freq < 250 ? freq + 200 : freq
          freq = freq > 1600 ? 1200 - freq : freq
          freq = curr.tileType === 'teleport' ? freq + 250 : freq
          
          
          let vel = (0.5 - (pointer / bfsPath.length))
          vel = vel >= 0.5 ? 0.5 : vel
          
          vel = vel <= 0.075 ? 0.075 : vel
          const dur = 2 / bfsPath.length
          const startMod = ((pointer || 1) * 0.01)
          audioNote1
            .at(audioEngine.currentTime)
            .frequencyHz(freq)
            .duration(0.1)
            .velocity(vel).play()
          
          const el = svgCanvas.querySelector(`.tile[data-x="${curr.x}"][data-y="${curr.y}"]`);
          
          const lastX = +activeActor.dataset.x
          const lastY = +activeActor.dataset.y
          
          activeActor.dataset.x = curr.x
          activeActor.dataset.y = curr.y
          
          activeActor.setAttribute(
            'transform',
            `translate(${curr.x},${curr.y}) rotate(0) scale(1)`
          );
          
          svgCanvas.panViewport({
            x: (curr.x - (svgCanvas.viewBox.width / 2)) * 0.025,
            y: (curr.y - (svgCanvas.viewBox.height / 2)) * 0.025,
          })
          
          if (el === startNodeEl) {
            startNodeEl.dataset.current = false;
          }
          
          el.dataset.isPathNode = true;
          
          pointer++;
          
          if (el === goalTile) {
            console.warn('----- GOAL FOUND -----');
            
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
            
            const tels = [...svgCanvas.querySelectorAll('.tile[data-tile-type="teleport"]')];
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
  
  
  
  
  contextMenu.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    const targ = e.target.closest('li');
    
    const selectedTileTypeName = targ.dataset.value;
    
    const selectedTile = svgCanvas.layers.tile.querySelector('.tile[data-selected="true"]');
    const selectedTiles = selectedRange
    
    if (!targ || !selectedTile) return;
    
    const node = graph.getNodeAtPoint({
      x: +selectedTile.dataset.x,
      y: +selectedTile.dataset.y,
    })
    
    
    node.setType(selectedTileTypeName);
    
    selectedTile.dataset.tileType = selectedTileTypeName;
    selectedTile.dataset.selected = false;
    
    
    selectedRange.forEach((tile, i) => {
      const nodeModel = graph.getNodeAtPoint({
        x: +tile.dataset.x,
        y: +tile.dataset.y,
      })
      
      nodeModel.setType(selectedTileTypeName);
      
      if (selectedTileTypeName === 'teleport') {
        nodeModel.target = { x: 1, y: 1 }
      }
      
      tile.dataset.tileType = selectedTileTypeName;
    });
    
    deselectRange()
    
    selectionBox.remove()
    
    contextMenu.dataset.show = false;
  });
  
  svgCanvas.layers.tile.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation()
    
    const targ = e.target.closest('.tile');
    const tileType = targ.dataset.tileType
    // const listEl = targ.parentElement
    const listEl = contextMenu.querySelector('.context-menu-list.secondary')
    if (tileType === 'teleport') {
      const htmlListContainer = contextMenu.querySelector('.context-menu-container')
      const svgListContainer = contextMenu.firstElementChild
      
      const linkToItem = document.createElement('li');
      
      linkToItem.dataset.value = 'linkto'
      linkToItem.textContent = 'Link To...'
      linkToItem.classList.add('special-menu-item');
      listEl.append(linkToItem)
      
      const htmlHeight = getComputedStyle(htmlListContainer).height

      // svgListContainer.setAttribute('height', htmlHeight) 
    }
    
    else {
      const specItems = [...listEl.children]
      specItems.forEach((el, i) => {
        el.remove()
        
      });
    }
    targ.dataset.selected = true
    selectionBox.insertAt(targ);
    contextMenu.parentElement.append(contextMenu)
    
    contextMenu.setAttribute(
      'transform',
      `translate(${+targ.dataset.x+1.5},${+targ.dataset.y-2}) rotate(0) scale(0.05)`,
    );
    
    contextMenu.dataset.show = true;
    
    const blurContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      pageScrolling.enable();
      
      console.log(pageScrolling.isEnabled)
      if (contextMenu.dataset.show === 'true') {
        deselectRange();
        selectionBox.remove();
        
        contextMenu.dataset.show = false;
        contextMenu.setAttribute('transform', `translate(0,0) rotate(0) scale(0.05)`);
        
        svgCanvas.removeEventListener('click', blurContextMenu);
        
      }
      
      svgCanvas.dom.addEventListener('click', e => {
        svgCanvas.dispatchEvent(new Event('blurContextMenu'));
      })
      
      contextMenu.addEventListener('click', e => {
        svgCanvas.dispatchEvent(new Event('blurContextMenu'));
      })
      svgCanvas.dispatchEvent(new Event('blurContextMenu'));
    };
    svgCanvas.addEventListener('click', blurContextMenu);
    
  });
  
// }, 0)