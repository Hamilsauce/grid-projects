export const moveMap = new Map([
  ['pawn', [
    { file: 0, rank: -1 },
  ]],
  ['rook', [
    { file: 0, rank: 1 },
  ]],
]);

export class PieceModel {
  #name = null;

  constructor(name) {
    this.#name = name;
  }



  get name() { return this.#name }
}