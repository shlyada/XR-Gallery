import { Island } from "./Island.js";
import { Vegetation } from "./Vegetation.js";
import { Sky } from "./Sky.js";
import { Fireflies } from "./Fireflies.js"
import { Water } from "./Water.js";


export class World {


    constructor(scene){

        this.scene = scene;

        this.island = null;

        this.vegetation = null;

        this.sky = null;

        this.water = null;


        this.initialize();

    }



    initialize(){

        this.createEnvironment();

    }



    createEnvironment(){


        this.sky =
            new Sky(
                this.scene
            );


        this.island =
            new Island();



        this.scene.add(
            this.island.group
        );

        this.water = new Water();

        this.island.group.add(
            this.water.group
        );


        this.vegetation =
            new Vegetation();



        this.island.group.add(
            this.vegetation.group
        );


        console.log(
            "XR World initialized"
        );


    }



    update(elapsedTime){


        if(this.island){

            this.island.update(
                elapsedTime
            );

        }


        if(this.sky){

            this.sky.update(
                elapsedTime
            );

        }

        if(this.water){

            this.water.update(
                
            );

        }


    }


}