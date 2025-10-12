// Frame rate control for performance optimization
export interface FrameRateConfig {
  targetFPS: number;
  enableAdaptive: boolean;
  minFPS: number;
  maxFPS: number;
}

export class FrameRateController {
  private targetFPS: number;
  private frameInterval: number;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 0;
  
  constructor(config: FrameRateConfig) {
    this.targetFPS = config.targetFPS;
    this.frameInterval = 1000 / config.targetFPS;
  }
  
  shouldRender(currentTime: number): boolean {
    if (currentTime - this.lastFrameTime < this.frameInterval) {
      return false;
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
    
    // Update FPS counter every second
    if (currentTime - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
    }
    
    return true;
  }
  
  getCurrentFPS(): number {
    return this.currentFPS;
  }
  
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }
}
