import * as THREE from 'three';

import { createButterflyWorld } from './worlds/butterflyWorld.js';

import ArtGallery from './systems/ArtGallery.js';
import DrawingStudio from './ui/DrawingStudio.js';


// ============================================================
// BLOOMXR — DREAMING OF BUTTERFLIES
// MAIN APPLICATION
// ============================================================
//
// There is now ONE dominant world:
//
//                 DREAMING OF BUTTERFLIES
//
// The Sanctuary Gallery lives permanently inside it.
//
// ============================================================


// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(
        0xcfe6df
    );


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        70,

        window.innerWidth /
            window.innerHeight,

        0.1,

        1000

    );


camera.position.set(
    0,
    1.8,
    8
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias:
            true,

        alpha:
            false,

        powerPreference:
            'high-performance'

    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.xr.enabled =
    true;


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.10;


renderer.domElement.style.position =
    'fixed';


renderer.domElement.style.inset =
    '0';


renderer.domElement.style.width =
    '100%';


renderer.domElement.style.height =
    '100%';


renderer.domElement.style.display =
    'block';


document.body.appendChild(
    renderer.domElement
);


// ============================================================
// IMPORTANT
// ============================================================
//
// VRButton is intentionally NOT added.
//
// This removes the ugly:
//
//     VR NOT SUPPORTED
//
// button from the presentation.
// WebXR rendering remains enabled.
//
// ============================================================


// ============================================================
// XR CONTROLLERS
// ============================================================

const controller1 =
    renderer.xr.getController(
        0
    );


const controller2 =
    renderer.xr.getController(
        1
    );


scene.add(
    controller1
);


scene.add(
    controller2
);


// ============================================================
// CAMERA STATE
// ============================================================

const cameraState = {

    yaw:
        0,

    pitch:
        -0.04,

    moveSpeed:
        4.5,

    rotateSpeed:
        1.5,

    mouseSensitivity:
        0.0032,

    pitchSensitivity:
        0.0025,

    minPitch:
        -Math.PI *
        0.45,

    maxPitch:
        Math.PI *
        0.45

};


// ============================================================
// CAMERA ROTATION
// ============================================================

function updateCameraRotation() {

    camera.quaternion.setFromEuler(

        new THREE.Euler(

            cameraState.pitch,

            cameraState.yaw,

            0,

            'YXZ'

        )

    );

}


updateCameraRotation();


// ============================================================
// CAMERA POSE
// ============================================================

function setCameraPose(
    position,
    target
) {

    camera.position.copy(
        position
    );


    const direction =
        target.clone()
            .sub(
                position
            )
            .normalize();


    cameraState.yaw =
        Math.atan2(
            -direction.x,
            -direction.z
        );


    cameraState.pitch =
        Math.asin(
            THREE.MathUtils.clamp(
                direction.y,
                -1,
                1
            )
        );


    cameraState.pitch =
        THREE.MathUtils.clamp(

            cameraState.pitch,

            cameraState.minPitch,

            cameraState.maxPitch

        );


    updateCameraRotation();

}


// ============================================================
// GALLERY
// ============================================================
//
// This is a permanent part of the Dreaming world.
// ============================================================

const artGallery =
    new ArtGallery({

        scene,

        camera,

        renderer,

        galleryCenter:
            new THREE.Vector3(
                25,
                0,
                -8
            )

    });


// ============================================================
// DRAWING STUDIO
// ============================================================

const drawingStudio =
    new DrawingStudio({

        scene,

        camera,

        renderer,

        artGallery

    });


// ============================================================
// CONNECT XR CONTROLLERS
// ============================================================

if (
    typeof drawingStudio.addXRController ===
    'function'
) {

    drawingStudio.addXRController(
        controller1
    );


    drawingStudio.addXRController(
        controller2
    );

}


if (
    typeof artGallery.addXRController ===
    'function'
) {

    artGallery.addXRController(
        controller1
    );


    artGallery.addXRController(
        controller2
    );

}


// ============================================================
// KEYBOARD
// ============================================================

const keys = {

    ArrowUp:
        false,

    ArrowDown:
        false,

    ArrowLeft:
        false,

    ArrowRight:
        false,

    KeyW:
        false,

    KeyA:
        false,

    KeyS:
        false,

    KeyD:
        false

};


window.addEventListener(
    'keydown',
    event => {

        if (
            Object.prototype.hasOwnProperty.call(
                keys,
                event.code
            )
        ) {

            keys[event.code] =
                true;


            if (
                event.code.startsWith(
                    'Arrow'
                )
            ) {

                event.preventDefault();

            }

        }

    }
);


window.addEventListener(
    'keyup',
    event => {

        if (
            Object.prototype.hasOwnProperty.call(
                keys,
                event.code
            )
        ) {

            keys[event.code] =
                false;

        }

    }
);


// ============================================================
// MOVEMENT
// ============================================================

function updateKeyboardMovement(
    delta
) {

    if (
        renderer.xr.isPresenting
    ) {

        return;

    }


    // --------------------------------------------------------
    // Rotate
    // --------------------------------------------------------

    if (
        keys.ArrowLeft
    ) {

        cameraState.yaw +=
            cameraState.rotateSpeed *
            delta;

    }


    if (
        keys.ArrowRight
    ) {

        cameraState.yaw -=
            cameraState.rotateSpeed *
            delta;

    }


    updateCameraRotation();


    // --------------------------------------------------------
    // Forward vector
    // --------------------------------------------------------

    const forward =
        new THREE.Vector3();


    camera.getWorldDirection(
        forward
    );


    forward.y =
        0;


    if (
        forward.lengthSq() >
        0
    ) {

        forward.normalize();

    }


    // --------------------------------------------------------
    // Right vector
    // --------------------------------------------------------

    const right =
        new THREE.Vector3();


    right.crossVectors(

        forward,

        new THREE.Vector3(
            0,
            1,
            0
        )

    ).normalize();


    let forwardInput =
        0;


    if (
        keys.ArrowUp ||
        keys.KeyW
    ) {

        forwardInput +=
            1;

    }


    if (
        keys.ArrowDown ||
        keys.KeyS
    ) {

        forwardInput -=
            1;

    }


    let strafeInput =
        0;


    if (
        keys.KeyA
    ) {

        strafeInput -=
            1;

    }


    if (
        keys.KeyD
    ) {

        strafeInput +=
            1;

    }


    if (
        forwardInput
    ) {

        camera.position.addScaledVector(

            forward,

            forwardInput *
                cameraState.moveSpeed *
                delta

        );

    }


    if (
        strafeInput
    ) {

        camera.position.addScaledVector(

            right,

            strafeInput *
                cameraState.moveSpeed *
                delta

        );

    }


    camera.position.y =
        Math.max(
            1.3,
            camera.position.y
        );

}


// ============================================================
// MOUSE LOOK
// ============================================================

let mouseLooking =
    false;


let lastMouseX =
    0;


let lastMouseY =
    0;


renderer.domElement.addEventListener(
    'pointerdown',
    event => {

        /*
         * Butterfly interaction gets priority.
         */

        const butterflyWorld =
            currentWorldGroup
                ?.userData
                ?.butterflyWorld;


        if (
            butterflyWorld &&
            typeof butterflyWorld.handlePointer ===
            'function'
        ) {

            const handled =
                butterflyWorld.handlePointer(
                    event
                );


            if (
                handled
            ) {

                return;

            }

        }


        if (
            drawingStudio.isOpen
        ) {

            return;

        }


        /*
         * Gallery selection is handled on click rather than
         * pointerdown so movement does not accidentally delete.
         */

        mouseLooking =
            true;


        lastMouseX =
            event.clientX;


        lastMouseY =
            event.clientY;


        renderer.domElement
            .setPointerCapture?.(
                event.pointerId
            );

    }
);


renderer.domElement.addEventListener(
    'pointermove',
    event => {

        if (
            !mouseLooking ||
            drawingStudio.isOpen
        ) {

            return;

        }


        const dx =
            event.clientX -
            lastMouseX;


        const dy =
            event.clientY -
            lastMouseY;


        lastMouseX =
            event.clientX;


        lastMouseY =
            event.clientY;


        cameraState.yaw -=
            dx *
            cameraState.mouseSensitivity;


        cameraState.pitch -=
            dy *
            cameraState.pitchSensitivity;


        cameraState.pitch =
            THREE.MathUtils.clamp(

                cameraState.pitch,

                cameraState.minPitch,

                cameraState.maxPitch

            );


        updateCameraRotation();

    }
);


window.addEventListener(
    'pointerup',
    () => {

        mouseLooking =
            false;

    }
);


// ============================================================
// CURRENT WORLD
// ============================================================

let currentWorldGroup =
    null;


let currentWorldInstance =
    null;


// ============================================================
// START DREAMING WORLD
// ============================================================

function startDreamingWorld() {

    const group =
        createButterflyWorld(

            scene,

            camera,

            renderer,

            [
                controller1,
                controller2
            ],

            {

                onCameraPose:
                    setCameraPose

            }

        );


    if (
        !group ||
        !group.isObject3D
    ) {

        throw new Error(
            'Dreaming of Butterflies failed to create.'
        );

    }


    currentWorldGroup =
        group;


    const world =
        group.userData
            ?.butterflyWorld;


    if (
        !world
    ) {

        throw new Error(
            'ButterflyWorld controller is missing.'
        );

    }


    currentWorldInstance = {

        group,

        update(
            time,
            delta
        ) {

            world.update(
                time,
                delta
            );

        },

        destroy() {

            world.destroy();

        }

    };


    /*
     * The gallery lives INSIDE the world at its anchor.
     */

    artGallery.attachToWorld(
        currentWorldGroup
    );


    artGallery.group.visible =
        true;

}


// ============================================================
// GALLERY FOCUS
// ============================================================

function focusGallery() {

    const position =
        artGallery.getEntrancePosition();


    const target =
        artGallery.getFocusTarget();


    setCameraPose(
        position,
        target
    );

}


// ============================================================
// GALLERY BUTTON
// ============================================================

function setupGalleryButton() {

    let button =
        document.getElementById(
            'btn-gallery'
        );


    if (
        !button
    ) {

        button =
            document.createElement(
                'button'
            );


        button.id =
            'btn-gallery';


        button.type =
            'button';


        button.textContent =
            '◈ Gallery';


        Object.assign(
            button.style,
            {

                position:
                    'fixed',

                right:
                    '175px',

                bottom:
                    '20px',

                zIndex:
                    '4200',

                padding:
                    '10px 17px',

                borderRadius:
                    '11px',

                border:
                    '1px solid rgba(231,237,225,0.26)',

                background:
                    'rgba(55,95,68,0.90)',

                color:
                    '#f3f7ed',

                font:
                    '600 13px Arial',

                cursor:
                    'pointer'

            }
        );


        document.body.appendChild(
            button
        );

    }


    button.addEventListener(
        'click',
        focusGallery
    );

}


// ============================================================
// CREATE ART BUTTON
// ============================================================

function setupCreateArtButton() {

    let button =
        document.getElementById(
            'btn-create-art'
        );


    if (
        !button
    ) {

        button =
            document.createElement(
                'button'
            );


        button.id =
            'btn-create-art';


        button.type =
            'button';


        button.innerHTML =
            '✦ Create Art';


        Object.assign(
            button.style,
            {

                position:
                    'fixed',

                right:
                    '22px',

                bottom:
                    '20px',

                zIndex:
                    '4200',

                padding:
                    '11px 19px',

                borderRadius:
                    '13px',

                border:
                    '1px solid rgba(224,235,220,0.34)',

                background:
                    'rgba(67,108,74,0.96)',

                color:
                    '#f7faef',

                font:
                    '600 14px Arial',

                cursor:
                    'pointer',

                boxShadow:
                    '0 10px 28px rgba(0,0,0,0.16)'

            }
        );


        document.body.appendChild(
            button
        );

    }


    button.addEventListener(
        'click',
        event => {

            event.preventDefault();


            drawingStudio.open();

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

startDreamingWorld();

setupGalleryButton();

setupCreateArtButton();


// ============================================================
// LOOP
// ============================================================

const clock =
    new THREE.Clock();


renderer.setAnimationLoop(
    (
        timestamp,
        frame
    ) => {

        const delta =
            clock.getDelta();


        const time =
            clock.getElapsedTime();


        updateKeyboardMovement(
            delta
        );


        if (
            currentWorldInstance
        ) {

            currentWorldInstance.update(
                time,
                delta
            );

        }


        artGallery.update(
            time,
            delta
        );


        drawingStudio.update(
            time,
            delta,
            frame
        );


        renderer.render(
            scene,
            camera
        );

    }
);


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    'resize',
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ============================================================
// DEBUG
// ============================================================

window.BloomXR = {

    scene,

    camera,

    renderer,

    artGallery,

    drawingStudio,

    currentWorldGroup,

    get butterflyWorld() {

        return (
            currentWorldGroup
                ?.userData
                ?.butterflyWorld ||
            null
        );

    },

    focusGallery,

    nextChapter() {

        currentWorldGroup
            ?.userData
            ?.butterflyWorld
            ?.nextChapter?.();

    },

    previousChapter() {

        currentWorldGroup
            ?.userData
            ?.butterflyWorld
            ?.previousChapter?.();

    },

    restartDream() {

        currentWorldGroup
            ?.userData
            ?.butterflyWorld
            ?.restart?.();

    }

};