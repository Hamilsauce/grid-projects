import { DIRECTIONS } from '../../lib/Constants.js';
import { TileView } from './tile.component.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

/*
  Grid Location
*/

export class GridLocation {
  constructor() {
    this.root;
  }
}


/*
  RANGE
  
  Represents a collection of Locations
  
*/

export class Range {
  constructor() {
    this.root;
  }

}

/*
  GRID VIEW
  
  Contains matrix of grid Slots/Cells/Locations 
  that can contain Tiles. 
*/

export class GridView {
  constructor(dims, savedTiles) {
    this.dims = dims
    this.tiles = new Map();

    this.createGrid(dims,savedTiles)

    this.clickHandler = this.handleClick.bind(this);

    this.self.addEventListener('click', this.clickHandler)

    this.clicks$ = fromEvent(this.self, 'click').pipe(
      tap(this.clickHandler),
      map(e => {
        const t = e.target.closest('.tile');
        const bb = t.getBoundingClientRect();

        return bb
      }),
      tap(x => console.log('x', x)),
      tap(payload => pushEventsFn('tile:click', payload)),
    )
    // .subscribe()
  }

  get boundingBox() {
    return this.self.getBoundingClientRect()
  }

  get height() {
    return this.dims.height
  }

  get width() {
    return this.dims.width
  }

  // set dims({ width, height, tilesize }) {

  //   return this.dims.width
  // }

  get self() {
    return document.querySelector(`.grid`)
  }

  get activeTile() {
    return document.querySelector(`[data-active=true]`)
  }

  get targetTile() {
    return document.querySelector(`[data-target=true]`)
  }

  get selectedTiles() {
    return this.self.querySelectorAll('.tile[data-selected=true]')
  }

  get pathTiles() {
    return this.self.querySelectorAll('.tile[data-is-path-node=true]')
  }

  get mapOffset() {
    // TODO REMOVE HARD CODING
    const padding = { x: 2, y: 2 }

    return {
      x: 0 + 2,
      y: 37 + 2
    }
  }

  getPath(path = [this.activeTile], endNode = this.targetTile) {
    setTimeout(() => {
      console.log('get path', );
      const node = path[path.length - 1];

      if (!node || !node.dataset) {
        return path;
      }
      node.dataset.isPathNode = true

      if (node === endNode) {
        return path;
      }

      const neighbors = Object.entries(node.neighbors())
        .filter(([dir, neighbor], i) => {
          return neighbor && [undefined, null].includes(neighbor.dataset.isPathNode)
        })

      if (!neighbors) {
        node.dataset.isPathNode = false
        path.pop()

        return path // this.getPath(path);
      }

      neighbors.forEach(([dir, neighbor], i) => {

        if (neighbor.dataset.isPathNode !== 'false' && neighbor && !path.includes(neighbor)) {

          path.push(neighbor);

        }
        else {
          neighbor.dataset.isPathNode = false
          path.pop()
          return path
        }

        return this.getPath(path)
      });
    }, 50)
  }

  getNeighbor(tile, dir) {
    if (!tile || !dir) return null;

    const [tileY, tileX] = this.parseTileAddress(tile);

    const [dirY, dirX] = DIRECTIONS[dir]

    const n = document.querySelector(`[data-address="${[tileY + dirY, tileX + dirX].toString()}"]`);

    return n;
  }

  getNeighbors(tile) {
    if (!tile) {
      return
    };
    const [tileY, tileX] = this.parseTileAddress(tile);

    return Object.entries(DIRECTIONS)
      .reduce((neighbors, [dirName, { y, x }]) => {
        const conditional = false
        const n = document.querySelector(`[data-address="${[tileY + y, tileX + x].toString()}"]`);
        const type = n ? n.dataset.tileType : null;

        return !n || type === 'barrier' ? neighbors : { ...neighbors, [dirName]: n }
      }, {})
  }



  update(type, update) {
    console.warn('update', update)
    Object.assign(this.dims, {
      [update.name]: update.value })
    console.warn('this.dims', this.dims)

    this.createGrid(this.dims)
    // if (type === 'dims') {

    // }
  }

  createGrid(dims, savedTiles) {
    this.tiles.clear();
    this.self.innerHTML = '';

    this.setGridSize(dims);
    // if (savedTiles) {

    // } else {
    console.log('savedTiles', savedTiles)
      for (let y = 0; y < dims.height; y++) {
        for (let col = 0; col < dims.width; col++) {
        const type = savedTiles && savedTiles[y][col] ? savedTiles[y][col].type : 'empty'
          this.insertTile(y, col, type);
        }
      }

      this.self.append(...[...this.tiles.values()]);
    // }
  }

  getRangeVector(rangeAddress) {
    const vect = rangeAddress.includes(':') ?
      rangeAddress.split(':').reduce((acc, curr, i) => {
        const key = i === 0 ? 'start' : 'end'

        return {
          ...acc,
          [key]: {
            ...acc[key],
            y: +curr.split(',')[0],
            x: +curr.split(',')[1]
          }
        }
      }, defaultRange) : {
        y: +rangeAddress.split(',')[0],
        x: +rangeAddress.split(',')[1],
      }

    return vect
  }

  setDimensions(dims = {}) {
    const dimNames = ['width', 'height', 'unitSize', 'scale']
    const cleaned = Object.fromEntries(Object.entries(dims).filter(([k, v]) => dimNames.includes(k) && !!(+v)))

    Object.assign(this.dims, cleaned);

    this.setGridSize(cleaned);
  }

  // setGridTemplateSize(dims) {
  //   this.dims = dims ? dims : this.dims
  //   this.self.style.gridTemplateColumns = `repeat(${ dims.width || this.#dimensions.width }, ${this.#dimensions.scale}px)`;
  //   this.self.style.gridTemplateRows = `repeat(${ dims.height || this.#dimensions.height }, ${this.#dimensions.scale}px)`;
  // }

  parseTileAddress(tile) {
    console.assert(tile && tile.dataset, 'no tile', tile);

    return tile.dataset.address.split(',').map(_ => +_);
  }

  activateNeighbor(dir) {
    this.activateTile(this.activeTile.neighbors()[dir]);
    this.selectNeighbors()
    return this;
  }

  getTile(y, x) {
    return this.body.querySelector('.tile[data-')
  }

  activateTile(tile) {
    if (tile === null && this.activeTile) {

      for (let [dir, n] of Object.entries(this.activeTile.neighbors())) {
        Object.assign(n.dataset, {
          highlight: false,
          selected: false,
        });

        for (let c of n.classList.entries()) {
          if (c && c !== 'tile') {
            n.classList.remove(c);
          }
        }
      }

      this.activeTile.dataset.selected = false;
      this.activeTile.dataset.active = false;

      return null;
    }

    if (!tile || !tile.classList.contains('tile')) return;

    if (this.activeTile) {
      const neighbors = this.activeTile.neighbors();

      for (let [dir, n] of Object.entries(this.activeTile.neighbors())) {
        Object.assign(n.dataset, {
          highlight: false,
          selected: false,
        });

        for (let c of n.classList.values()) {
          // console.warn('c', c)
          if (c && c !== 'tile') {
            n.classList.remove(c)
          }
        }
      }

      this.activeTile.dataset.selected = false;
      this.activeTile.dataset.active = false;
    }

    tile.dataset.active = true;
    tile.dataset.selected = true;
  }

  setTargetTile(tile) {
    if (tile && !tile.classList.contains('tile')) return;

    if (this.targetTile || (!!this.targetTile && tile === null)) {
      this.targetTile.dataset.target = false;
      return true;
    }

    else if (!!this.targetTile) {
      this.targetTile.dataset.target = false;
    }

    tile.dataset.target = true;
  }

  selectNeighbors(tile = this.activeTile) {
    const neighbors = tile.neighbors();
    const [y, x] = this.parseTileAddress(tile);

    for (let dir in neighbors) {
      const n = neighbors[dir];


      this.selectTile(n, this.getRangeVector(n.dataset.address));
    }

    return tile;
  }

  selectTile(t, rangeIndexes) {
    if (!t || (t && !t.classList.contains('tile'))) return;
    const [y, x] = this.parseTileAddress(t);
    t.dataset.selected = true;

    t.classList.add('top');
    t.classList.add('bottom');
    t.classList.add('left');
    t.classList.add('right');

    return t;
  }

  isInBounds(tile) {
    const [c, r] = this.parseTileAddress(tile)
    console.log('(c >= 0 && c <= this.width) && (r >= 0 && r <= this.height)', (c >= 0 && c <= this.width) && (r >= 0 && r <= this.height))
    return (c >= 0 && c <= this.width) && (r >= 0 && r <= this.height)
  }

  isNeighborOf(tile) {
    const [c, r] = this.parseTileAddress(tile)
    console.log('(c >= 0 && c <= this.width) && (r >= 0 && r <= this.height)', (c >= 0 && c <= this.width) && (r >= 0 && r <= this.height))
    return (c >= 0 && c <= this.width) && (r >= 0 && r <= this.height)
  }

  clearSelectedTiles() {
    this.selectedTiles.forEach((t, i) => {
      t.dataset.active = false
      t.dataset.selected = false
      t.classList.remove('selected');
      // this.removeSelectionBorders(t);
      t.classList.remove('top')
      t.classList.remove('bottom')
      t.classList.remove('left')
      t.classList.remove('right')
    });

    return this;
  }

  resetTiles() {
    this.tiles.forEach((t, i) => {
      // if (t !== this.activateTile) {

      t.dataset.active = false
      t.dataset.isPathNode = false
      t.dataset.selected = false
      t.classList.remove('selected');
      // this.removeSelectionBorders(t);
      t.classList.remove('top')
      t.classList.remove('bottom')
      t.classList.remove('left')
      t.classList.remove('right')
      // }
    });

    return this;
  }

  clearPathTiles() {
    this.pathTiles.forEach((t, i) => {
      // if (t !== this.activateTile) {

      t.dataset.active = false
      t.dataset.isPathNode = false
      t.dataset.selected = false
      t.classList.remove('selected');
      // this.removeSelectionBorders(t);
      t.classList.remove('top')
      t.classList.remove('bottom')
      t.classList.remove('left')
      t.classList.remove('right')
      // }
    });

    return this;
  }

  insertTile(y, x, type) {
    const t = document.createElement('div');
    t.classList.add('tile');
    t.dataset.tileType = type
    t.dataset.address = [y, x].toString();

    this.tiles.set(
      t.dataset.address,
      Object.assign(t, {
        neighbors: () => this.getNeighbors.bind(this)(t)
      }),
    );

    return t;
  }

  setGridSize({ height, width, tilesize }) {
    this.dims = { height, width, tilesize }
    this.self.style.gridTemplateColumns = `repeat(${ width || this.dims.width }, ${tilesize}px)`;
    this.self.style.gridTemplateRows = `repeat(${ height || this.dims.height }, ${tilesize}px)`;
  }

  handleClick(e) {
    const t = e.target.closest('.tile');

    if (t === this.activeTile) {
      this.activateTile(null);
      this.resetTiles()
      return
    }

    if (t === this.targetTile || (this.activeTile && this.targetTile)) {
      this.setTargetTile(null);
      this.resetTiles()
      return
    }

    // if (this.activeTile && this.targetTile) {
    //   this.setTargetTile(null);

    //   return t;
    // }

    else if (this.activeTile && !this.targetTile) {
      this.setTargetTile(t);

      this.self.querySelectorAll('.tile[data-is-path-node]')
        .forEach(t => { delete t.dataset.isPathNode })


      this.getPath();

      return t;
    }

    this.activateTile(t);
    this.selectNeighbors(t)
    // this.selectTile(t, )
  }

  addSelectionBorders(t, ...borders) {
    // this.selectedTiles.forEach((t, i) => {
    t.dataset.active = false
    t.dataset.selected = false
    t.classList.remove('selected')
    t.classList.remove('top')
    t.classList.remove('bottom')
    t.classList.remove('left')
    t.classList.remove('right')
    // });
  }

  // addSelectionBorders(t, ...borders) {
  //   borders.forEach((b, i) => { t.classList.add(b) });

  //   return t;
  // }

  // removeSelectionBorders(t, ...borders) {
  //   borders.forEach((b, i) => { t.classList.remove(b) });

  //   return t;
  // }

  // toggleSelectionBorders(t, ...borders) {
  //   borders = borders.length ? borders : ['top', 'right', 'bottom', 'left']
  //   borders.forEach((b, i) => { t.classList.toggle(b) });

  //   return t;
  // }

}