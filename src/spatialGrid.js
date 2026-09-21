// High-Performance 2D Spatial Hash Grid for Swarm Optimization

export class SpatialGrid {
  constructor(cellSize = 6) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  _hash(cx, cz) {
    return `${cx},${cz}`;
  }

  _getCellCoord(val) {
    return Math.floor(val / this.cellSize);
  }

  insert(entity) {
    const cx = this._getCellCoord(entity.x);
    const cz = this._getCellCoord(entity.z);
    const key = this._hash(cx, cz);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(entity);
  }

  queryRadius(x, z, radius) {
    const minCx = this._getCellCoord(x - radius);
    const maxCx = this._getCellCoord(x + radius);
    const minCz = this._getCellCoord(z - radius);
    const maxCz = this._getCellCoord(z + radius);

    const radiusSq = radius * radius;
    const results = [];

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const cell = this.grid.get(this._hash(cx, cz));
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const e = cell[i];
            const dx = e.x - x;
            const dz = e.z - z;
            if (dx * dx + dz * dz <= radiusSq) {
              results.push(e);
            }
          }
        }
      }
    }
    return results;
  }
}
