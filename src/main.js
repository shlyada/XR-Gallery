import SceneManager from "./core/SceneManager.js";
import Camera from "./core/Camera.js";
import Renderer from "./core/Renderer.js";
import Lighting from "./core/Lighting.js";
import AnimationLoop from "./core/AnimationLoop.js";
import * as THREE from "three";
import XRManager from "./xr/XRManager.js";
import { World } from "./environment/World.js";


// Create scene
const scene =
    new THREE.Scene();


// Initialize core systems
const sceneManager =
    new SceneManager();


const camera =
    new Camera();


const renderer =
    new Renderer();


// Initialize XR
const xr =
    new XRManager(
        renderer.renderer
    );


// Initialize world environment
const world =
    new World(
        sceneManager.scene
    );


// Initialize lighting
new Lighting(
    sceneManager.scene
);


// Start animation loop
const loop =
    new AnimationLoop(
        renderer.renderer,
        () => {

            renderer.render(
                sceneManager.scene,
                camera.camera
            );

        }
    );

loop.start();