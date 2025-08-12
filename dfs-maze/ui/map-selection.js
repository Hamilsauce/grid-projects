import { MAP_9X15_1, BLANK_MAP_9X15_1, maps, mapStorageFormatter } from '../../dfs-maze/maps.js';
import { storeMaps, storeMap, updateMap, loadMap, loadMaps, clearMaps, loadMapNames } from '../../dfs-maze/map.service.js';
import { copyTextToClipboard } from '../../dfs-maze/lib/utils.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { sleep, template, utils, download, TwoWayMap } = ham;

const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const containers = document.querySelectorAll('.container')
const mapInput = document.querySelector('#map-input');


const mapInput$ = fromEvent(mapInput, 'change')

const saveButton = document.querySelector('#save-map')

export const initMapControls = async (graph, svgCanvas, actor1) => {
  // const storedMaps = (await loadMaps())
  const mapNames = await loadMapNames();
  
  // await clearMaps();
  // const newlyStoredMapIds = await Promise.all(storeMaps())
  // console.warn('newlyStoredMapIds', newlyStoredMapIds);
  
  [...mapInput.options].forEach((e) => {
    e.remove();
  });
  const blankOpt = { id: null, name: '' };
  const defaultOpt = { id: 'zYCxQlIXijeHjuwqCK7A', name: 'suk' };
  
  [defaultOpt, ...mapNames].forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    
    mapInput.add(opt)
  });
  
  saveButton.addEventListener('click', async (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    const mapSelection = e
    let mapId
    const graphOut = graph.toStorageFormat();
    
    if (!!graphOut.id) {
      mapId = await updateMap(graphOut)
    }
    
    else {
      delete graphOut.id
      
      mapId = await storeMap(graphOut)
    }
    
    copyTextToClipboard(graphOut)
    console.warn('toStorageFormat graphOut\n\n', graphOut)
  });
  
  
  mapInput$.pipe(
    tap(async ({ target }) => {
      const sel = target.selectedOptions[0].value;
      
      const selectedMap = await loadMap(sel)
      graph.fromMap(selectedMap);
      
      svgCanvas.setViewBox({
        x: 0,
        y: 0,
        width: graph.width,
        height: graph.height
      });
      
      svgCanvas.layers.tile.innerHTML = '';
      
      graph.nodes.forEach(({ x, y, tileType }, rowNumber) => {
        if (tileType === 'start') {
          actor1.setAttribute('transform', `translate(${x},${y})`);
        }
        
        svgCanvas.layers.tile.append(
          svgCanvas.createRect({
            width: 1,
            height: 1,
            // textContent: `${x},${y}`,
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
}

setTimeout(() => {
  console.log(' ', );
  mapInput.dispatchEvent(new Event('change'))
  
}, 500)