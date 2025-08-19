export class PerformanceMonitor {
  private startTime: number = 0;
  private frameCount: number = 0;
  
  start() {
    this.startTime = performance.now();
    this.frameCount = 0;
  }
  
  frame() {
    this.frameCount++;
  }
  
  end() {
    const duration = performance.now() - this.startTime;
    const fps = (this.frameCount / duration) * 1000;
    
    console.log(`
      Performance Report:
      - Total time: ${duration.toFixed(2)}ms
      - Frames: ${this.frameCount}
      - Average FPS: ${fps.toFixed(2)}
      - Points per second: ${((500 * 500) / (duration / 1000)).toFixed(0)}
    `);
  }
}
