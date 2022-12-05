import { Cell, Row, LogicalGrid } from './models/index.js';
import { Toolbar } from './tool-bar.js';


const GridInterface = {

}

const DEFAULT_GRID = {

}

const renderGrid = (grid) => {
  const output = document.querySelector('#output');
  output.innerHTML = grid.print();

};



const toolbar = new Toolbar(document.querySelector('#toolbar'))
const grid = new LogicalGrid(5, 5, (row, column) => [row, column].toString())

const app = document.querySelector('#app-shell');
console.log('app', app)

app.addEventListener('[Toolbar] Action', ({ detail }) => {
  const parsedAction = detail.action.split(':');

  if (!parsedAction) return;

  if (parsedAction.includes('insert')) {
    if (parsedAction.includes('row')) grid.insertRow(new Array(grid.width).fill(null).map((v, i) => [grid.height, i].toString()))
    else if (parsedAction.includes('column')) grid.insertColumn(new Array(grid.height).fill(null).map((v, i) => [i, grid.width].toString()))
  }

  if (parsedAction.includes('remove')) {
    if (parsedAction.includes('row')) grid.removeRow()
    else if (parsedAction.includes('column')) grid.removeColumn()
  }

  // if (action.includes('remove')) {
  //   grid.removeColumn()
  //   // grid.removeColumn()
  // }

  renderGrid(grid);
});


console.log({ grid });
// grid.insertColumn(new Array(grid.height).fill(null).map((v, i) => [i, grid.width].toString()))

// grid.insertRow(new Array(grid.width).fill(null).map((v, i) => [grid.height, i].toString()))


const num2Word = (5)

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