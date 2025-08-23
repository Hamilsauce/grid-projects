import { BLANK_MAP_16X16, mapStorageFormatter } from '../../dfs-maze/maps.js';
import { storeMaps, storeMap, updateMap, loadMap, loadMaps, clearMaps, loadMapNames } from '../../dfs-maze/map.service.js';
import { copyTextToClipboard } from '../../dfs-maze/lib/utils.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;

import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { sleep, template, utils, download, TwoWayMap } = ham;

const renderMap = (mapData, svgCanvas, graph, actor1) => {
  graph.fromMap(mapData);
  
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
        // classList: ['tile'],
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
}


export const initMapControls = async (graph, svgCanvas, actor1) => {
  // setTimeout(async () => {
  const app = document.querySelector('#app');
  const appBody = document.querySelector('#app-body')
  const containers = document.querySelectorAll('.container')
  const mapInput = document.querySelector('#map-input');
  
  
  const mapInput$ = fromEvent(mapInput, 'change')
  
  const saveButton = document.querySelector('#save-map')
  const newButton = document.querySelector('#new-map')
  
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
  
  newButton.addEventListener('click', async (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    renderMap(BLANK_MAP_16X16, svgCanvas, graph, actor1)
    
  });
  
  
  mapInput$.pipe(
    tap(async ({ target }) => {
      const sel = target.selectedOptions[0].value;
      
      const selectedMap = await loadMap(sel)
      renderMap(selectedMap, svgCanvas, graph, actor1)
    }),
  ).subscribe()
  
  setTimeout(() => {
    console.log(' ', );
    mapInput.dispatchEvent(new Event('change'))
    
  }, 500)
  // }, 1000)
  
}