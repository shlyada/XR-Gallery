import * as THREE from "three";


export default class Renderer {


    constructor(){

        this.renderer =
            new THREE.WebGLRenderer({
                antialias:true
            });


        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        this.renderer.setPixelRatio(
            window.devicePixelRatio
        );


        document.body.appendChild(
            this.renderer.domElement
        );

    }


    render(scene,camera){

        this.renderer.render(
            scene,
            camera
        );

    }


    resize(){

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

}