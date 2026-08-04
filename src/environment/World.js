import { Island } from "./Island.js";

export class World {

    constructor(scene) {

        this.scene = scene;

        this.initialize();

    }

    initialize() {

        this.createEnvironment();

    }

    createEnvironment() {

        const island = new Island();

        this.scene.add(
            island.group
        );

        console.log("XR World initialized");

    }

}