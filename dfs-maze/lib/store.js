import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, download } = ham;

export const TILE_TYPE_INDEX = [
  'empty',
  'barrier',
  'start',
  'goal',
  'teleport',
];

const tileTypes = TILE_TYPE_INDEX.reduce((acc, curr, i) => {
  return { ...acc, [curr]: i }
}, {});


const DIRECTIONS = new Map([
  ['up', { x: 0, y: -1 }],
  ['down', { x: 0, y: 1 }],
  ['left', { x: -1, y: 0 }],
  ['right', { x: 1, y: 0 }],
]);


export class GraphNode {
  #tileType = null;
  #target = { x: 0, y: 0 };
  #point = { x: 0, y: 0 };
  isPathNode = false;
  isVisited = false;
  previous = null;
  #linkedNodeAddress = null;
  
  constructor({ tileType, x, y }) {
    this.#tileType = tileType;
    this.#point = { x, y };
  }
  
  get tileType() { return this.#tileType }
  
  set tileType(v) { this.#tileType = v }
  
  get isEmpty() { return ['empty'].includes(this.#tileType) }
  
  get isTraversable() { return !['barrier'].includes(this.#tileType) }
  
  get address() { return [this.x, this.y].join('_') }
  
  get x() { return this.#point.x }
  
  get y() { return this.#point.y }
  
  setType(type) {
    console.warn('SET NODE TYPE. OLD: ', this.#tileType)
    console.warn('SET NODE TYPE. NEW: ', type)
    this.#tileType = type
  }
  
  get linkedNodeAddress() { return this.#target ? [this.#target.x, this.#target.y].join('_') : null; }
  
  get target() { return this.#target }
  
  set target(v) { this.#target = v }
  
  linkToNode({ x, y }) {
    this.#target = { x, y };
  }
  
  linkToAddress(addressKey) {
    this.#linkedNodeAddress = addressKey;
  }
  
  unlink() {
    const address = this.#linkedNodeAddress;
    this.#linkedNodeAddress = null;
    return address
  }
  
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
      linkedNodeAddress: this.linkedNodeAddress,
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
  #target = { x: 0, y: 0 };
  #linkedNodeAddress = null;
  
  constructor({ target, ...nodeState }) {
    super(nodeState);
    this.#target = target;
    this.#linkedNodeAddress = target ? [target.x, target.y].join('_') : null;
    // this.#visited = visited;
  }
  
  get linkedNodeAddress() { return this.#target ? [this.#target.x, this.#target.y].join('_') : null; }
  
  get target() { return this.#target }
  
  set target(v) { this.#target = v }
  
  linkToNode({ x, y }) {
    this.#target = { x, y };
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
  #id = null;
  #name = 'Untitled';
  #meta = {};
  #width = null;;
  #height = null;;
  #nodeData = new Map(); // tileData
  #nodes = new Map();
  #edges = new Map();
  
  constructor(map = []) {
    if (map && map.length) {
      this.fromMap(map);
    }
    
    window.graph = this
  }
  
  get id() { return this.#id; }
  
  get name() { return this.#name; }
  
  set name(v) { this.#name = v }
  
  get nodes() { return [...this.#nodes.values()]; }
  
  get startNode() { return this.nodes.find(n => n.tileType === 'start'); }
  
  get goalNode() { return this.nodes.find(n => n.tileType === 'goal'); }
  
  get targetNode() { return this.nodes.find(n => n.tileType === 'target'); }
  
  pointToAddress({ x, y }) {
    return [x, y].join('_');
  }
  
  addressToPoint(address = '') {
    return (address.includes(',') ? address.split(',').map(_ => +_) : address.split('_')).map(_ => +_);
  }
  
  getNodeByAddress(address) {
    return this.#nodes.get(address);
  }
  
  findNode(cb = () => {}) {
    return this.nodes.find(cb)
  }
  
  findNodes(cb = () => {}) {
    return this.nodes.filter(cb)
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
  }
  
  getNeighbor(node, dirName = '') {
    if (dirName === 'remote') {
      
      const tele = this.getNodeAtPoint({
        x: node.target.x,
        y: node.target.y,
      });
      
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
    
    if (node.tileType === 'teleport' && node.target) {
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
  
  getSpiral() {
    const targetX = this.width / 2;
    const targetY = this.height / 2;
    
    const centerNode = this.getNodeAtPoint({
      x: targetX,
      y: targetY
    })
    
    return centerNode
  }
  
  
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
  
  
  
  resetPath() {
    this.nodes.forEach((n, i) => {
      n.isVisited = false;
      n.isPathNode = false;
      n.previous = null;
      
    });
  }
  
  fromStoredMap({
    name,
    tileData,
    tiles: tileChars,
    width,
    height
  }) {
    this.#nodes.clear()
    this.name = name
    this.width = width
    this.height = height
    
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
  }
  
  fromMap(map = {}) {
    this.#nodes.clear()
    let rows
    
    
    if (!Array.isArray(map)) {
      
      const temprows = [...map.tiles];
      
      this.height = map.height;
      this.width = map.width;
      this.name = map.name;
      this.#id = map.id;
      this.#meta = map.meta;
      this.#nodeData = new Map(Object.entries(map.tileData))
      
      rows = new Array(this.height).fill(null)
        .map(_ => temprows.splice(0, this.width));
    } else {
      rows = map
      this.height = rows.length
      this.width = rows[0].length
      
    }
    
    rows.forEach((row, rowNumber) => {
      row.forEach((typeId, columnNumber) => {
        const tileType = TILE_TYPE_INDEX[typeId];
        let node
        if (tileType === 'teleport') {
          node = new TeleportNode({
            tileType: TILE_TYPE_INDEX[typeId],
            x: columnNumber,
            y: rowNumber,
            selected: false,
          });
        }
        else {
          node = new GraphNode({
            tileType: TILE_TYPE_INDEX[typeId],
            x: columnNumber,
            y: rowNumber,
            selected: false,
          });
        }
        
        if (this.#nodeData.has(node.address)) {
          const data = this.#nodeData.get(node.address)
          Object.assign(node, data)
          
        }
        
        this.#nodes.set(node.address, node);
      });
    });
  }
  
  toStorageFormat() {
    const output = [...this.#nodes.values()].reduce((out, n, i) => {
      let data = {};
      out.tiles.push(tileTypes[n.tileType])
      
      if (!['barrier', 'empty'].includes(n.tileType)) {
        data.tileType = n.tileType;
        
        if (n.tileType === 'teleport' && n.target) data.target = n.target;
        
        out.tileData[n.address] = data;
      }
      
      return out
    }, {
      width: this.width,
      height: this.height,
      tiles: [],
      tileData: {},
      meta: this.#meta,
      name: this.#name,
      id: this.#id,
    });
    
    return output;
  }
  
  toMap(formatAsCharMatrix = true) {
    const output = new Array(this.height).fill(null).map(_ => new Array(this.width).fill(null));
    
    // const tileTypes = TILE_TYPE_INDEX.reduce((acc, curr, i) => {
    //   return { ...acc, [curr]: i }
    // }, {});
    
    [...this.#nodes].forEach(([addressKey, node], i) => {
      const [x, y] = (addressKey.includes(',') ? addressKey.split(',').map(_ => +_) : addressKey.split('_')).map(_ => +_)
      output[y][x] = formatAsCharMatrix ? tileTypes[node.tileType] : node
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
  
}