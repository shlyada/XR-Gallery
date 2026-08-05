import SceneManager from "./core/SceneManager.js";
import Camera from "./core/Camera.js";
import Renderer from "./core/Renderer.js";
import Lighting from "./core/Lighting.js";
import AnimationLoop from "./core/AnimationLoop.js";
import XRManager from "./xr/XRManager.js";
import { World } from "./environment/World.js";
import * as THREE from "three";


// Core Systems
const sceneManager = new SceneManager();
const camera = new Camera();
const renderer = new Renderer();


// XR
new XRManager(
    renderer.renderer
);


// Lighting
new Lighting(
    sceneManager.scene
);


// World
const world = new World(
    sceneManager.scene
);


// Timer
const clock = new THREE.Clock();


// Animation Loop
const loop = new AnimationLoop(

    renderer.renderer,

    () => {

        const elapsedTime = clock.getElapsedTime();

        world.update(
            elapsedTime
        );

        renderer.render(
            sceneManager.scene,
            camera.camera
        );

    }

);

loop.start();