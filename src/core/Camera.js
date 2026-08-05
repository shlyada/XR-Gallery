import * as THREE from "three";

export default class Camera {

    constructor() {

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Pull back and look slightly down toward the island
        this.camera.position.set(
            0,
            4,
            12
        );

        this.camera.lookAt(
            0,
            2,
            0
        );

    }

    resize() {

        this.camera.aspect =
            window.innerWidth / window.innerHeight;

        this.camera.updateProjectionMatrix();

    }

}