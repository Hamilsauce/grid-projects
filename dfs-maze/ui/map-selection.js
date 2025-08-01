import { MAP_9X15_1, BLANK_MAP_9X15_1, maps, mapStorageFormatter } from '../../dfs-maze/maps.js';
import { storeMaps, loadMaps, clearMaps } from '../../dfs-maze/map.service.js';
import { copyTextToClipboard } from '../../dfs-maze/lib/utils.js';

const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of, fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;


const app = document.querySelector('#app');
const appBody = document.querySelector('#app-body')
const containers = document.querySelectorAll('.container')
const mapInput = document.querySelector('#map-input');


const mapInput$ = fromEvent(mapInput, 'change')

const saveButton = document.querySelector('#save-map')
// const mapSelect = document.querySelector('#map-select')

export const initMapControls = async (graph, svgCanvas, actor1) => {
  const storedMaps = await loadMaps();
  // await clearMaps()
  // await storeMaps()
  
  [...mapInput.options].forEach((e) => {
    e.remove();
  });
  
  storedMaps.sort((a, b) => a.name - b.name).forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    
    mapInput.add(opt)
  });
  
  setTimeout(() => {
    mapInput.dispatchEvent(new Event('change', {
      target: mapInput,
      mapId: [...mapInput.options].find(m => m.name == 'suk')
    }))
  }, 0);
  
  
  saveButton.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    const mapSelection = e
    
    console.warn('mapSelection', mapSelection)
    
    const graphOut = graph.toMap();
    
    copyTextToClipboard(graphOut)
    console.warn('graphOut\n\n', graphOut)
  });
  
  
  mapInput$.pipe(
    tap(async ({ target }) => {
      const sel = target.selectedOptions[0].value;
      
      const maps = await loadMaps() 
      
      const selectedMap = maps[sel];
      graph.fromMap(selectedMap.tiles);
      
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