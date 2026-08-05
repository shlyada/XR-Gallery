import { LotusSanctuary } from "./LotusSanctuary.js";


export class World {


    constructor(scene){

        this.scene = scene;


        this.createWorld();

    }



    createWorld(){

        this.sanctuary =
            new LotusSanctuary(
                this.scene
            );

    }



    update(elapsedTime){

        // Future systems will update here:
        // butterflies
        // water animation
        // fireflies
        // particles

    }


}