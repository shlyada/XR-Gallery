import * as THREE from "three";


export default class Renderer {


    constructor(){

    this.renderer =
        new THREE.WebGLRenderer({
            antialias:true,
            alpha:true
        });


        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );


        this.renderer.setPixelRatio(
            window.devicePixelRatio
        );

        this.renderer.xr.enabled = false;


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