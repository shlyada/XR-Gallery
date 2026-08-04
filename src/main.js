import SceneManager from "./core/SceneManager.js";
import Camera from "./core/Camera.js";
import Renderer from "./core/Renderer.js";
import Lighting from "./core/Lighting.js";
import AnimationLoop from "./core/AnimationLoop.js";
import * as THREE from "three";
import XRManager from "./xr/XRManager.js";



const sceneManager =
    new SceneManager();


const camera =
    new Camera();


const renderer =
    new Renderer();


const xr =
    new XRManager(
        renderer.renderer
    );



new Lighting(
    sceneManager.scene
);

const geometry =
    new THREE.BoxGeometry();


const material =
    new THREE.MeshStandardMaterial({
        color:0xff69b4
    });


const cube =
    new THREE.Mesh(
        geometry,
        material
    );


sceneManager.scene.add(
    cube
);

const loop =
    new AnimationLoop(
        renderer.renderer,
        ()=>{

            renderer.render(
                sceneManager.scene,
                camera.camera
            );

        }
    );