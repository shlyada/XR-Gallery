import { Island } from "./Island.js";

export class World {

    constructor(scene) {

        this.scene = scene;

        this.island = null;

        this.initialize();

    }

    initialize() {

        this.createEnvironment();

    }

    createEnvironment() {

        this.island = new Island();

        this.scene.add(
            this.island.group
        );

        console.log("XR World initialized");

    }

    update(elapsedTime) {

        if (this.island) {

            this.island.update(elapsedTime);

        }

    }

}