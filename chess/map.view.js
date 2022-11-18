// import { tileBrushStore } from '../store/tile-brush.store.js';
// import { tileTypeCodes } from '../store/tile-type-codes.js';
// import { Collection } from '../lib/collection.js';
// import { TileView } from '../view/tile.view.js';
// import { push } from './tile-view-updates.stream.js';
const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { bufferCount, flatMap, takeUntil, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { download, date, array, utils, text, event } = ham;

export const TileTypes = {
  barrier: 'barrier',
  ground: 'ground',
  empty: 'empty',
  goal: 'goal',
  start: 'start',
}

const appBody = document.querySelector('#app-body')


export class MapView {
  constructor() {
    this.rangeFillStart = null;
    this.saveMap = this.#saveMap.bind(this)
    this.loadMap = this.#loadMap.bind(this)
    // this.render = this.#render.bind(this)
    // console.log('selectedTileBrushState', tileBrushStore)
    this.tiles = new Map();

    this.self = document.querySelector('#map')

    this._self = {
      get map() {
        return document.querySelector('#map')
      },
      get body() {
        return document.querySelector('#map-body')
      },
      get headerRow() {
        return document.querySelector('#map-row')
      },
      get headerColumn() {
        return document.querySelector('#map-column')
      },
    };

    const dragTargets = {
      start: null,
      over: null,
      end: null,
    }

    this.pointerStart = {
      x: null,
      y: null,
      target: null
    }


    const clickCount = 2;
    const clickTimespan = 300;

    this.dblClick$ = fromEvent(this.self, 'click')
      .pipe(
        map(e => ({ target: e.target, timestamp: new Date().getTime() })),
        bufferCount(clickCount, 1),
        filter((timestamps) => {
          return timestamps[0].target === timestamps[1].target && timestamps[0].timestamp > new Date().getTime() - clickTimespan;
        }),
        map(([first, second]) => second),
        map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
        tap(t => this.handleTileLongPress.bind(this)(t)),
      )
    // .subscribe()

    this.scroll$ = fromEvent(appBody, 'scroll')
      .pipe(
        map(x => x),
        tap(x => console.log('appbody scroll$', x))
      )

    // this.scroll$.subscribe()

    this.pointerDown$ = fromEvent(this.self, 'pointerdown')
      .pipe(
        // takeUntil(this.scroll$),
        map(e => ({ x: e.clientX, y: e.clientY, targetBounds: e.target.closest('.tile').getBoundingClientRect(), target: e.target.closest('.tile') })),
        tap(e => this.pointerStart = e),
        // switchMap(pointerStart => this.scroll$),
        map(this.handleTileClick.bind(this)),
      );

    this.pointerMove$ = fromEvent(this.pointerStart.target, 'pointermove')
      .pipe(
        tap(x => console.log('Pointer move on body', x)),
        filter(({ clientX, clientY }) => {
          return (clientX < this.pointerStart.targetBounds.left || clientX > this.pointerStart.targetBounds.right) ||
            (clientY < this.pointerStart.targetBounds.top || clientY > this.pointerStart.targetBounds.bottom)
        }),
      );

    this.pointerUp$ = fromEvent(document, 'pointerup')
      .pipe(tap(() => this.pointerStart = null), );

    this.longpress$ = this.pointerDown$
      .pipe(
        mergeMap((e) => of (e)
          .pipe(
            delay(450),
            // takeUntil(this.scroll$),
            // takeUntil(this.pointerMove$),
            takeUntil(this.pointerUp$),
            tap(() => this.handleTileLongPress.bind(this)(this.pointerStart)),
          ))
      );

    // this.longpress$.subscribe()

    this.scroll$.pipe()

    // this.self.addEventListener('dragstart', e => {
    //   dragTargets.start = e.target.closest('.tile') //.dataset.address;
    // });

    this.self.addEventListener('drag', e => {
      dragTargets.over = e.target.closest('.tile');
    });

    this.self.addEventListener('dragend', e => {
      const t = e.target.closest('.tile');
    });

    this.activeBrush = 'barrier';


    this.activeBrush$ = tileBrushStore.select({ key: 'activeBrush' })
      .pipe(
        tap((activeBrush) => this.activeBrush = activeBrush),
      )
      .subscribe();


    this.tileEventSubject$ = new Subject()

    // this.tileClicks$ = fromEvent(this.self, 'click')
    // .pipe(
    //   map(this.handleTileClick.bind(this)),
    //   tap(this.tileEventSubject$),
    //   tap(push),

    // )

    // this.tileClicks$.subscribe()

    this.dims = {
      width: 25,
      height: 25,
    }

    const body = document.createElement('div');
    body.id = 'map-body'

    const headerRow = document.createElement('div');
    headerRow.id = 'map-header-row'

    const headerColumn = document.createElement('div');
    headerColumn.id = 'map-header-column'

    this.createMap(this.dims, null);
  }

  get selectedTiles() {
    return [...this.self.querySelectorAll('.tile[data-selected=true]')]
  }

  createTile(row, column, tileType) {
    const tile = TileView.create({ address: [row, column].toString(), tileType })

    return tile;
  }

  insertTile(row, column, tileType) {
    const tile = this.createTile(row, column, tileType);
    return this.tiles.set(tile.address, tile).get(tile.address);
  }

  createMap(dims, savedTiles) {

    this.tiles.clear();

    this.setGridSize(dims);

    for (var row = 0; row < dims.height; row++) {
      for (var col = 0; col < dims.width; col++) {
        const st = savedTiles ? savedTiles.find(t => t.address == [row, col].toString()) : null;

        if (st) {
          this.insertTile(row, col, tileTypeCodes.get(st.type));
        }
        else {
          this.insertTile(row, col, 'empty');
        }
      }
    }
  }

  setGridSize({ height, width }) {
    this.self.style.gridTemplateColumns = `repeat(${ width || this.dims.width }, 30px)`;

    this.self.style.gridTemplateRows = `repeat(${ height || this.dims.height }, 30px)`;
  }

  getRange() {}

  eachTile(callback) {}

  #saveMap() {
    const data = { key: 'map-maker-save-1', mapName: 'test1', map: { dims: this.dims, tiles: [] } }
    const tiles = [...this.self.querySelectorAll('.tile')]

    data.map.tiles = tiles
      .filter((t, i) => t.dataset.tileType != 'empty')
      .map((t, i) => {
        return { address: t.dataset.address, type: tileTypeCodes.get(t.dataset.tileType) }
      });

    const serialized = JSON.stringify(data, null, 2)
    localStorage.setItem(data.key, serialized)
  }

  #loadMap(savedMap) {
    const { dims, tiles } = savedMap.map
    this.createMap(savedMap.map.dims, savedMap.map.tiles)
    this.render();
  }

  parseTileAddress(tile) {
    if (!(!!tile)) return;
    return tile.dataset.address.split(',').map(_ => +_)
  }

  async append(tile) {
    await this.self.append(tile);

    return tile
  }

  render() {
    this.self.innerHTML = '';
    // console.log('this.tile', this.tile)
    this.tiles.forEach(async (t, i) => {

      await this.append(t.render());
    });
  }

  // handleTileClick({ x, y, targetBounds, target }) {
  //   const t = this.tiles.get(target.dataset.address)

  //   if (t && !!this.rangeFillStart && t !== this.rangeFillStart) {
  //     const [c1, r1] = this.rangeFillStart.address.split(',').map(_ => +_)
  //     const [c2, r2] = t.dataset.address.split(',').map(_ => +_)

  //     this.tiles.forEach((tile, address, i) => {
  //       const [c, r] = tile.address.split(',').map(_ => +_)

  //       if (
  //         c >= c1 && c <= c2 &&
  //         r >= r1 && r <= r2
  //       ) {
  //         tile.dataset.tileType = t.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush;
  //         tile.dataset.selected = true;
  //       }
  //     });

  //     setTimeout(() => {
  //       this.selectedTiles.forEach((tile, address, i) => {
  //         tile.dataset.selected = false;
  //       });
  //     }, 250);

  //     this.rangeFillStart.dataset.selected = false;

  //     this.rangeFillStart = null;
  //   }

  //   else if (t) {
  //     t.dataset.tileType = t.dataset.tileType === this.activeBrush ? 'empty' : this.activeBrush;
  //   }

  //   return t;
  // }

  handleTileLongPress({ x, y, targetBounds, target }) {
    const t = this.tiles.get(target.dataset.address)

    if (t) {
      this.selectedTiles.forEach((t, i) => {
        t.selected = false
      });

      this.rangeFillStart = t;
      t.tileType = this.activeBrush || 'empty';
      t.selected = true
    }

    return t;
  }
}
