import { dbAdd, dbGetAll, dbDelete } from '../firestore.js';
import { maps, mapStorageFormatter } from './maps.js';


const cache = new Map();

export const storeMap = async (mapToStore) => {
  const formatted = mapStorageFormatter(mapToStore);
  const id = await dbAdd('maps', formatted)
  
  
  return id
}

export const storeMaps = async (mapsToStore = maps) => {
  const ids = [];
  
  Object.values(mapsToStore).forEach(async (map, i) => {
    const formatted = mapStorageFormatter(map);
    const id = await dbAdd('maps', formatted)
    
    ids.push(id)
  });
  
  return ids
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
  const savedMaps = cache.size > 0 ? [...cache.entries()] : await dbGetAll('maps');
  
  savedMaps.map(([id, m]) => ({ ...m, id }))
    .forEach(async ({ id, ...m }, i) => {
      await dbDelete('maps', id)
      cache.delete(id)
    });
  
  return true;
}