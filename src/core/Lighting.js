import * as THREE from "three";


export default class Lighting {


    constructor(scene){


        const sunlight =
            new THREE.DirectionalLight(
                0xffffff,
                3
            );


        sunlight.position.set(
            5,
            10,
            5
        );


        scene.add(
            sunlight
        );


        const ambient =
            new THREE.AmbientLight(
                0xffffff,
                1
            );


        scene.add(
            ambient
        );

    }

}