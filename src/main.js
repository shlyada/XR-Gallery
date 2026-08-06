import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { LotusSanctuary } from './environment/LotusSanctuary.js';
import { createButterflyWorld } from './worlds/butterflyWorld.js';

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.8, 5); // Well-positioned viewing distance

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// World Management State
let currentWorldInstance = null;
let currentWorldGroup = null;

// Keyboard Movement State Tracking
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// Function to Cleanly Switch Between Worlds
function switchWorld(worldType) {
    if (currentWorldInstance && typeof currentWorldInstance.destroy === 'function') {
        currentWorldInstance.destroy();
    }
    
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

    if (worldType === 'default') {
        currentWorldInstance = new LotusSanctuary(scene);
        currentWorldGroup = currentWorldInstance.group;
        camera.position.set(0, 1.6, 2);
    } else if (worldType === 'butterflies') {
        currentWorldGroup = createButterflyWorld(scene);
        camera.position.set(0, 1.8, 6); // Perfect overview position for butterfly world
        currentWorldInstance = {
            update: (time, delta) => {
                if (currentWorldGroup.userData && typeof currentWorldGroup.userData.update === 'function') {
                    currentWorldGroup.userData.update(time, delta);
                }
            }
        };
    }
}

// Initialize with default world
switchWorld('default');

// UI Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-default').addEventListener('click', (e) => {
        e.preventDefault();
        switchWorld('default');
    });
    document.getElementById('btn-butterflies').addEventListener('click', (e) => {
        e.preventDefault();
        switchWorld('butterflies');
    });
});

// Main Render Loop with Keyboard Movement Handling
const clock = new THREE.Clock();
renderer.setAnimationLoop((timestamp, frame) => {
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Arrow Key Navigation (Move & Zoom)
    const moveSpeed = 4.0 * delta;
    if (keys.ArrowUp) camera.position.z -= moveSpeed;    // Zoom In / Move Forward
    if (keys.ArrowDown) camera.position.z += moveSpeed;  // Zoom Out / Move Backward
    if (keys.ArrowLeft) camera.position.x -= moveSpeed;  // Move Left
    if (keys.ArrowRight) camera.position.x += moveSpeed; // Move Right

    // Trigger active world animations
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