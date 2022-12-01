import { GridView } from './components/grid.component.js';
import { movesKeys$ } from './store/movement-keys.state.js';
import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';

const { template, utils,DOM } = ham;

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const appShell = document.querySelector('#app-shell')
const appbody = document.querySelector('#app-body')
const appHeader = document.querySelector('#app-header')
const headerRight = document.querySelector('#app-header-right')


const GRID_OPTIONS_CONFIG = [
  {
    name: 'width',
    label: 'Width',
    type: 'text',
    value: 15,
  },
  {
    name: 'height',
    label: 'Height',
    type: 'text',
    value: 15,
  },
  {
    name: 'tilesize',
    label: 'Size',
    type: 'text',
    value: 1,
  },
]

const gridOptions = DOM.createElement({
    templateName: 'grid-options',
    elementProperties: {
      onclick: (e) => {
        console.warn('onclick', e)
      }
    }
  },
  GRID_OPTIONS_CONFIG.map((opt) => {
    const o = template('grid-option')
    const l = o.querySelector('label');
    const i = o.querySelector('input');
    o.dataset.optionName = opt.name
    l.textContent = opt.label;
    i.type = opt.type;
    i.value = opt.value;

    return o;
  })
);

gridOptions.addEventListener('change', e => {
  const targ = e.target.closest('input');
  const opt = targ.closest('.grid-option');
  const optionName = opt.dataset.optionName;
  console.log('targ.value', targ.value)
  console.log('!isNaN(+targ.value)', !isNaN(+targ.value.trim()))
  const value = !isNaN(+targ.value.trim()) ? +e.target.closest('input').value.trim() : 0;

  gridOptions.dispatchEvent(new CustomEvent('option:change', { bubbles: true, detail: { name: optionName, value } }))


  console.log('gridOptions', e)

});

appHeader.append(gridOptions)

const gridEl = document.createElement('div');
const overlayGrid = document.createElement('div');

gridEl.classList.add('grid');
gridEl.id = 'grid'

overlayGrid.classList.add('overlay-grid');
overlayGrid.id = 'overlay-grid'

appbody.innerHTML = ''

const dims = {
  width: 10,
  height: 10,
  tilesize: 30
}

appbody.append(
  gridEl,
  overlayGrid,
);


const grid = new GridView(dims);

appShell.addEventListener('option:change', ({ detail }) => {
  const { name, value } = detail
  console.log('name,value}', { name, value })
  grid.update('dims', { name, value })

});


// const gridView = new Grid()
console.log('movesKeys$', movesKeys$)
movesKeys$
  .pipe(
    map(x => x),
    tap(x => console.log('movesKeys$', x)),
    tap(dir => grid.activateNeighbor(dir)),
  )
  .subscribe()
