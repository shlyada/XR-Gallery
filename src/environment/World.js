import { Island } from "./Island.js";
import { Vegetation } from "./Vegetation.js";
import { Fireflies } from "./Fireflies.js";


export class World {

    constructor(scene) {

        this.scene = scene;

        this.island = null;
        this.vegetation = null;
        this.fireflies = null;

        this.initialize();

    }


    initialize() {

        this.createEnvironment();

    }


    createEnvironment() {


        this.island =
            new Island();


        this.scene.add(
            this.island.group
        );


        this.vegetation =
            new Vegetation();


        this.island.group.add(
            this.vegetation.group
        );


        this.fireflies =
            new Fireflies();


        this.island.group.add(
            this.fireflies.group
        );


        console.log(
            "XR World initialized"
        );


    }


    update(elapsedTime) {


        if(this.island){

            this.island.update(
                elapsedTime
            );

        }


        if(this.fireflies){

            this.fireflies.update(
                elapsedTime
            );

        }


    }

}