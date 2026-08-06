import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


export class EnvironmentLoader {


    constructor(scene){

        this.scene = scene;

        this.loader = new GLTFLoader();

        this.assets = {};

    }



    loadModel(
        name,
        path,
        position = new THREE.Vector3(),
        scale = 1
    ){

        return new Promise(
            (resolve,reject)=>{


                this.loader.load(

                    path,


                    (gltf)=>{


                        const model =
                            gltf.scene;


                        model.name =
                            name;


                        model.position.copy(
                            position
                        );


                        model.scale.set(
                            scale,
                            scale,
                            scale
                        );


                        this.scene.add(
                            model
                        );


                        this.assets[name]=model;


                        resolve(model);


                    },


                    undefined,


                    (error)=>{

                        console.error(
                            "Failed loading:",
                            name,
                            error
                        );


                        reject(error);

                    }


                );


            }
        );


    }



}