import * as THREE from "three";


export default class Camera {


    constructor(){


        this.camera =
            new THREE.PerspectiveCamera(

                60,

                window.innerWidth /
                window.innerHeight,

                0.1,

                500

            );



        this.camera.position.set(

            0,

            3,

            12

        );



        this.camera.lookAt(

            0,

            1,

            0

        );


    }


}