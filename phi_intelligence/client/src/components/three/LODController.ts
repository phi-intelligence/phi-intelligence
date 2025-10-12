// Level of Detail controller for adaptive performance
export interface LODConfig {
  high: { particleCount: number; maxConnections: number; minDistance: number };
  medium: { particleCount: number; maxConnections: number; minDistance: number };
  low: { particleCount: number; maxConnections: number; minDistance: number };
}

export class LODController {
  private currentLevel: 'high' | 'medium' | 'low' = 'medium';
  private performanceHistory: number[] = [];
  private frameTimeThresholds = { high: 16, medium: 33, low: 50 }; // ms
  
  constructor(private config: LODConfig) {}
  
  updatePerformance(frameTime: number): void {
    this.performanceHistory.push(frameTime);
    if (this.performanceHistory.length > 60) { // Keep last 60 frames
      this.performanceHistory.shift();
    }
    
    const avgFrameTime = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
    this.adjustLOD(avgFrameTime);
  }
  
  private adjustLOD(avgFrameTime: number): void {
    let newLevel: 'high' | 'medium' | 'low';
    
    if (avgFrameTime <= this.frameTimeThresholds.high) {
      newLevel = 'high';
    } else if (avgFrameTime <= this.frameTimeThresholds.medium) {
      newLevel = 'medium';
    } else {
      newLevel = 'low';
    }
    
    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      this.onLODChange(newLevel);
    }
  }
  
  getCurrentConfig() {
    return this.config[this.currentLevel];
  }
  
  private onLODChange(level: 'high' | 'medium' | 'low'): void {
    console.log(`LOD changed to: ${level}`);
    // Could emit event for parent component to handle
  }
}
