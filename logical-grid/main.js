import { Cell, Row, LogicalGrid } from './models/index.js';



const GridInterface = {

}

const DEFAULT_GRID = {

}


const grid = new LogicalGrid(25, 25, (row, column) => row * column)

console.log({grid});
console.log('grid.get', grid.get(8, 13));

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
