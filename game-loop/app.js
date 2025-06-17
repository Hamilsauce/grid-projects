import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { DOM, date, array, utils, text } = ham;
import { TileSelector, getTileSelector } from './SelectionBox.js';
import { DetailPanel } from './view/detail-panel.view.js';

let currentPanel;
let currentSelection;

const State = {
  tileContainer: document.querySelector('#tile-container'),
  _selection: null,
  get selection() { return this._selection },
  set selection(v) {
    if (Array.isArray(v) && Array.isArray(this._selection)) {
      const deselected = this._selection.filter(t => !v.includes(t))

      deselected.forEach((t, i) => {
        t.dataset.selected = false;
      });
    }

    this._selection = v;
  }
}

export class UnitBoundingBox extends DOMRect {
  constructor(context, x = 0, y = 0, width = 0, height = 0) {
    super(x, y, width, height);

    this.ctx = context;
    this.normalize()
  }

  static roundPoint(p, dir = 'floor') {
    return { x: dir === 'floor' ? Math.floor(p.x) : Math.ceil(p.x), y: dir === 'floor' ? Math.floor(p.y) : Math.ceil(p.y) }
  }

  normalize() {
    Object.assign(this, UnitBoundingBox.roundPoint(this.domPoint(this.x, this.y)))
    this.width = this.width / this.ctx.closest('svg').viewBox.baseVal.width
    this.height = this.height / this.ctx.closest('svg').viewBox.baseVal.height
  }

  domPoint(x, y) {
    return new DOMPoint(x, y).matrixTransform(
      this.ctx.getScreenCTM().inverse()
    )
  }
}

const domPoint = (element, x, y) => {
  return new DOMPoint(x, y).matrixTransform(
    element.getScreenCTM().inverse()
  )
};

const roundPoint = (p, dir = 'floor') => {
  return { x: dir === 'floor' ? Math.floor(p.x) : Math.ceil(p.x), y: dir === 'floor' ? Math.floor(p.y) : Math.ceil(p.y) }
};

const translateElement = (svg, el, point) => {
  const elTransforms = el.transform.baseVal
  const translate = svg.createSVGTransform();

  elTransforms.clear();

  translate.setTranslate(point.x, point.y);
  elTransforms.appendItem(translate);
};

const drawTile = (p, s = 1, fill = 'black', className = 'tile', dataset) => {
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.classList.add(className);
  rect.dataset.x = p.x;
  rect.dataset.y = p.y;
  rect.dataset.selected = false;

  translateElement(canvas, rect, p);

  return rect;
};

const renderTiles = (container, w = 6, h = 12) => {
  const tiles = []
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      const tile = drawTile({ x: j, y: i }, 1, '#FFFFFF');

      tiles.push(tile)
    }
  }

  append(...tiles)
}

const append = (...tiles) => {
  tileContainer.append(...tiles)
}

const getPointOnBoard = (contextEl = scene, e) => {
  const p = domPoint(scene, e.clientX, e.clientY);
  const adjustedPoint = roundPoint(p, 'floor')
  return adjustedPoint
}

const getTileAtPoint = (contextEl = scene, e) => {
  const point = getPointOnBoard(contextEl, e);

  const targetTile = getTiles()
    .find((t, i) => {
      const unitTile = {
        x: t.x.baseVal.value,
        y: t.y.baseVal.value,
      }

      return +t.dataset.x == point.x && +t.dataset.y == point.y;
      return unitTile.x == point.x && unitTile.y == point.y;

      return !(
        point.y > unitTile.bottom ||
        point.x < unitTile.left ||
        point.y < unitTile.top ||
        point.x > unitTile.right
      )
    });

  return targetTile;
}

const getTiles = () => [...document.querySelectorAll('.tile')];

const tileAt = (x, y) => State.tileContainer.querySelector(`.tile[data-y="${y}"][data-x="${x}"]`);

const getElementStyle = el => getComputedStyle(el);

const initScene = (svg = new SVGSVGElement, scene = new SVGPathElement()) => {
  const sceneTransforms = scene.transform.baseVal;
  const translate = svg.createSVGTransform();
  sceneTransforms.clear();
  sceneTransforms.appendItem(translate);
  translate.setTranslate(-5, -10);
  surface.width.baseVal.value = 6;
  surface.height.baseVal.value = 12;
};

const getRange = ({ start, end }) => {
  const tileContainer = document.querySelector('#tile-container');
  let range = [];

  for (let y = start.y; y < end.y; y++) {
    for (let x = start.x; x < end.x; x++) {
      const tile = tileAt(x, y);

      tile.dataset.selected = true;

      range.push(tile);
    }
  }

  return range;
}



const handleTileClick = (e) => {
  const currFocused = [...document.querySelectorAll('rect[data-focused="true"]')];
  const activePanel = document.querySelector('.panel');
  const selectedTiles = document.querySelectorAll('.tile[data-selected="true"]');

  selectedTiles.forEach((t, i) => {
    t.dataset.selected = false;
  });

  const tile = getTileAtPoint(scene, e);

  if (activePanel && currentPanel && currentPanel instanceof DetailPanel) {
    activePanel.remove();
  }

  if (tile && tile.dataset.focused === 'true') {
    tile.dataset.focused = false;
  }

  else if (tile) {
    currFocused.forEach((t, i) => {
      t.dataset.focused = false;
    });

    currentPanel = new DetailPanel(tile);

    tile.dataset.focused = true;

    currentPanel.appendTo(scene);
    selectionBox.insertAt(tile)
  }
};

const canvas = document.querySelector('#svg');
const scene = document.querySelector('#scene');
const tileContainer = scene.querySelector('#tile-container');
const surface = scene.querySelector('#surface');
const viewBox = canvas.viewBox;


const selectionBox = getTileSelector(scene);

selectionBox.on('selection', range => {
  State.selection = getRange(range)
});

let pixelScale;

canvas.style.width = getElementStyle(canvas.parentElement).width;
canvas.style.height = getElementStyle(canvas.parentElement).height;

const canvasBBox = canvas.getBoundingClientRect()

Object.assign(viewBox.baseVal, {
  x: -(5.5),
  y: -(10.5),
  width: (7.5),
  height: (14.5),
});

pixelScale = canvasBBox.width / viewBox.baseVal.width
const unitBbox = new UnitBoundingBox(scene)
console.warn('unitBbox', unitBbox)
scene.append(selectionBox.dom);

canvas.addEventListener('click', e => {
  e.stopPropagation();
  e.preventDefault();

  handleTileClick(e);
});


{
  console.time('RENDER TILES');
  
  renderTiles(tileContainer, 7.5, 14.5);
  
  console.timeEnd('RENDER TILES');
}

initScene(canvas, scene);