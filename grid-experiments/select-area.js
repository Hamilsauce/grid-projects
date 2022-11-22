// import {Board} from './board.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { DOM, date, array, utils, text } = ham;
import { TileSelector, getTileSelector } from './SelectionBox.js';
import { DetailPanel } from './view/detail-panel.view.js';

let currentPanel;
let currentSelection;

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
  elTransforms.clear()
  translate.setTranslate(point.x, point.y);
  elTransforms.appendItem(translate);
};

const drawRect = (p, s = 1, fill = 'black', className = 'tile') => {
  const rect = document.createElementNS(SVG_NS, 'rect');
  rect.style.fill = fill;
  rect.classList.add(className);
  rect.dataset.selected = false;
  rect.width.baseVal.value = s
  rect.height.baseVal.value = s
  rect.setAttribute('stroke', '#2A2B2CD1')
  rect.setAttribute('stroke-width', 0.025)

  translateElement(canvas, rect, p)
  return rect
};

const renderTiles = (container, w = 10, h = 20) => {
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      const tile = drawRect({ x: j, y: i }, 1, '#FFFFFF')
      tile.dataset.y = i;
      tile.dataset.x = j;
      container.appendChild(tile)
    }
  }
}

const appendTile = (tile) => {
  tileContainer.appendChild(tile)
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

const initScene = (svg = new SVGSVGElement, scene = new SVGPathElement()) => {
  const sceneTransforms = scene.transform.baseVal;
  const translate = svg.createSVGTransform();
  sceneTransforms.clear();
  sceneTransforms.appendItem(translate);
  translate.setTranslate(-5, -10);
  surface.width.baseVal.value = 10;
  surface.height.baseVal.value = 20;
};


const drawStart = (e) => {
  if (currentSelector) {
    currentSelector.remove();
    currentSelector = null;
  };

  const p = domPoint(scene, e.clientX, e.clientY);
  const adjustedPoint = roundPoint(p, 'floor');

  startP = adjustedPoint;
  isDrawing = true;
  scene.dataset.isDrawing = true;
  // currentSelector = drawRect(adjustedPoint, 1, '#FFFFFF20', 'selection')

  // scene.appendChild(currentSelector);
};

const drawMove = (e) => {
  const p = domPoint(scene, e.clientX, e.clientY);
  const adjustedPoint = roundPoint(p);

  console.log('adjustedPoint', adjustedPoint)

  if (isDrawing) {
    currentSelector.width.baseVal.value = adjustedPoint.x - startP.x;
    currentSelector.height.baseVal.value = adjustedPoint.y - startP.y;
console.log('selectionBox.boundingBox', selectionBox.boundingBox)
    // selectionBox.setEndPoint(adjustedPoint)

    getTiles().forEach((t, i) => {
      const unitTile = t.getBoundingClientRect();
      const selBbox = currentSelector.getBoundingClientRect();

      if (!(
          unitTile.top + 5 > selBbox.bottom ||
          unitTile.right - 5 < selBbox.left ||
          unitTile.bottom - 5 < selBbox.top ||
          unitTile.left + 5 > selBbox.right
        )) {
        t.dataset.selected = true;
      }
      else { t.dataset.selected = false; }
    });
  }
};

const drawStop = (e) => {
  const bbox = currentSelector.getBoundingClientRect();
  let { width, height } = bbox;

  width = Math.floor((width / pixelScale));
  height = Math.floor(height / pixelScale);
  isDrawing = false;
  scene.dataset.isDrawing = false;

  selectedRect = Object.assign(bbox, roundPoint(domPoint(canvas, bbox.x, bbox.y)), { width, height });

  let endpoint = roundPoint(domPoint(scene, e.clientX, e.clientY));

  selectionVector = [
    { x: startP.x - 1, y: startP.y - 1 },
    {
      x: endpoint.x - selectedRect.x,
      y: endpoint.y - selectedRect.y,
    }
  ];

  startP = null;
};

const handleTileClick = (e) => {
  const currFocused = [...document.querySelectorAll('rect[data-focused="true"]')];
  const activePanel = document.querySelector('.panel');
  const tile = getTileAtPoint(scene, e);

  if (activePanel && currentPanel && currentPanel instanceof DetailPanel) {
    activePanel.remove();
    // scene.removeChild(activePanel);
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


let startP;
let currentSelector;
let isDrawing = false;
let selectedRect = null;
let selectionVector;
let pixelScale;

canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';

const canvasBBox = canvas.getBoundingClientRect()

Object.assign(viewBox.baseVal, {
  x: -(5),
  y: -(10),
  width: (10),
  height: (20),
});

pixelScale = canvasBBox.width / viewBox.baseVal.width
const unitBbox = new UnitBoundingBox(scene)

scene.append(selectionBox.dom);

// canvas.addEventListener('pointerdown', e => {
//   drawStart(e);
// });

// canvas.addEventListener('pointermove', e => {
//   drawMove(e);
// });

// canvas.addEventListener('pointerup', e => {
//   drawStop(e);
// });

canvas.addEventListener('click', e => {
  e.stopPropagation();
  e.preventDefault();

  handleTileClick(e);
});

canvas.addEventListener('selection', e => {
  e.stopPropagation();
  e.preventDefault();
console.log('selection heard in app', e.detail);
  handleTileClick(e);
});


renderTiles(tileContainer, 10, 20);

initScene(canvas, scene);

getTiles().forEach((t, i) => {
  t.addEventListener('pointerleave', e => {
    console.warn('pointerleave', { x: +e.target.dataset.x, y: +e.target.dataset.y });
  });
});
