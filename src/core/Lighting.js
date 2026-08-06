import * as THREE from 'three';

export class Lighting {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // 1. Hemisphere light to illuminate models from both sky and ground
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x3d5c2e, 1.5);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);

        // 2. Main Directional Sunlight
        const dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
        dirLight.position.set(20, 40, 20);
        dirLight.castShadow = true;

        // Shadow Map Setup
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 150;

        const d = 40;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        // Shadow bias to eliminate pitch-black mesh glitches
        dirLight.shadow.bias = -0.0005;
        dirLight.shadow.normalBias = 0.02;

        this.scene.add(dirLight);

        // 3. Ambient Fill Light
        const ambientLight = new THREE.AmbientLight(0xe8f4f8, 0.6);
        this.scene.add(ambientLight);
    }
}

// Add default export at the bottom
export default Lighting;