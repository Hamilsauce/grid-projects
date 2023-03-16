import { Graph } from './lib/store.js';
import { MAP_9X15_1 } from './maps.js';

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, download, TwoWayMap } = ham;


const graph = new Graph(MAP_9X15_1);

// console.log('graph', graph)

const domPoint = (element, x, y) => {
  return new DOMPoint(x, y).matrixTransform(
    element.getScreenCTM().inverse()
  )
};

const createRect = ({ classList, width, height, x, y, text, dataset }) => {
  const g = document.createElementNS(SVG_NS, 'g');
  const r = document.createElementNS(SVG_NS, 'rect');
  // console.log('dataset', dataset)
  Object.assign(g.dataset, dataset);
  g.setAttribute('transform', `translate(${dataset.x},${dataset.y})`);

  r.setAttribute('width', width);

  r.setAttribute('height', height);

  g.classList.add(...(classList || ['tile']));

  g.append(r);

  if (text) {
    g.append(createText({ textContent: text }));
  }

  return g;
};


const createText = ({ textContent }) => {
  const textNode = document.createElementNS(SVG_NS, "text");
  textNode.style.fontSize = '0.0175rem';
  textNode.style.textAlign = 'center';
  textNode.textContent = textContent;
  textNode.setAttribute('transform', 'translate(0.29,0.60)');

  return textNode;
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



const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')

const canvas = document.querySelector('#canvas');
const scene = document.querySelector('#scene');
const tileLayer = scene.querySelector('#tile-layer');
const actor1 = scene.querySelector('#actor1');
const actor2 = scene.querySelector('#actor2');

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

const pointerDown$ = fromEvent(canvas, 'click')

pointerDown$.pipe(
    map(({ target, clientX, clientY }) => {
      return domPoint(canvas, clientX, clientY)
    }),
    // tap(x => console.log('TAP', x)),
  )
  .subscribe()


const { width, height } = scene.getBoundingClientRect()

// const tiles = new Array(9 * 15).fill(null).map((_, i) => {})

graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
  tileLayer.append(createRect({
    width: 1,
    height: 1,
    text: `${x},${y}`,
    classList: ['tile'],
    dataset: {
      tileType,
      x: x,
      y: y,
    },
  }))
});

let isMoving = false;
canvas.addEventListener('click', e => {
  if (isMoving) return;
  const tile = e.target.closest('.tile');

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

  const goalNodeEl = canvas.querySelector('.tile[data-active="true"]');

  const startNode = graph.getNodeAtPoint({ x: +startNodeEl.dataset.x, y: +startNodeEl.dataset.y });

  const targetNode = graph.getNodeAtPoint({ x: +goalNodeEl.dataset.x, y: +goalNodeEl.dataset.y });

  const dfsPath = graph.getPath(startNode, targetNode)

  let oppositeDirMap = new TwoWayMap([
    ['up', 'down'],
    ['left', 'right'],
  ]);

  let pointer = 0;
  let curr = dfsPath
  let path = []

  while (curr) {
    let previous = curr.previous
    path.push(curr);
    curr = previous;
  }

  path.reverse();
  curr = path[pointer];

  isMoving = true;
 
  if (isMoving) {
    let intervalHandle = setInterval(() => {
      curr = path[pointer];
      if (!curr) {
        clearInterval(intervalHandle);
        isMoving = false;
      }

      else {
        const el = canvas.querySelector(`.tile[data-x="${curr.x}"][data-y="${curr.y}"]`);
        actor1.setAttribute('transform', `translate(${curr.x-1},${curr.y-1})`)
        console.log('actor1', actor1)
        if (el === startNodeEl) {
          startNodeEl.dataset.current = false;
        }

        el.dataset.isPathNode = curr.isPathNode;

        pointer++;
      }
    }, 75)

    goalNodeEl.dataset.active = false;
    goalNodeEl.dataset.current = true;
  }
});