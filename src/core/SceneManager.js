import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";


export default class SceneManager {


    constructor(){


        this.scene =
            new THREE.Scene();



        const sky =
            new Sky();


        sky.scale.setScalar(
            450000
        );


        const uniforms =
            sky.material.uniforms;



        uniforms.turbidity.value =
            6;


        uniforms.rayleigh.value =
            2;


        uniforms.mieCoefficient.value =
            0.005;


        uniforms.mieDirectionalG.value =
            0.8;



        const sun =
            new THREE.Vector3();



        sun.setFromSphericalCoords(

            1,

            THREE.MathUtils.degToRad(70),

            THREE.MathUtils.degToRad(180)

        );



        uniforms.sunPosition.value =
            sun;



        this.scene.add(
            sky
        );



        this.scene.fog =
            new THREE.Fog(

                0xbfd8ff,

                35,

                160

            );


    }


}