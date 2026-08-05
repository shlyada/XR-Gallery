import * as THREE from "three";

export default class Lighting {

    constructor(scene) {

        const ambient = new THREE.HemisphereLight(
            0xcceeff,
            0x445533,
            1.4
        );

        scene.add(ambient);

        const sun = new THREE.DirectionalLight(
            0xfff5dd,
            4
        );

        sun.position.set(
            15,
            20,
            10
        );

        sun.castShadow = true;

        sun.shadow.mapSize.set(
            2048,
            2048
        );

        scene.add(sun);

        scene.fog = new THREE.Fog(
            0xcbefff,
            18,
            60
        );

    }

}