import { LotusSanctuary } from '../environment/LotusSanctuary.js';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.sanctuary = null;
    
    this.init();
  }

  init() {
    // Instantiate the procedural Lotus Sanctuary environment
    this.sanctuary = new LotusSanctuary(this.scene);
  }

  /**
   * Main frame update for world dynamic elements (e.g. water movement, fireflies, particle physics)
   * @param {number} time - Elapsed time in seconds
   * @param {number} deltaTime - Time elapsed since last frame
   */
  update(time, deltaTime) {
    if (this.sanctuary) {
      this.sanctuary.update(time, deltaTime);
    }
  }
}