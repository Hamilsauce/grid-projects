export const MapObjectGraph = {
  Map: {
    // Is a/Extends Collextion of Layers

    Layer: {
      // Is a/Extends Matrix of Tiles

      SlotPosition: {
        // Is a/Extends Point, coordinate in the matrix
        // Has edges to neighbors, 
        // contains reference to occupying Entities
        
        Tile: {
          
        }
      }
    }

  }
}

export const MapObjectModel = {
  Map: {
    id: String,
    name: String,
    author: Date,
    created: Date,
    modified: Date,
    dimensions: {
      width: Number,
      height: Number,
      tileSize: 1,
    },
    origin: {
      x: Number,
      y: Number
    },
    Layers: new Map([
      ['name/id', {
        id: String,
        name: String,
        index: Number,
        Tiles
      }]
    ]),
  }
}