import * as THREE from "three";

export default class Camera {

    constructor() {

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.camera.position.set(
            0,
            4,
            9
        );

        this.camera.lookAt(
            0,
            1.5,
            0
        );

    }

    resize() {

        this.camera.aspect =
            window.innerWidth /
            window.innerHeight;

        this.camera.updateProjectionMatrix();

    }

}