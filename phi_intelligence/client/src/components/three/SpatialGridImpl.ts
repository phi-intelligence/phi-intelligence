// Spatial partitioning for efficient neighbor finding
export interface SpatialGrid {
  gridSize: number;
  cells: Map<string, number[]>;
  addParticle: (x: number, y: number, z: number, particleIndex: number) => void;
  getNearbyParticles: (x: number, y: number, z: number, radius: number) => number[];
  clear: () => void;
}

export class SpatialGridImpl implements SpatialGrid {
  gridSize: number;
  cells: Map<string, number[]>;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.cells = new Map();
  }
  
  private getCellKey(x: number, y: number, z: number): string {
    const cellX = Math.floor(x / this.gridSize);
    const cellY = Math.floor(y / this.gridSize);
    const cellZ = Math.floor(z / this.gridSize);
    return `${cellX},${cellY},${cellZ}`;
  }
  
  addParticle(x: number, y: number, z: number, particleIndex: number): void {
    const key = this.getCellKey(x, y, z);
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key)!.push(particleIndex);
  }
  
  getNearbyParticles(x: number, y: number, z: number, radius: number): number[] {
    const nearby: number[] = [];
    const cellRadius = Math.ceil(radius / this.gridSize);
    const centerCell = this.getCellKey(x, y, z);
    const [centerX, centerY, centerZ] = centerCell.split(',').map(Number);
    
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        for (let dz = -cellRadius; dz <= cellRadius; dz++) {
          const key = `${centerX + dx},${centerY + dy},${centerZ + dz}`;
          const particles = this.cells.get(key);
          if (particles) {
            nearby.push(...particles);
          }
        }
      }
    }
    return nearby;
  }
  
  clear(): void {
    this.cells.clear();
  }
}
