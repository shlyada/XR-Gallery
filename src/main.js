import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { World } from './environment/World.js';

class App {
  constructor() {
    this.container = document.body;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // --- 1. Scene Setup ---
    this.scene = new THREE.Scene();

    // --- 2. Camera Setup ---
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Position user at comfortable eye level near the lotus pond
    this.camera.position.set(0, 1.6, 8);

    // --- 3. Renderer Setup ---
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    // WebXR Enablement
    this.renderer.xr.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    this.container.appendChild(VRButton.createButton(this.renderer));

    // --- 4. Desktop Orbit Controls (Fallback when not in VR) ---
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0.5, 0);

    // --- 5. Initialize Sanctuary World ---
    this.world = new World(this.scene);

    // --- 6. Event Listeners ---
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // --- 7. Start Loop ---
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Update orbit controls if not currently presenting in VR
    if (!this.renderer.xr.isPresenting) {
      this.controls.update();
    }

    // Update environment & sanctuary animations
    if (this.world) {
      this.world.update(elapsedTime, deltaTime);
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Launch Application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});