import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

import * as WorldModule from './worlds/World.js';
import * as ButterflyWorldModule from './worlds/ButterflyWorld.js';

import ArtGallery from './systems/ArtGallery.js';
import DrawingStudio from './ui/DrawingStudio.js';


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x06101c);


const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth /
            window.innerHeight,
        0.05,
        1000
    );


camera.position.set(
    0,
    1.7,
    5.5
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
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


renderer.xr.enabled = true;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.05;


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
// XR
// ============================================================

document.body.appendChild(
    VRButton.createButton(
        renderer
    )
);


// ============================================================
// WORLD STATE
// ============================================================

let currentWorldInstance =
    null;

let currentWorldGroup =
    null;

let currentWorldType =
    null;


// ============================================================
// ART GALLERY
// ============================================================

/*
 * IMPORTANT:
 *
 * The gallery is persistent.
 * It is NOT attached permanently to a world group,
 * because worlds are destroyed and recreated when switching.
 *
 * It is placed forward enough that the main sanctuary
 * pond remains visible.
 */

const artGallery =
    new ArtGallery({

        scene,

        camera,

        renderer,

        galleryCenter:
            new THREE.Vector3(
                0,
                0,
                2.8
            ),

        width: 24,

        depth: 18,

        height: 5.5

    });


// ============================================================
// DRAWING STUDIO
// ============================================================

const drawingStudio =
    new DrawingStudio({

        scene,

        camera,

        renderer,

        gallery:
            artGallery

    });


// ============================================================
// XR CONTROLLERS FOR DRAWING
// ============================================================

const controller1 =
    renderer.xr.getController(0);

const controller2 =
    renderer.xr.getController(1);


scene.add(
    controller1
);

scene.add(
    controller2
);


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


// ============================================================
// CAMERA STATE
// ============================================================

const cameraState = {

    yaw: 0,

    pitch: -0.06,

    moveSpeed: 5.0,

    rotateSpeed: 1.75,

    lookSensitivity: 0.0035,

    pitchSensitivity: 0.0028,

    minPitch:
        -Math.PI * 0.46,

    maxPitch:
        Math.PI * 0.46

};


// ============================================================
// KEYBOARD STATE
// ============================================================

const keys = {

    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,

    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false

};


// ============================================================
// CAMERA ROTATION
// ============================================================

function updateCameraRotation() {

    const quaternion =
        new THREE.Quaternion();


    quaternion.setFromEuler(
        new THREE.Euler(
            cameraState.pitch,
            cameraState.yaw,
            0,
            'YXZ'
        )
    );


    camera.quaternion.copy(
        quaternion
    );

}


updateCameraRotation();


// ============================================================
// CAMERA MOVEMENT
// ============================================================

function updateKeyboardMovement(
    delta
) {

    /*
     * Headset movement is handled by WebXR.
     */

    if (
        renderer.xr.isPresenting
    ) {

        return;

    }


    // --------------------------------------------------------
    // Rotation
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
    // Direction vectors
    // --------------------------------------------------------

    const forward =
        new THREE.Vector3();


    camera.getWorldDirection(
        forward
    );


    forward.y = 0;


    if (
        forward.lengthSq() > 0
    ) {

        forward.normalize();

    }


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


    // --------------------------------------------------------
    // Forward / Back
    // --------------------------------------------------------

    let forwardInput = 0;


    if (
        keys.ArrowUp ||
        keys.KeyW
    ) {

        forwardInput += 1;

    }


    if (
        keys.ArrowDown ||
        keys.KeyS
    ) {

        forwardInput -= 1;

    }


    // --------------------------------------------------------
    // Strafing
    // --------------------------------------------------------

    let strafeInput = 0;


    if (
        keys.KeyD
    ) {

        strafeInput += 1;

    }


    if (
        keys.KeyA
    ) {

        strafeInput -= 1;

    }


    // --------------------------------------------------------
    // Apply
    // --------------------------------------------------------

    if (
        forwardInput !== 0
    ) {

        camera.position.addScaledVector(
            forward,
            forwardInput *
                cameraState.moveSpeed *
                delta
        );

    }


    if (
        strafeInput !== 0
    ) {

        camera.position.addScaledVector(
            right,
            strafeInput *
                cameraState.moveSpeed *
                delta
        );

    }


    // --------------------------------------------------------
    // Don't allow walking underground
    // --------------------------------------------------------

    camera.position.y =
        Math.max(
            camera.position.y,
            1.25
        );


    // --------------------------------------------------------
    // Very generous world bounds
    // --------------------------------------------------------

    camera.position.x =
        THREE.MathUtils.clamp(
            camera.position.x,
            -60,
            60
        );


    camera.position.z =
        THREE.MathUtils.clamp(
            camera.position.z,
            -70,
            45
        );

}


// ============================================================
// MOUSE LOOK
// ============================================================

let mouseLooking =
    false;

let previousMouseX =
    0;

let previousMouseY =
    0;


renderer.domElement.addEventListener(
    'pointerdown',
    (event) => {

        /*
         * Don't capture camera look while
         * drawing is open.
         */

        if (
            drawingStudio &&
            drawingStudio.isOpen
        ) {

            return;

        }


        mouseLooking = true;

        previousMouseX =
            event.clientX;

        previousMouseY =
            event.clientY;


        renderer.domElement
            .setPointerCapture?.(
                event.pointerId
            );

    }
);


renderer.domElement.addEventListener(
    'pointermove',
    (event) => {

        if (
            !mouseLooking
        ) {

            return;

        }


        if (
            drawingStudio &&
            drawingStudio.isOpen
        ) {

            return;

        }


        const dx =
            event.clientX -
            previousMouseX;


        const dy =
            event.clientY -
            previousMouseY;


        previousMouseX =
            event.clientX;

        previousMouseY =
            event.clientY;


        cameraState.yaw -=
            dx *
            cameraState.lookSensitivity;


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

        mouseLooking = false;

    }
);


// ============================================================
// KEYBOARD LISTENERS
// ============================================================

window.addEventListener(
    'keydown',
    (event) => {

        if (
            Object.prototype.hasOwnProperty.call(
                keys,
                event.code
            )
        ) {

            keys[event.code] = true;


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
    (event) => {

        if (
            Object.prototype.hasOwnProperty.call(
                keys,
                event.code
            )
        ) {

            keys[event.code] = false;

        }

    }
);


// ============================================================
// GENERIC WORLD RESOLUTION
// ============================================================

/*
 * The earlier implementation assumed a handful of exact
 * export names. That was the source of your current error.
 *
 * This version checks:
 *
 * - default export
 * - named exports
 * - Object3D exports
 * - functions returning Object3D
 * - objects exposing group/object/world/root
 *
 * So your existing World.js does not need to be rewritten.
 */

function findWorldCandidate(
    module
) {

    if (
        !module
    ) {

        return null;

    }


    // --------------------------------------------------------
    // 1. Direct Object3D export
    // --------------------------------------------------------

    if (
        module.isObject3D
    ) {

        return module;

    }


    // --------------------------------------------------------
    // 2. Common object wrappers
    // --------------------------------------------------------

    const directProperties = [

        'group',
        'object',
        'world',
        'root',
        'scene'

    ];


    for (
        const property of
        directProperties
    ) {

        const value =
            module[property];


        if (
            value &&
            value.isObject3D
        ) {

            return {

                value,
                owner: module

            };

        }

    }


    // --------------------------------------------------------
    // 3. Look at every module export
    // --------------------------------------------------------

    for (
        const [
            key,
            value
        ] of Object.entries(module)
    ) {

        if (
            key ===
            '__esModule'
        ) {

            continue;

        }


        if (
            value &&
            value.isObject3D
        ) {

            return {

                value,
                owner: module

            };

        }


        if (
            value &&
            typeof value ===
                'object'
        ) {

            for (
                const property of
                directProperties
            ) {

                if (
                    value[property] &&
                    value[property].isObject3D
                ) {

                    return {

                        value:
                            value[property],

                        owner:
                            value

                    };

                }

            }

        }

    }


    return null;

}


// ============================================================
// CREATE WORLD FROM MODULE
// ============================================================

function createWorldFromModule(
    module,
    worldName
) {

    if (
        !module
    ) {

        throw new Error(
            `World module "${worldName}" is empty.`
        );

    }


    // --------------------------------------------------------
    // If module itself is an Object3D
    // --------------------------------------------------------

    if (
        module.isObject3D
    ) {

        return normalizeWorldObject(
            module
        );

    }


    // --------------------------------------------------------
    // Try every export
    // --------------------------------------------------------

    const exports =
        Object.entries(module);


    let lastError =
        null;


    for (
        const [
            exportName,
            exported
        ] of exports
    ) {

        if (
            exportName ===
            '__esModule'
        ) {

            continue;

        }


        // ----------------------------------------------------
        // Already-created Object3D
        // ----------------------------------------------------

        if (
            exported &&
            exported.isObject3D
        ) {

            return normalizeWorldObject(
                exported
            );

        }


        // ----------------------------------------------------
        // Object exposing group/object/world/root/scene
        // ----------------------------------------------------

        if (
            exported &&
            typeof exported ===
                'object'
        ) {

            const candidate =
                findWorldCandidate(
                    exported
                );


            if (
                candidate
            ) {

                return normalizeWorldObject(
                    candidate.value,
                    exported
                );

            }

        }


        // ----------------------------------------------------
        // Function / class
        // ----------------------------------------------------

        if (
            typeof exported !==
            'function'
        ) {

            continue;

        }


        /*
         * Try constructor-style first.
         */

        try {

            const result =
                new exported(
                    scene
                );


            const normalized =
                normalizeWorldResult(
                    result
                );


            if (
                normalized
            ) {

                console.info(
                    `[BloomXR] Loaded ${worldName} using export "${exportName}" as a constructor.`
                );


                return normalized;

            }

        }

        catch (
            constructorError
        ) {

            lastError =
                constructorError;

        }


        /*
         * Try function-style next.
         */

        try {

            const result =
                exported(
                    scene
                );


            const normalized =
                normalizeWorldResult(
                    result
                );


            if (
                normalized
            ) {

                console.info(
                    `[BloomXR] Loaded ${worldName} using export "${exportName}" as a factory function.`
                );


                return normalized;

            }

        }

        catch (
            functionError
        ) {

            lastError =
                functionError;

        }

    }


    console.error(
        `[BloomXR] Could not resolve world "${worldName}".`,
        module
    );


    if (
        lastError
    ) {

        console.error(
            '[BloomXR] Last world-loading error:',
            lastError
        );

    }


    throw new Error(
        `World "${worldName}" could not be created. Check the exports in src/worlds/${worldName === 'default'
            ? 'World.js'
            : 'ButterflyWorld.js'}`
    );

}


// ============================================================
// NORMALIZE WORLD RESULT
// ============================================================

function normalizeWorldResult(
    result
) {

    if (
        !result
    ) {

        return null;

    }


    // --------------------------------------------------------
    // Direct Object3D
    // --------------------------------------------------------

    if (
        result.isObject3D
    ) {

        return normalizeWorldObject(
            result
        );

    }


    // --------------------------------------------------------
    // Common group properties
    // --------------------------------------------------------

    const groupProperties = [

        'group',
        'object',
        'world',
        'root',
        'scene'

    ];


    for (
        const property of
        groupProperties
    ) {

        if (
            result[property] &&
            result[property].isObject3D
        ) {

            return {

                instance:
                    result,

                group:
                    result[property]

            };

        }

    }


    /*
     * Sometimes the factory returns an object whose
     * "group" is nested.
     */

    const nested =
        findWorldCandidate(
            result
        );


    if (
        nested
    ) {

        return {

            instance:
                result,

            group:
                nested.value

        };

    }


    return null;

}


// ============================================================
// NORMALIZE OBJECT3D
// ============================================================

function normalizeWorldObject(
    object,
    owner = null
) {

    return {

        instance:
            owner || object,

        group:
            object

    };

}


// ============================================================
// WORLD CLEANUP
// ============================================================

function disposeWorldGroup(
    group
) {

    if (
        !group
    ) {

        return;

    }


    group.traverse(
        (child) => {

            if (
                child.geometry
            ) {

                child.geometry.dispose();

            }


            if (
                child.material
            ) {

                const materials =
                    Array.isArray(
                        child.material
                    )
                        ? child.material
                        : [child.material];


                materials.forEach(
                    (material) => {

                        if (
                            material.map
                        ) {

                            material.map.dispose();

                        }


                        if (
                            material.normalMap
                        ) {

                            material.normalMap.dispose();

                        }


                        if (
                            material.roughnessMap
                        ) {

                            material.roughnessMap.dispose();

                        }


                        if (
                            material.metalnessMap
                        ) {

                            material.metalnessMap.dispose();

                        }


                        material.dispose();

                    }
                );

            }

        }
    );

}


// ============================================================
// DESTROY CURRENT WORLD
// ============================================================

function destroyCurrentWorld() {

    if (
        currentWorldInstance &&
        typeof currentWorldInstance.destroy ===
            'function'
    ) {

        try {

            currentWorldInstance.destroy();

        }

        catch (
            error
        ) {

            console.warn(
                '[BloomXR] World destroy warning:',
                error
            );

        }

    }


    if (
        currentWorldGroup &&
        currentWorldGroup.parent
    ) {

        currentWorldGroup.parent.remove(
            currentWorldGroup
        );

    }


    disposeWorldGroup(
        currentWorldGroup
    );


    currentWorldInstance =
        null;

    currentWorldGroup =
        null;

}


// ============================================================
// WATER EXPANSION
// ============================================================

function expandWaterFeatures(
    worldGroup
) {

    if (
        !worldGroup
    ) {

        return;

    }


    const waterKeywords = [

        'water',
        'pond',
        'lake',
        'river',
        'watersurface',
        'waterfallpool'

    ];


    worldGroup.traverse(
        (child) => {

            if (
                !child.isMesh
            ) {

                return;

            }


            const name =
                (
                    child.name ||
                    ''
                )
                    .toLowerCase()
                    .replace(
                        /[\s_-]/g,
                        ''
                    );


            if (
                !name
            ) {

                return;

            }


            const isWater =
                waterKeywords.some(
                    keyword =>
                        name.includes(
                            keyword
                        )
                );


            if (
                !isWater
            ) {

                return;

            }


            /*
             * Only expand horizontally.
             *
             * This does NOT change water height.
             */

            child.scale.x *=
                1.28;

            child.scale.z *=
                1.28;

        }
    );

}


// ============================================================
// GALLERY PLACEMENT
// ============================================================

function positionGalleryForWorld(
    worldGroup
) {

    const galleryObject =
        typeof artGallery.getObject ===
            'function'
            ? artGallery.getObject()
            : artGallery.group;


    if (
        !galleryObject
    ) {

        return;

    }


    /*
     * Keep the gallery independent of the current world.
     *
     * This is critical for artwork persistence.
     */

    galleryObject.position.set(
        0,
        0.05,
        2.8
    );


    /*
     * If a world provides an explicit gallery anchor,
     * respect it.
     */

    if (
        worldGroup &&
        worldGroup.userData &&
        worldGroup.userData.galleryAnchor
    ) {

        const anchor =
            worldGroup.userData.galleryAnchor;


        if (
            anchor.isVector3
        ) {

            galleryObject.position.copy(
                anchor
            );

        }

        else if (
            Number.isFinite(
                anchor.x
            )
        ) {

            galleryObject.position.set(
                anchor.x,
                Number.isFinite(
                    anchor.y
                )
                    ? anchor.y
                    : 0,
                anchor.z
            );

        }

    }

}


// ============================================================
// WORLD SWITCHING
// ============================================================

function switchWorld(
    worldType
) {

    if (
        worldType !==
            'default' &&
        worldType !==
            'butterflies'
    ) {

        console.warn(
            `Unknown world type: ${worldType}`
        );

        return;

    }


    /*
     * Prevent pointless recreation when clicking
     * the currently active world button.
     */

    if (
        currentWorldType ===
            worldType &&
        currentWorldGroup
    ) {

        return;

    }


    destroyCurrentWorld();


    let result;


    // --------------------------------------------------------
    // DEFAULT LOTUS WORLD
    // --------------------------------------------------------

    if (
        worldType ===
        'default'
    ) {

        result =
            createWorldFromModule(
                WorldModule,
                'default'
            );


        camera.position.set(
            0,
            1.7,
            5.5
        );


        cameraState.yaw =
            0;

        cameraState.pitch =
            -0.06;

    }


    // --------------------------------------------------------
    // BUTTERFLY WORLD
    // --------------------------------------------------------

    else {

        result =
            createWorldFromModule(
                ButterflyWorldModule,
                'butterflies'
            );


        camera.position.set(
            0,
            1.9,
            7.5
        );


        cameraState.yaw =
            0;

        cameraState.pitch =
            -0.04;

    }


    currentWorldInstance =
        result.instance;

    currentWorldGroup =
        result.group;

    currentWorldType =
        worldType;


    /*
     * Make sure the world is actually in the scene.
     */

    if (
        currentWorldGroup.parent !==
        scene
    ) {

        scene.add(
            currentWorldGroup
        );

    }


    updateCameraRotation();


    /*
     * Slightly extend water if identifiable.
     */

    expandWaterFeatures(
        currentWorldGroup
    );


    /*
     * Persistent gallery.
     */

    positionGalleryForWorld(
        currentWorldGroup
    );


    console.info(
        `[BloomXR] Switched to world: ${worldType}`
    );

}


// ============================================================
// WORLD UI
// ============================================================

function createWorldControls() {

    let menu =
        document.getElementById(
            'bloom-world-controls'
        );


    if (
        !menu
    ) {

        menu =
            document.createElement(
                'div'
            );


        menu.id =
            'bloom-world-controls';


        document.body.appendChild(
            menu
        );

    }


    menu.innerHTML = `

        <button
            id="btn-default"
            class="world-button active"
            type="button"
        >
            Lotus Sanctuary
        </button>

        <button
            id="btn-butterflies"
            class="world-button"
            type="button"
        >
            Dreaming of Butterflies
        </button>

    `;


    const styleId =
        'bloom-world-controls-style';


    if (
        !document.getElementById(
            styleId
        )
    ) {

        const style =
            document.createElement(
                'style'
            );


        style.id =
            styleId;


        style.textContent = `

            #bloom-world-controls {

                position: fixed;

                left: 50%;

                bottom: 24px;

                transform:
                    translateX(-50%);

                display:
                    flex;

                gap:
                    10px;

                z-index:
                    4000;

            }


            .world-button {

                border:
                    1px solid
                    rgba(
                        200,
                        220,
                        205,
                        0.22
                    );

                background:
                    rgba(
                        13,
                        26,
                        18,
                        0.88
                    );

                color:
                    #edf3ea;

                padding:
                    12px 20px;

                border-radius:
                    12px;

                font:
                    600 13px
                    Arial,
                    sans-serif;

                cursor:
                    pointer;

                backdrop-filter:
                    blur(10px);

                transition:
                    0.2s ease;

            }


            .world-button:hover {

                background:
                    rgba(
                        48,
                        77,
                        55,
                        0.92
                    );

                transform:
                    translateY(-2px);

            }


            .world-button.active {

                background:
                    rgba(
                        75,
                        103,
                        80,
                        0.9
                    );

                border-color:
                    rgba(
                        180,
                        215,
                        185,
                        0.4
                    );

            }

        `;


        document.head.appendChild(
            style
        );

    }


    const defaultButton =
        document.getElementById(
            'btn-default'
        );


    const butterflyButton =
        document.getElementById(
            'btn-butterflies'
        );


    defaultButton.addEventListener(
        'click',
        () => {

            switchWorld(
                'default'
            );

            setActiveWorldButton(
                'default'
            );

        }
    );


    butterflyButton.addEventListener(
        'click',
        () => {

            switchWorld(
                'butterflies'
            );

            setActiveWorldButton(
                'butterflies'
            );

        }
    );

}


function setActiveWorldButton(
    worldType
) {

    const defaultButton =
        document.getElementById(
            'btn-default'
        );


    const butterflyButton =
        document.getElementById(
            'btn-butterflies'
        );


    defaultButton?.classList.toggle(
        'active',
        worldType ===
            'default'
    );


    butterflyButton?.classList.toggle(
        'active',
        worldType ===
            'butterflies'
    );

}


// ============================================================
// CREATE ART BUTTON
// ============================================================

function setupArtButton() {

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

        button.textContent =
            '✦ Create Art';


        Object.assign(
            button.style,
            {

                position:
                    'fixed',

                right:
                    '24px',

                bottom:
                    '24px',

                zIndex:
                    '4000',

                padding:
                    '12px 20px',

                borderRadius:
                    '13px',

                border:
                    '1px solid rgba(200,225,200,0.28)',

                background:
                    'rgba(42,72,49,0.92)',

                color:
                    '#eef6ea',

                font:
                    '600 14px Arial',

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
        (event) => {

            event.preventDefault();

            drawingStudio.open();

        }
    );

}


// ============================================================
// INITIAL WORLD
// ============================================================

switchWorld(
    'default'
);


// ============================================================
// UI
// ============================================================

createWorldControls();

setupArtButton();


// ============================================================
// ANIMATION LOOP
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


        // ----------------------------------------------------
        // CAMERA
        // ----------------------------------------------------

        updateKeyboardMovement(
            delta
        );


        // ----------------------------------------------------
        // WORLD
        // ----------------------------------------------------

        if (
            currentWorldInstance &&
            typeof currentWorldInstance.update ===
                'function'
        ) {

            currentWorldInstance.update(
                time,
                delta
            );

        }


        // ----------------------------------------------------
        // DRAWING
        // ----------------------------------------------------

        if (
            drawingStudio &&
            typeof drawingStudio.update ===
                'function'
        ) {

            drawingStudio.update(
                time,
                delta,
                frame
            );

        }


        // ----------------------------------------------------
        // GALLERY
        // ----------------------------------------------------

        if (
            artGallery &&
            typeof artGallery.update ===
                'function'
        ) {

            artGallery.update(
                time,
                delta
            );

        }


        // ----------------------------------------------------
        // RENDER
        // ----------------------------------------------------

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
// DEBUG API
// ============================================================

window.BloomXR = {

    scene,

    camera,

    renderer,

    artGallery,

    drawingStudio,

    switchWorld,

    get currentWorld() {

        return currentWorldInstance;

    },

    get currentWorldGroup() {

        return currentWorldGroup;

    },

    get currentWorldType() {

        return currentWorldType;

    }

};