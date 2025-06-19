const graph = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A', 'F'],
  D: ['B'],
  E: ['B', 'F'],
  F: ['C', 'E']
};

const bfsShortestPath = async (graph, start, goal) => {
  const queue = [
    [start]
  ]; // queue of paths
  const visited = new Set(); // to avoid revisiting nodes
  
  while (queue.length > 0) {
    const path = queue.shift(); // FIFO
    const node = path[path.length - 1];
    
    if (node === goal) {
      return path; // return full path when goal is found
    }
    
    if (!visited.has(node)) {
      visited.add(node);
      for (const neighbor of graph[node] || []) {
        queue.push([...path, neighbor]); // enqueue a new path
      }
    }
  }
  
  return null; // no path found
}

const path = await bfsShortestPath(graph, 'A', 'F');
console.log(path); // → [ 'A', 'C', 'F' ] or [ 'A', 'B', 'E', 'F' ]


import fs from 'fs'

const stats = fs.stat('textFile.txt', (err, stats) => {
  if (err) throw err
  console.warn('stats', stats)
  
})
// fs.unlink('txt.txt', (err) => {
//   if (err) throw err
//   console.log('path/file.txt was deleted')
// })