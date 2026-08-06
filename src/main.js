import * as THREE from 'three';
//import { Timer } from 'three/addons/misc/Timer.js';
import { SceneManager } from './core/SceneManager.js';
import { Camera } from './core/Camera.js';
import { Renderer } from './core/Renderer.js';
import { Lighting } from './core/Lighting.js';
import { AnimationLoop } from './core/AnimationLoop.js';
import { World } from './environment/World.js';
import { EnvironmentLoader } from './environment/EnvironmentLoader.js';

async function init() {
    // 1. Core Scene Setup
    const sceneManager = new SceneManager();
    const cameraSystem = new Camera();
    const rendererSystem = new Renderer();
    const lighting = new Lighting(sceneManager.scene);

    // 2. Loaders & Environment
    const loader = new EnvironmentLoader();
    const world = new World(sceneManager.scene, loader);
    await world.init();

    // 3. Timer Fix (Replaces deprecated THREE.Clock)
    const timer = new Timer();

    // 4. Start Animation Loop
    const animationLoop = new AnimationLoop(() => {
        timer.update();
        const delta = timer.getDelta();

        // Update World & Render Frame
        world.update(delta);
        rendererSystem.render(sceneManager.scene, cameraSystem.camera);
    });

    animationLoop.start(rendererSystem.instance);
}

init().catch((err) => console.error("Initialization Error:", err));