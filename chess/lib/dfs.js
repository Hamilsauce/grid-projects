const shortestPathDfs = (tile = this.characterTile, stopNode = this.targetTile || this.exitTile) => {

   tile.isPathNode = true;
   // this.updateTile(tile, { isPathNode: true });

   if (tile === stopNode) return tile;

   let unvisitedNeighbors = this.getUnvisitedNeighbors(tile);

   if (unvisitedNeighbors.length == 0 && tile.previous) {
     tile.isPathNode = false;
     tile = tile.previous;
     // this.updateTile(tile, { isPathNode: false });

     while (tile && unvisitedNeighbors.length === 0) {
       tile.isPathNode = false;
       // this.updateTile(tile, { isPathNode: false });
       tile = tile.previous;

       unvisitedNeighbors = this.getUnvisitedNeighbors(tile);
     }

     return this.shortestPathDfs(tile);
   }

   else {
     this.cnt = (this.cnt || 0) + 1;

     for (var [direction, neighbor] of unvisitedNeighbors) {
       neighbor.isPathNode = true;
       neighbor.previous = tile;
       // this.updateTile(neighbor, { isPathNode: true, previous: tile });

       if (neighbor === stopNode) return neighbor;

       if (neighbor !== stopNode && unvisitedNeighbors.length > 0) {
         return this.shortestPathDfs(neighbor);
       }

       else { return tile }
     }
   }

   return tile; /* If no path, return null */
 }
