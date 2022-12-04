import { GridObject } from './grid-object.model.js';
// import { GridObject } from './index.js';

export class Range extends GridObject {
  #row;
  #column;
  
  constructor(row, column) {
    if (!row || !column) throw new Error('No missing either row or col in Position constructor')
    super();
    
    
  }
}