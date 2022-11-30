import { GridView } from './components/grid.component.js';
import { movesKeys$ } from './store/movement-keys.state.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;




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
);


const grid = new GridView(dims);


// const gridView = new Grid()
console.log('movesKeys$', movesKeys$)
movesKeys$
  .pipe(
    map(x => x),
    tap(x => console.log('movesKeys$', x)),
    tap(dir => grid.activateNeighbor(dir)),
  )
  .subscribe()
