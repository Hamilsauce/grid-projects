import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { utils, CONSTANTS } = ham;
console.log('ham', ham)
/*
 *  Takes a number and returns an name in form of
 *  'AAB'
 *  
 *  
 */

/*

 1. If number <= 25, get letter by index
 2. Else, for every multiple of 26
   a. curr position letter becomes 
      [index of curr letter + 1 || A]
      
   b. 

*/

const alpha = CONSTANTS.ALPHABET;
const pos = 96;
const threshhold = 25;

const divide26 = (v) => v / 26;

let indices = [0, null, null];

console.log('indices', indices)

const incrementLooper = (num) => {
  
};


for (let curr = 0; curr < pos; curr++) {
  if (indices.length === 0) indices.push(0);
  
  
}

console.log('alpha', alpha)
