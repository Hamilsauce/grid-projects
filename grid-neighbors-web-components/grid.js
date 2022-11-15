import { DIRECTIONS } from '../lib/Constants.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { distinctUntilChanged, flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;


export class TileView {
  #type;
  #address;

  constructor() {
    this.root;
  }

  create() {}

  neighbors() {}

}

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
  constructor(el, dims, pushEventsFn) {
    this.dims = dims
    this.tiles = new Map();

    this.createGrid(dims)

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

  get self() {
    return document.querySelector(`.grid`)
  }

  get activeTile() {
    return document.querySelector(`[data-active=true]`)
  }

  get selectedTiles() {
    return this.self.querySelectorAll('.tile[data-selected=true]')
  }

  get mapOffset() {
    // TODO REMOVE HARD CODING
    const padding = { x: 2, y: 2 }

    return {
      x: 0 + 2,
      y: 37 + 2
    }
  }

  getNeighbors(tile) {
    if (!tile) return;

    const [tileY, tileX] = this.parseTileAddress(tile);
    
    return Object.entries(DIRECTIONS)
      .reduce((neighbors, [dirName, { y, x }]) => {
        const conditional = false
        const n = document.querySelector(`[data-address="${[tileY + y, tileX + x].toString()}"]`);

        return !n ? neighbors : { ...neighbors, [dirName]: n }
      }, {})
  }

  createGrid(dims, savedTiles) {
    this.tiles.clear();
    this.self.innerHTML = '';

    this.setGridSize(dims);

    for (let y = 0; y < dims.height; y++) {
      for (let col = 0; col < dims.width; col++) {
        this.insertTile(y, col, 'empty');
      }
    }

    this.self.append(...[...this.tiles.values()]);
  }

  // getRange(rangeAddress = '') {
  //   // const borders = ['top', 'right', 'bottom', 'left', ];

  //   const defaultRange = {
  //     start: { y: -1, x: -1 },
  //     end: { y: -1, x: -1 },
  //   }

  //   if (this.tileRange) {
  //     this.tileRange.forEach((t, i) => {
  //       console.log(' t', t)
  //       t.dataset.selected = false
  //       t.classList.remove('selected')
  //       // this.removeSelectionBorders(t)
  //       t.classList.remove('top')
  //       t.classList.remove('bottom')
  //       t.classList.remove('left')
  //       t.classList.remove('right')
  //     });
  //   }

  //   const rangeIndexes = this.getRangeVector(rangeAddress)

  //   console.log('rangeIndexes', rangeIndexes)

  //   const { start, end } = rangeIndexes

  //   this.tileRange = [...this.tiles.entries()]
  //     .filter(([address, tile], i) => {
  //       const [y, x] = this.parseTileAddress(tile);

  //       return (+x >= start.x && +x <= end.x) &&
  //         +y >= start.y && +y <= end.y
  //     }).map(([k, t]) => t)

  //   this.tileRange.forEach((t, i) => {
  //     const [y, x] = this.parseTileAddress(t);

  //     t.classList.add('selected')
  //     t.dataset.selected = true;

  //     if (x === start.x) t.classList.add('top')
  //     if (x === end.x) t.classList.add('bottom')
  //     if (y === start.y) t.classList.add('left')
  //     if (y === end.y) t.classList.add('right')
  //   });

  //   return this.tileRange
  // }

  getRangeVector(rangeAddress) {
    const vect = rangeAddress.includes(':') ?
      rangeAddress.split(':').reduce((acc, curr, i) => {
        const key = i === 0 ? 'start' : 'end'

        return {
          ...acc,
        [key]: { ...acc[key], y: +curr.split(',')[1], x: +curr.split(',')[0] }
        }
      }, defaultRange) : {
        y: +rangeAddress.split(',')[0],
        x: +rangeAddress.split(',')[1],
      }

    return vect
  }

  parseTileAddress(tile) {
    return tile.dataset.address.split(',').map(_ => +_);
  }

  activateTile(tile) {
    if (!tile || !tile.classList.contains('tile')) return;

    if (!!this.activeTile) {
      const neighbors = this.activeTile.neighbors()

      for (let dir in neighbors) {
        const n = neighbors[dir]
        n.dataset.highlight = false;
        n.dataset.selected = false;
      }

      this.activeTile.dataset.selected = false;
      this.activeTile.dataset.active = false;
    }

    tile.dataset.active = true;
    tile.dataset.selected = true;

  }

  selectNeighbors(tile) {
    const neighbors = tile.neighbors();
   
    for (let dir in neighbors) {
      const n = neighbors[dir];
     
      n.dataset.highlight = true;
      n.dataset.selected = true;

      this.selectTile(n, this.getRangeVector(n.dataset.address));
    }

    return tile;
  }

  selectTile(t, rangeIndexes) {
    if (!t || (t && !t.classList.contains('tile'))) return;
    const [y, x] = this.parseTileAddress(t);
    const neighbors = t.neighbors()

    if (rangeIndexes && rangeIndexes.start && rangeIndexes.end) {
      const { start, end } = rangeIndexes

      t.classList.add('selected');
      t.dataset.selected = true;

      if (x === start.x) t.classList.add('top');
      if (x === end.x) t.classList.add('bottom');
      if (y === start.y) t.classList.add('left');
      if (y === end.y) t.classList.add('right');
    }
    else {
      const { y, x } = this.getRangeVector(t.dataset.address);

      for (let dir in neighbors) {
        const n = neighbors[dir];
      
        const [y2, x2] = this.parseTileAddress(n);
        
        if (y2 === y - 1) t.classList.add('top');
        if (y2 === y + 1) t.classList.add('bottom');
        if (x2 === x - 1) t.classList.add('left');
        if (x2 === x + 1) t.classList.add('right');
      }
    }

    return t;
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

  insertTile(y, x, type) {
    const t = document.createElement('div');
    t.classList.add('tile');
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
    this.self.style.gridTemplateColumns = `repeat(${ width || this.dims.width }, ${tilesize}px)`;
    this.self.style.gridTemplateRows = `repeat(${ height || this.dims.height }, ${tilesize}px)`;
  }

  handleClick(e) {
    const t = e.target.closest('.tile');
    const bbox = t.getBoundingClientRect();

    this.activateTile(t);
    this.selectNeighbors(t)
    // this.selectTile(t, )
  }
}


export class Overlay {
  constructor(el, dims, eventStream) {
    this.self = el;
    this.dims = dims
    this.tileEvents$ = eventStream;
    this.getPointerMove = (target) => fromEvent(target, 'pointermove');
    this.gridMoves$ = this.getPointerMove(document.querySelector('#grid'))

    this.grid = document.querySelector('#grid');
    this.appbody = document.querySelector('#app-body');

    this.tileEvents$
      .pipe(
        filter(_ => _),
        tap(() => this.selections.forEach(s => s.remove())),
        map(({ type, payload }) => payload),
        tap(this.insertSelection.bind(this)),
        // tap(x => console.log('Overlay BEFIRE SWITCHMAP', x)),
        switchMap(({ x, y }) => this.gridMoves$
          // switchMap(({x,y}) => this.getPointerMove(this.self)
          .pipe(
            map(({ clientX, clientY }) => ({ width: this.sel.getBoundingClientRect().x || 0 + clientX || 0, height: this.sel.getBoundingClientRect().y || 0 + clientY || 0 })),
            // map(({ clientX, clientY }) => ({ width: this.sel.getBoundingClientRect() + clientX, y: clientY })),
            tap(this.resizeSelection.bind(this)),
            // takeUntil
            // tap(x => console.log('TAP', x)),
            // tap((x) => console.warn('Overlay Switchmap', x)),

          )
        )
      )
    // .subscribe()

    this.init(dims)
  }

  get selections() {
    return [...this.self.querySelectorAll('.selection')]
  }

  get boundingBox() {
    return this.self.getBoundingClientRect()
  }

  init(dims) {
    this.setSize(dims);

  }

  clearSelection() {
    (this.selections).forEach(s => s.remove())
  }

  insertSelection({ x, y, width, height }) {
    this.sel = document.createElement('div');
    this.sel.classList.add('selection');
    this.self.append(this.sel)

    this.sel.style.top = `${y-37}px`
    this.sel.style.left = `${x}px`
    this.sel.style.height = `${height}px`
    this.sel.style.width = `${width}px`

    return this.sel
  }

  resizeSelection({ width, height }) {
    if (!this.sel) return;
    this.sel.style.width = `${width}px`
    this.sel.style.height = `${height}px`
    return this.sel
  }

  setSize({ height, width, tilesize }) {
    this.self.style.width = width + 'px'
    this.self.style.height = height * 2 + 'px'
  }

  handleClick(e) {
    const t = e.target.closest('.tile');
    const bbox = t.getBoundingClientRect();
  }
}



const appbody = document.querySelector('#app-body')
const gridEl = document.createElement('div');
const overlayGrid = document.createElement('div');

gridEl.classList.add('grid');
gridEl.id = 'grid'

overlayGrid.classList.add('overlay-grid');
overlayGrid.id = 'overlay-grid'

appbody.innerHTML = ''

const dims = {
  width: 25,
  height: 25,
  tilesize: 30
}

appbody.append(
  gridEl,
  overlayGrid,
)

// const gridEvents$ = new BehaviorSubject(null);

// const pushEvent = (type, payload) => {
//   gridEvents$.next({ type, payload })
// }

// const getUpdates = () => {
//   return gridEvents$.asObservable()
// }

// let startTile;
// let currTile;
// let endTile;



const grid = new GridView(gridEl, dims)
// const overlay = new Overlay(overlayGrid, grid.boundingBox, gridEvents$)

// const tileFromPoint = ({ x, y }) => document.elementFromPoint(x, y) //.closest('.tile');


// const drawActions$ = {
//   arm: fromEvent(gridEl, 'click').pipe(
//     tap(x => grid.clearSelectedTiles()),
//     tap(() => {
//       startTile = null
//       currTile = null
//       endTile = null
//     }),
//     map(({ clientX, clientY }) => tileFromPoint({ x: clientX, y: clientY })),
//     tap((tile) => startTile = tile),
//     tap((address) => grid.activateTile(startTile)),
//     tap(x => console.log('x', x.neighbors())),
//   ),

//   start: fromEvent(gridEl, 'pointerdown').pipe(
//     tap(x => gridEl.style.touchAction = 'none'),
//     map(({ pageX, pageY }) => tileFromPoint({ x: pageX, y: pageY })),
//     // tap(tile => console.log('startTile === tile', startTile === tile)),
//     filter((tile) => startTile === tile),

//     tap((address) => grid.activateTile(startTile)),
//     // tap(x => console.log('pointerdown', x)),
//     filter((target) => target.classList.contains('tile')),
//     map(() => startTile && !currTile ?
//       `${startTile.dataset.address}` :
//       `${startTile.dataset.address}:${endTile.dataset.address}`),
//     tap((address) => grid.getRange(address)),


//     // tap((tile) => tile.dataset.selected = true),
//     // map(({ pageX, pageY }) => tileFromPoint({ x: pageX, y: pageY })),
//   ),

//   move: fromEvent(gridEl, 'pointermove').pipe(
//     filter(() => !!startTile),
//     map(({ pageX, pageY }) => tileFromPoint({ x: pageX, y: pageY })),
//     distinctUntilChanged(),
//     filter((targ) => startTile != targ),

//     tap((tile) => currTile = tile),
//     // tap(x => console.log('MOVE, startTile, currTile', { startTile: startTile.dataset.address, currTile: currTile.dataset.address })),
//     map(() => `${startTile.dataset.address}:${currTile.dataset.address}`),
//     tap((address) => grid.getRange(address)),
//   ),

//   end: fromEvent(gridEl, 'pointerup').pipe(
//     map(({ clientX, clientY }) => tileFromPoint({ x: clientX, y: clientY })),
//     tap((tile) => endTile = tile),
//     tap(x => gridEl.style.touchAction = null),
//     map(() => `${startTile.dataset.address}:${endTile.dataset.address}`),
//     tap((address) => grid.getRange(address)),

//   ),
// };



// drawActions$.arm
//   .pipe(
//     // tap(x => console.warn('drawActions$.arm', x)),
//     switchMap(() => drawActions$.start.pipe(
//       switchMap(() => drawActions$.move
//         .pipe(
//           switchMap(() => drawActions$.end)))))

//   )
//   .subscribe()

// // const drawSubscription =drawActions$.arm.pipe(

// //       .subscribe(x => {
// //   console.warn('[drawSubscription]', { start: startTile.dataset.address, end: endTile.dataset.address })
// // });

// console.log('FUK');
