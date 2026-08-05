import * as THREE from "three";

export default class Renderer {

    constructor() {

        this.renderer = new THREE.WebGLRenderer({

            antialias: true,
            alpha: false

        });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        // Better color management
        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        // Filmic tone mapping
        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure = 1.15;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        this.renderer.xr.enabled = false;

        document.body.appendChild(
            this.renderer.domElement
        );

    }

    render(scene, camera) {

        this.renderer.render(scene, camera);

    }

    resize() {

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

}