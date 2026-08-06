import * as THREE from 'three';

export class Renderer {
    constructor(container = document.body) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Enabled Shadows & Updated Shadow Map Type (Fixes Deprecation Warning)
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        // Color Space & Tone Mapping setup for modern Three.js
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    render(scene, camera) {
        if (scene && camera) {
            this.renderer.render(scene, camera);
        }
    }

    get instance() {
        return this.renderer;
    }
}

export default Renderer;