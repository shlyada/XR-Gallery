import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { LotusSanctuary } from './environment/LotusSanctuary.js';
import { createButterflyWorld } from './worlds/butterflyWorld.js';

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// World Management State
let currentWorldInstance = null;
let currentWorldGroup = null;

// Function to Cleanly Switch Between Worlds
function switchWorld(worldType) {
    console.log(`Switching world to: ${worldType}`);

    // 1. Clean up old world instance if it has a custom destroy method
    if (currentWorldInstance && typeof currentWorldInstance.destroy === 'function') {
        currentWorldInstance.destroy();
    }
    
    // 2. Remove group from scene and dispose geometries/materials to prevent memory leaks
    if (currentWorldGroup) {
        scene.remove(currentWorldGroup);
        currentWorldGroup.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    // 3. Load the newly selected world
    if (worldType === 'default') {
        currentWorldInstance = new LotusSanctuary(scene);
        currentWorldGroup = currentWorldInstance.group;
    } else if (worldType === 'butterflies') {
        currentWorldGroup = createButterflyWorld(scene);
        currentWorldInstance = {
            update: (time, delta) => {
                if (currentWorldGroup.userData && typeof currentWorldGroup.userData.update === 'function') {
                    currentWorldGroup.userData.update(time, delta);
                }
            }
        };
    }
}

// Initialize with your original world by default
switchWorld('default');

// Safe DOM Event Binding (Ensures buttons are fully loaded before attaching listeners)
window.addEventListener('DOMContentLoaded', () => {
    const defaultBtn = document.getElementById('btn-default');
    const butterflyBtn = document.getElementById('btn-butterflies');

    if (defaultBtn) {
        defaultBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchWorld('default');
        });
    } else {
        console.warn("Element with ID 'btn-default' not found in DOM.");
    }

    if (butterflyBtn) {
        butterflyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchWorld('butterflies');
        });
    } else {
        console.warn("Element with ID 'btn-butterflies' not found in DOM.");
    }
});

// Main Render Loop
const clock = new THREE.Clock();
renderer.setAnimationLoop((timestamp, frame) => {
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Trigger frame updates for active world
    if (currentWorldInstance && typeof currentWorldInstance.update === 'function') {
        currentWorldInstance.update(time, delta);
    }

    renderer.render(scene, camera);
});

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});