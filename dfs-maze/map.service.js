import { dbAdd, dbGet, dbGetAll, dbUpdate, getFieldOnly, dbDelete } from '../firestore.js';
import { maps, mapStorageFormatter } from './maps.js';


const cache = new Map();

export const updateMap = async (mapToStore) => {
  // const formatted = 
  const id = await dbUpdate('maps', mapToStore.id, mapToStore)
  
  return id
}

export const storeMap = async (mapToStore) => {
  const formatted = mapStorageFormatter(mapToStore);
  const id = await dbAdd('maps', formatted)
  
  return id
}

export const storeMaps = async (mapsToStore = maps) => {
  const ids = Object.values(mapsToStore).map(async (map, i) => {
    return await storeMap(map)
  });
  
  return ids
}




export const loadMapNames = async () => {
  const fetched = await getFieldOnly('maps', 'name');
  console.warn('loadMapNames', fetched)
  
  return fetched;
}

export const loadMap = async (id) => {
  const fetched = await dbGet('maps', id);
  
  fetched.id = id
  return fetched;
}

export const loadMaps = async (asMap = false) => {
  const fetched = await dbGetAll('maps');
  console.warn('fetched', fetched)
  
  fetched.forEach((m, i) => {
    cache.set(m.id, m)
  });
  
  return asMap ? [...cache.entries()]
    .reduce((acc, [id, m]) => ({ ...acc, [id]: m }), {}) : [...cache.entries()];
}

export const clearMaps = async () => {
  const savedMaps = cache.size > 0 ? [...cache.entries()] :
    await dbGetAll('maps');
  
  console.warn('savedMaps', savedMaps)
  
  savedMaps //.map((m) => ({ ...m }))
    .forEach(async ({ id, ...m }, i) => {
      await dbDelete('maps', id)
      cache.delete(id)
    });
  
  return true;
}