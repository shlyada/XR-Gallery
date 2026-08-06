import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


export class EnvironmentLoader {


    constructor(scene){

        this.scene = scene;

        this.loader = new GLTFLoader();

        this.loadedAssets = {};

    }



    async load(
        name,
        path,
        position = [0,0,0],
        scale = 1
    ){


        const gltf =
            await new Promise(
                (resolve,reject)=>{


                    this.loader.load(

                        path,

                        resolve,

                        undefined,

                        reject

                    );


                }
            );



        const model =
            gltf.scene;



        model.name =
            name;



        model.position.set(
            position[0],
            position[1],
            position[2]
        );



        model.scale.set(
            scale,
            scale,
            scale
        );



        this.scene.add(model);



        this.loadedAssets[name] =
            model;



        console.log(
            "Loaded asset:",
            name
        );


        return model;


    }


}