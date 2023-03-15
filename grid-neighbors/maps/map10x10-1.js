const TileIndex = [
  {
    index: 0,
    type: 'empty',
  },
  {
    index: 1,
    type: 'barrier',
  },
]
const _map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const map10x10 = {
  width: _map[0].length,
  height: _map.length,
  tiles: _map.map((row, rowNumber) => {
    return row.map((typeId, columnNumber) => {
      return {
        type: TileIndex[typeId || 0].type,
        x: columnNumber,
        y: rowNumber
      }
    })
  })
}