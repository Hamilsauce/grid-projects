import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, download } = ham;

export const TILE_TYPE_INDEX = [
  'empty',
  'barrier',
  'start',
  'goal',
  'teleport',
];

const DIRECTIONS = new Map([
  ['up', { x: 0, y: -1 }],
  ['down', { x: 0, y: 1 }],
  ['left', { x: -1, y: 0 }],
  ['right', { x: 1, y: 0 }],
]);


export class GraphNode {
  #tileType = null;
  #point = { x: 0, y: 0 };
  isPathNode = false;
  isVisited = false;
  previous = null;
  
  constructor({ tileType, x, y }) {
    this.#tileType = tileType;
    this.#point = { x, y };
  }
  
  get tileType() { return this.#tileType }
  
  get isEmpty() { return ['empty'].includes(this.#tileType) }
  
  get isTraversable() { return !['barrier'].includes(this.#tileType) }
  
  get address() { return [this.x, this.y].join('_') }
  
  get x() { return this.#point.x }
  
  get y() { return this.#point.y }
  
  setType(type) { this.#tileType = type }
  
  toJSON() {
    return {
      tileType: this.tileType,
      address: this.address,
      x: this.x,
      y: this.y,
      isTraversable: this.isTraversable,
      isPathNode: this.isPathNode,
      isVisited: this.isVisited,
      previous: this.previous,
    }
  }
}

export class Neighbor {
  #node = null;
  #visited = false;
  
  constructor(node, visited = false) {
    this.#node = node;
    this.#visited = visited;
  }
  
  get node() { return this.#node }
  
  get visited() { return this.#visited }
  
  visit() {
    this.#visited = true;
  }
}

export class TeleportNode extends GraphNode {
  #linkedNodeAddress = null;
  
  constructor(nodeState, linkedNodeAddress = null) {
    super(nodeState);
    this.#linkedNodeAddress = linkedNodeAddress;
    // this.#visited = visited;
  }
  
  linkToAddress(addressKey) {
    this.#linkedNodeAddress = addressKey;
  }
  
  unlink() {
    const address = this.#linkedNodeAddress;
    this.#linkedNodeAddress = null;
    return address
  }
  
}




export class Graph {
  #nodes = new Map();
  #edges = new Map();
  
  constructor(map = []) {
    if (map && map.length) {
      this.fromMap(map);
    }
    
    window.graph = this
  }
  
  get nodes() { return [...this.#nodes.values()]; }
  
  get startNode() { return this.nodes.find(n => n.tileType === 'start'); }
  
  get goalNode() { return this.nodes.find(n => n.tileType === 'goal'); }
  
  get targetNode() { return this.nodes.find(n => n.tileType === 'target'); }
  
  pointToAddress({ x, y }) {
    return [x, y].join('_');
  }
  
  addressToPoint(address='') {
    return (address.includes(',') ? address.split(',').map(_ => +_) : address.split('_')).map(_ => +_);
  }
  
  getNodeByAddress(address) {
    return this.#nodes.get(address);
  }
  
  findNode(cb = () => {}) {
    return this.nodes.find(cb)
  }
  
  getNodeAtPoint({ x, y }) {
    return this.getNodeByAddress(this.pointToAddress({ x, y }))
  }
  
  getRange({ start, end }, updateFn) {
    let range = [];
    
    for (let x = start.x; x < end.x; x++) {
      for (let y = start.y; y < end.y; y++) {
        const tile = this.getNodeAtPoint({ x, y });
        
        tile.selected = true;
        // if (updateFn) {
        //   updateFn(tile)
        // }
        
        // this.activeRange.push(tile);
      }
    }
    
    return range;
  };
  
  
  
  
  getNeighbor(node, dirName = '') {
    if (dirName === 'remote') {
      const tele = this.findNode((n) => n !== node && n.tileType === 'teleport')
      return tele
    }
    const { x, y } = DIRECTIONS.get(dirName);
    
    const n = this.getNodeAtPoint({
      x: node.x + x,
      y: node.y + y,
    });
    
    
    if (!n || !n.isTraversable) return null;
    
    return n;
  }
  
  getNeighbors(node) {
    const neighborMap = [...DIRECTIONS.keys()]
      .reduce((map, name, i) => {
        return node && this.getNeighbor(node, name) ? map.set(name, this.getNeighbor(node, name)) : map;
      }, new Map());
    
    if (node.tileType === 'teleport') {
      neighborMap.set('remote', this.getNeighbor(node, 'remote'))
    }
    
    return neighborMap;
  }
  
  getUnvisitedNeighbors(node) {
    return node ? ([...this.getNeighbors(node).entries()] || []).filter(([k, v]) => v && !v.previous && v.isVisited === false) : [];
  }
  
  getPath(node = this.startNode, stopNode) {
    this.resetPath();
    return this.bfsShortestPath(node, stopNode)
    return this.shortestPathDfs(node, stopNode)
  };
  
  toLinkedList(lastNode) {
    let pointer = 0;
    let curr = lastNode;
    let path = [];
    
    while (curr) {
      let previous = curr.previous
      if (previous) {
        previous.next = curr;
        delete curr.previous
      }
      curr = previous;
    }
    
    return curr;
  };
  
  pathToQueue(lastNode) {
    let pointer = 0;
    let curr = lastNode;
    let path = [];
    
    while (curr) {
      let previous = curr.previous
      path.push(curr);
      curr = previous;
    }
    
    path.reverse();
    curr = path[pointer];
  };
  
  bfsShortestPath(start, goal) {
    const queue = [
      [start]
    ]; // queue of paths
    const visited = new Set(); // to avoid revisiting nodes
    
    while (queue.length > 0) {
      const path = queue.shift(); // FIFO
      const node = path[path.length - 1];
      
      let unvisitedNeighbors
      
      if (node === goal) {
        return path; // return full path when goal is found
      }
      
      if (!visited.has(node)) {
        visited.add(node);
        
        unvisitedNeighbors = this.getUnvisitedNeighbors(node);
        
        for (const [direction, neighbor] of unvisitedNeighbors || []) {
          queue.push([...path, neighbor]); // enqueue a new path
        }
      }
    }
    
    return null; // no path found
  }
  
  shortestPathDfs(node, stopNode) {
    //node = this.startNode, stopNode = this.goalNode) {
    // node.isPathNode = true;
    node.isVisited = true;
    
    if (node === stopNode) {
      return node;
    }
    
    
    let unvisitedNeighbors = this.getUnvisitedNeighbors(node);
    
    if (unvisitedNeighbors.length == 0 && node.previous) {
      node.isPathNode = false;
      node.isVisited = true;
      node = node.previous;
      
      unvisitedNeighbors = this.getUnvisitedNeighbors(node);
      
      while (node && unvisitedNeighbors.length === 0) {
        node.isPathNode = false;
        node.isVisited = true;
        node = node.previous;
        
        unvisitedNeighbors = this.getUnvisitedNeighbors(node);
      }
      
      return this.shortestPathDfs(node, stopNode);
    }
    
    else {
      for (let [direction, neighbor] of unvisitedNeighbors) {
        neighbor.previous = node;
        
        if (unvisitedNeighbors.length > 0) {
          return this.shortestPathDfs(neighbor, stopNode);
        }
        
        else {
          return node
        }
      }
    }
    return node; /* If no path, return null */
  }
  
  resetPath() {
    this.nodes.forEach((n, i) => {
      n.isVisited = false;
      n.isPathNode = false;
      n.previous = null;
      
    });
  }
  
  fromMap(map = []) {
    this.#nodes.clear()
    
    const height = map.length;
    const width = map[0].length;
    
    map.forEach((row, rowNumber) => {
      row.forEach((typeId, columnNumber) => {
        const tileType = TILE_TYPE_INDEX[typeId];
        
        if (tileType === 'teleport') {
          const node = new TeleportNode({
            tileType: TILE_TYPE_INDEX[typeId],
            x: columnNumber,
            y: rowNumber,
            selected: false,
          });
        }
        
        const node = new GraphNode({
          tileType: TILE_TYPE_INDEX[typeId],
          x: columnNumber,
          y: rowNumber,
          selected: false,
        });
        
        this.#nodes.set(node.address, node);
      });
    });
    console.warn('this.#nodes.entries()', [...this.#nodes.entries()])
    this.height = map.length
    this.width = map[0].length
  }
  
  toMap(formatAsCharMatrix = true) {
    const output = new Array(this.height).fill(null).map(_ => new Array(this.width).fill(null));
    // const charMapOutput = new Array(this.height).fill(null).map(_ => new Array(this.width).fill(null));
    
    const tileTypes = TILE_TYPE_INDEX.reduce((acc, curr, i) => {
      return { ...acc, [curr]: i }
    }, {});
    
    [...this.#nodes].forEach(([addressKey, node], i) => {
      const [x, y] = (addressKey.includes(',') ? addressKey.split(',').map(_ => +_) : addressKey.split('_')).map(_ => +_)
      output[y][x] = formatAsCharMatrix ? tileTypes[node.tileType] : node
      // charMapOutput[y][x] = tileTypes[node.tileType]
    });
    
    const outputJSON = JSON.stringify(output)
    // const output = [...this.#nodes.entries()].reduce((acc, [address, node], i) => {
    //     const [x, y] = address.split(',').map(_ => +_);
    //     console.warn('x, y', typeof x, typeof y)
    //     // console.warn(acc)
    //     // if (!(acc[y])) {
    //     //   acc[y] = new Array(this.width).fill(null)
    //     // }
    //     acc[y][x] = node
    //   }, new Array(this.height).fill(null).map(_ => new Array(this.width).fill(null)));
    
    return outputJSON;
  }
}