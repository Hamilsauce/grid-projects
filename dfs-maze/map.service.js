import { dbAdd } from '../firestore.js';
import { maps, mapStorageFormatter } from './maps.js';

export const storeMaps = async () => {
  const ids = [];
  
  Object.values(maps).forEach(async (map, i) => {
    const formatted = mapStorageFormatter(map);
    const id = await dbAdd('maps', formatted)
    
    ids.push(id)
  });
  
  return ids
}