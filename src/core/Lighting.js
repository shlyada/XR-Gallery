import * as THREE from "three";


export default class Lighting {


    constructor(scene){


        const ambient =
            new THREE.HemisphereLight(

                0xffffff,

                0x557755,

                2

            );


        scene.add(
            ambient
        );



        const sun =
            new THREE.DirectionalLight(

                0xffffff,

                3

            );


        sun.position.set(
            10,
            20,
            10
        );


        sun.castShadow = true;


        scene.add(
            sun
        );


    }


}