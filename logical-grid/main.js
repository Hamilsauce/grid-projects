import { Cell,Row } from './models/index.js';

const cell1 = new Cell({
  row: 1,
  column: 2,
  value: 'fuck'
})

const row1 = new Row({
  row: 1,
  column: 2,
  value: 'fuck'
})

console.log('cell1', cell1)
console.log('row1', row1)
