import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { TwoWayMap, utils } = ham;


export const MAP_TILE_SYMBOLS = new Map([
  ['*', { symbol: '*', tileTypeId: 7, tileType: 'empty', direction: null }],
  ['#', { symbol: '#', tileTypeId: 0, tileType: 'barrier', direction: null }],

  ['&', { symbol: '&', tileTypeId: 1, tileType: 'character', direction: 'left', hasCharacter: true }],

  // ['>', { symbol: '>', tileTypeId: 1, tileType: 'character', direction: 'right', hasCharacter: true }],
  // ['^', { symbol: '^', tileTypeId: 1, tileType: 'character', direction: 'up', hasCharacter: true }],
  // ['v', { symbol: 'v', tileTypeId: 1, tileType: 'character', direction: 'down', hasCharacter: true }],
  [' ', { symbol: ' ', tileTypeId: 2, tileType: 'ground', direction: null, isPassable: true, }],
  ['$', { symbol: '$', tileTypeId: 3, tileType: 'start', direction: null, isPassable: true, isStart: true }],
  ['x', { symbol: 'x', tileTypeId: 4, tileType: 'exit', direction: null, isPassable: true, isExit: true }],
  ['.', { symbol: '.', tileTypeId: 5, tileType: 'path', direction: null, isPassable: true }],
  ['@', { symbol: '@', tileTypeId: 6, tileType: 'target', direction: null, isPassable: true, }],
]);

export const DIRECTIONS = {
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
}

export const CHARACTER_SYMBOLS = new TwoWayMap([
  ['<', 'left'],
  ['>', 'right'],
  ['^', 'up'],
  ['v', 'down'],
]);
