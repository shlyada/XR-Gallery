import * as THREE from 'three';


// ============================================================
// BLOOMXR — DRAWING STUDIO
// ============================================================
//
// Supports:
//
//   • Browser 2D drawing
//   • 3D spatial drawing
//   • XR controller drawing
//   • Color selection
//   • Brush thickness
//   • Clear
//   • Persistent gallery upload
//
// ============================================================


export default class DrawingStudio {

    constructor({

        scene,

        camera,

        renderer,

        artGallery

    } = {}) {

        if (
            !scene ||
            !camera ||
            !renderer ||
            !artGallery
        ) {

            throw new Error(
                'DrawingStudio requires scene, camera, renderer and artGallery.'
            );

        }


        this.scene =
            scene;


        this.camera =
            camera;


        this.renderer =
            renderer;


        this.artGallery =
            artGallery;


        // ====================================================
        // STATE
        // ====================================================

        this.isOpen =
            false;


        this.mode =
            'canvas';


        this.color =
            '#6f4fa3';


        this.lineWidth =
            8;


        this.title =
            'Untitled Creation';


        this.artist =
            'You';


        // ====================================================
        // 3D DRAWING ROOT
        // ====================================================

        this.threeDGroup =
            new THREE.Group();


        this.threeDGroup.name =
            'DrawingStudio3D';


        this.scene.add(
            this.threeDGroup
        );


        this.threeDPlane =
            null;


        this.threeDPlaneMesh =
            null;


        this.raycaster =
            new THREE.Raycaster();


        this.pointer =
            new THREE.Vector2();


        this.isDrawingDesktop3D =
            false;


        this.last3DPoint =
            null;


        this.xrControllers =
            new Map();


        // ====================================================
        // CREATE UI
        // ====================================================

        this.createUI();

    }


// ============================================================
// CREATE UI
// ============================================================

    createUI() {

        this.ui =
            document.createElement(
                'div'
            );


        this.ui.id =
            'bloomxr-drawing-studio';


        this.ui.innerHTML = `

            <div class="drawing-card">

                <div class="drawing-header">

                    <div>

                        <div class="drawing-title">
                            CREATE ART
                        </div>

                        <div class="drawing-subtitle">
                            Draw freely, then place your creation in the gallery.
                        </div>

                    </div>

                    <button
                        id="drawing-close"
                        class="drawing-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <div class="drawing-mode-row">

                    <button
                        id="drawing-mode-canvas"
                        class="drawing-mode active"
                        type="button"
                    >
                        Browser Canvas
                    </button>

                    <button
                        id="drawing-mode-3d"
                        class="drawing-mode"
                        type="button"
                    >
                        3D Space
                    </button>

                </div>


                <div class="drawing-workspace">

                    <canvas
                        id="drawing-canvas"
                    ></canvas>

                    <div
                        id="drawing-3d-help"
                        class="drawing-3d-help"
                    >
                        Click and drag to draw in 3D space.
                        In XR, hold the controller select button.
                    </div>

                </div>


                <div class="drawing-controls">

                    <label class="drawing-label">

                        Title

                        <input
                            id="drawing-title"
                            type="text"
                            maxlength="60"
                            value="Untitled Creation"
                        />

                    </label>


                    <label class="drawing-label">

                        Color

                        <input
                            id="drawing-color"
                            type="color"
                            value="#6f4fa3"
                        />

                    </label>


                    <label class="drawing-label drawing-size-label">

                        Brush

                        <input
                            id="drawing-size"
                            type="range"
                            min="1"
                            max="35"
                            value="8"
                        />

                        <span
                            id="drawing-size-value"
                        >
                            8
                        </span>

                    </label>


                    <button
                        id="drawing-clear"
                        class="drawing-secondary"
                        type="button"
                    >
                        Clear
                    </button>


                    <button
                        id="drawing-add"
                        class="drawing-primary"
                        type="button"
                    >
                        Add to Gallery
                    </button>

                </div>

            </div>

        `;


        Object.assign(
            this.ui.style,
            {

                position:
                    'fixed',

                inset:
                    '0',

                zIndex:
                    '7000',

                display:
                    'none',

                alignItems:
                    'center',

                justifyContent:
                    'center',

                background:
                    'rgba(12,27,20,0.52)',

                backdropFilter:
                    'blur(8px)'

            }
        );


        document.body.appendChild(
            this.ui
        );


        this.domCanvas =
            this.ui.querySelector(
                '#drawing-canvas'
            );


        /*
         * The DOM canvas IS now the actual drawing canvas.
         * This eliminates the previous synchronization bug.
         */

        this.canvas =
            this.domCanvas;


        this.canvas.width =
            1200;


        this.canvas.height =
            900;


        this.ctx =
            this.canvas.getContext(
                '2d'
            );


        this.setupCanvas();


        this.injectStyles();


        this.setupButtons();

        this.setup2DDrawing();

        this.setup3DDrawing();

    }


// ============================================================
// CANVAS INITIALIZATION
// ============================================================

    setupCanvas() {

        this.ctx.fillStyle =
            '#fffdf7';


        this.ctx.fillRect(

            0,

            0,

            this.canvas.width,

            this.canvas.height

        );


        this.ctx.lineCap =
            'round';


        this.ctx.lineJoin =
            'round';


        this.ctx.imageSmoothingEnabled =
            true;

    }


// ============================================================
// BUTTONS
// ============================================================

    setupButtons() {

        this.ui.querySelector(
            '#drawing-close'
        ).addEventListener(
            'click',
            () =>
                this.close()
        );


        this.ui.querySelector(
            '#drawing-mode-canvas'
        ).addEventListener(
            'click',
            () =>
                this.setMode(
                    'canvas'
                )
        );


        this.ui.querySelector(
            '#drawing-mode-3d'
        ).addEventListener(
            'click',
            () =>
                this.setMode(
                    '3d'
                )
        );


        this.ui.querySelector(
            '#drawing-clear'
        ).addEventListener(
            'click',
            () =>
                this.clearCurrent()
        );


        this.ui.querySelector(
            '#drawing-add'
        ).addEventListener(
            'click',
            () =>
                this.addToGallery()
        );


        this.ui.querySelector(
            '#drawing-color'
        ).addEventListener(
            'input',
            event => {

                this.color =
                    event.target.value;

            }
        );


        this.ui.querySelector(
            '#drawing-size'
        ).addEventListener(
            'input',
            event => {

                this.lineWidth =
                    Number(
                        event.target.value
                    );


                this.ui.querySelector(
                    '#drawing-size-value'
                ).textContent =
                    String(
                        this.lineWidth
                    );

            }
        );


        this.ui.querySelector(
            '#drawing-title'
        ).addEventListener(
            'input',
            event => {

                this.title =
                    event.target.value;

            }
        );

    }


// ============================================================
// OPEN
// ============================================================

    open() {

        this.isOpen =
            true;


        this.ui.style.display =
            'flex';


        /*
         * Always start Create Art in Browser Canvas mode.
         */

        this.setMode(
            'canvas'
        );

    }


// ============================================================
// ALIASES
// ============================================================

    show() {

        this.open();

    }


    hide() {

        this.close();

    }


// ============================================================
// CLOSE
// ============================================================

    close() {

        this.isOpen =
            false;


        this.ui.style.display =
            'none';


        this.stopAllDrawing();


        this.threeDGroup.visible =
            false;

    }


// ============================================================
// MODE
// ============================================================

    setMode(
        mode
    ) {

        this.mode =
            mode;


        const canvasButton =
            this.ui.querySelector(
                '#drawing-mode-canvas'
            );


        const threeButton =
            this.ui.querySelector(
                '#drawing-mode-3d'
            );


        const help =
            this.ui.querySelector(
                '#drawing-3d-help'
            );


        canvasButton.classList.toggle(
            'active',
            mode ===
                'canvas'
        );


        threeButton.classList.toggle(
            'active',
            mode ===
                '3d'
        );


        if (
            mode ===
            '3d'
        ) {

            this.threeDGroup.visible =
                true;


            help.style.display =
                'block';


            this.update3DDrawingPlane();

        }

        else {

            this.threeDGroup.visible =
                false;


            help.style.display =
                'none';

        }

    }


// ============================================================
// 2D DRAWING
// ============================================================

    setup2DDrawing() {

        this.drawing2D =
            false;


        this.canvas.addEventListener(
            'pointerdown',
            event => {

                if (
                    !this.isOpen ||
                    this.mode !==
                    'canvas'
                ) {

                    return;

                }


                event.preventDefault();


                this.drawing2D =
                    true;


                this.canvas.setPointerCapture?.(
                    event.pointerId
                );


                const point =
                    this.getCanvasPoint(
                        event
                    );


                this.ctx.beginPath();


                this.ctx.moveTo(
                    point.x,
                    point.y
                );

            }
        );


        this.canvas.addEventListener(
            'pointermove',
            event => {

                if (
                    !this.drawing2D ||
                    this.mode !==
                    'canvas'
                ) {

                    return;

                }


                event.preventDefault();


                const point =
                    this.getCanvasPoint(
                        event
                    );


                this.ctx.strokeStyle =
                    this.color;


                this.ctx.lineWidth =
                    this.lineWidth;


                this.ctx.lineCap =
                    'round';


                this.ctx.lineJoin =
                    'round';


                this.ctx.lineTo(
                    point.x,
                    point.y
                );


                this.ctx.stroke();


                /*
                 * No second canvas needs to be updated.
                 * The visible canvas IS the source canvas.
                 */

            }
        );


        this.canvas.addEventListener(
            'pointerup',
            () => {

                this.drawing2D =
                    false;


                this.ctx.closePath();

            }
        );


        this.canvas.addEventListener(
            'pointercancel',
            () => {

                this.drawing2D =
                    false;


                this.ctx.closePath();

            }
        );

    }


// ============================================================
// GET CANVAS POINT
// ============================================================

    getCanvasPoint(
        event
    ) {

        const rect =
            this.canvas
                .getBoundingClientRect();


        return {

            x:
                (
                    event.clientX -
                    rect.left
                ) *
                (
                    this.canvas.width /
                    rect.width
                ),

            y:
                (
                    event.clientY -
                    rect.top
                ) *
                (
                    this.canvas.height /
                    rect.height
                )

        };

    }


// ============================================================
// 3D DRAWING
// ============================================================

    setup3DDrawing() {

        this.renderer.domElement.addEventListener(
            'pointerdown',
            event => {

                if (
                    !this.isOpen ||
                    this.mode !==
                    '3d' ||
                    this.renderer.xr.isPresenting
                ) {

                    return;

                }


                this.isDrawingDesktop3D =
                    true;


                this.last3DPoint =
                    this.intersect3DPlane(
                        event
                    );

            }
        );


        this.renderer.domElement.addEventListener(
            'pointermove',
            event => {

                if (
                    !this.isOpen ||
                    this.mode !==
                    '3d' ||
                    !this.isDrawingDesktop3D ||
                    this.renderer.xr.isPresenting
                ) {

                    return;

                }


                const point =
                    this.intersect3DPlane(
                        event
                    );


                if (
                    point &&
                    this.last3DPoint
                ) {

                    this.add3DSegment(

                        this.last3DPoint,

                        point

                    );

                }


                if (
                    point
                ) {

                    this.last3DPoint =
                        point;

                }

            }
        );


        window.addEventListener(
            'pointerup',
            () => {

                this.isDrawingDesktop3D =
                    false;


                this.last3DPoint =
                    null;

            }
        );

    }


// ============================================================
// 3D PLANE
// ============================================================

    update3DDrawingPlane() {

        const forward =
            new THREE.Vector3();


        this.camera.getWorldDirection(
            forward
        );


        forward.normalize();


        const point =
            this.camera.position
                .clone()
                .add(
                    forward.multiplyScalar(
                        3.0
                    )
                );


        this.threeDPlane =
            new THREE.Plane()
                .setFromNormalAndCoplanarPoint(

                    forward,

                    point

                );


        /*
         * Optional visual writing surface.
         */

        if (
            !this.threeDPlaneMesh
        ) {

            const geometry =
                new THREE.PlaneGeometry(
                    5.8,
                    4.3
                );


            const material =
                new THREE.MeshBasicMaterial({

                    color:
                        0xf1f3e9,

                    transparent:
                        true,

                    opacity:
                        0.035,

                    side:
                        THREE.DoubleSide,

                    depthWrite:
                        false

                });


            this.threeDPlaneMesh =
                new THREE.Mesh(
                    geometry,
                    material
                );


            this.threeDGroup.add(
                this.threeDPlaneMesh
            );

        }


        this.threeDPlaneMesh.position.copy(
            point
        );


        this.threeDPlaneMesh.quaternion.copy(
            this.camera.quaternion
        );

    }


// ============================================================
// INTERSECT 3D PLANE
// ============================================================

    intersect3DPlane(
        event
    ) {

        this.update3DDrawingPlane();


        const rect =
            this.renderer
                .domElement
                .getBoundingClientRect();


        this.pointer.x =
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) *
            2 -
            1;


        this.pointer.y =
            -(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            ) *
            2 +
            1;


        this.raycaster.setFromCamera(

            this.pointer,

            this.camera

        );


        const point =
            new THREE.Vector3();


        if (
            this.raycaster.ray.intersectPlane(
                this.threeDPlane,
                point
            )
        ) {

            return point.clone();

        }


        return null;

    }


// ============================================================
// ADD 3D SEGMENT
// ============================================================

    add3DSegment(
        from,
        to
    ) {

        if (
            !from ||
            !to
        ) {

            return;

        }


        const distance =
            from.distanceTo(
                to
            );


        if (
            distance <
            0.002
        ) {

            return;

        }


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    [
                        from,
                        to
                    ]
                );


        const material =
            new THREE.LineBasicMaterial({

                color:
                    this.color,

                linewidth:
                    Math.max(
                        1,
                        this.lineWidth *
                        0.8
                    ),

                transparent:
                    true,

                opacity:
                    0.98

            });


        const line =
            new THREE.Line(
                geometry,
                material
            );


        line.name =
            'User3DStroke';


        this.threeDGroup.add(
            line
        );


        /*
         * Also project the segment onto the visible canvas.
         */

        this.project3DToCanvas(
            from,
            to
        );

    }


// ============================================================
// PROJECT 3D TO CANVAS
// ============================================================

    project3DToCanvas(
        from,
        to
    ) {

        const a =
            from.clone()
                .project(
                    this.camera
                );


        const b =
            to.clone()
                .project(
                    this.camera
                );


        const ax =
            (
                a.x +
                1
            ) *
            0.5 *
            this.canvas.width;


        const ay =
            (
                1 -
                (
                    a.y +
                    1
                ) *
                0.5
            ) *
            this.canvas.height;


        const bx =
            (
                b.x +
                1
            ) *
            0.5 *
            this.canvas.width;


        const by =
            (
                1 -
                (
                    b.y +
                    1
                ) *
                0.5
            ) *
            this.canvas.height;


        this.ctx.strokeStyle =
            this.color;


        this.ctx.lineWidth =
            this.lineWidth;


        this.ctx.lineCap =
            'round';


        this.ctx.lineJoin =
            'round';


        this.ctx.beginPath();


        this.ctx.moveTo(
            ax,
            ay
        );


        this.ctx.lineTo(
            bx,
            by
        );


        this.ctx.stroke();


        this.ctx.closePath();

    }


// ============================================================
// XR CONTROLLER
// ============================================================

    addXRController(
        controller
    ) {

        if (
            !controller ||
            this.xrControllers.has(
                controller
            )
        ) {

            return;

        }


        const state = {

            controller,

            drawing:
                false,

            lastPoint:
                null

        };


        this.xrControllers.set(
            controller,
            state
        );


        controller.addEventListener(
            'selectstart',
            () => {

                if (
                    !this.isOpen ||
                    this.mode !==
                    '3d'
                ) {

                    return;

                }


                state.drawing =
                    true;


                state.lastPoint =
                    this.getXRPoint(
                        controller
                    );

            }
        );


        controller.addEventListener(
            'selectend',
            () => {

                state.drawing =
                    false;


                state.lastPoint =
                    null;

            }
        );

    }


// ============================================================
// XR POINT
// ============================================================

    getXRPoint(
        controller
    ) {

        this.updateXRPlane();


        const origin =
            new THREE.Vector3();


        const quaternion =
            new THREE.Quaternion();


        controller.getWorldPosition(
            origin
        );


        controller.getWorldQuaternion(
            quaternion
        );


        const direction =
            new THREE.Vector3(
                0,
                0,
                -1
            )
                .applyQuaternion(
                    quaternion
                )
                .normalize();


        const ray =
            new THREE.Ray(
                origin,
                direction
            );


        const point =
            new THREE.Vector3();


        if (
            ray.intersectPlane(
                this.threeDPlane,
                point
            )
        ) {

            return point.clone();

        }


        return null;

    }


// ============================================================
// XR PLANE
// ============================================================

    updateXRPlane() {

        const forward =
            new THREE.Vector3();


        this.camera.getWorldDirection(
            forward
        );


        forward.normalize();


        const point =
            this.camera.position
                .clone()
                .add(
                    forward.multiplyScalar(
                        2.7
                    )
                );


        this.threeDPlane =
            new THREE.Plane()
                .setFromNormalAndCoplanarPoint(

                    forward,

                    point

                );

    }


// ============================================================
// CLEAR
// ============================================================

    clearCurrent() {

        this.ctx.fillStyle =
            '#fffdf7';


        this.ctx.fillRect(

            0,

            0,

            this.canvas.width,

            this.canvas.height

        );


        this.clear3D();

    }


// ============================================================
// CLEAR 3D
// ============================================================

    clear3D() {

        const children =
            [
                ...this.threeDGroup.children
            ];


        children.forEach(
            child => {

                this.threeDGroup.remove(
                    child
                );


                if (
                    child.geometry
                ) {

                    child.geometry.dispose();

                }


                if (
                    child.material
                ) {

                    if (
                        child.material.map
                    ) {

                        child.material.map.dispose();

                    }


                    child.material.dispose();

                }

            }
        );


        this.threeDPlaneMesh =
            null;

    }


// ============================================================
// STOP
// ============================================================

    stopAllDrawing() {

        this.drawing2D =
            false;


        this.isDrawingDesktop3D =
            false;


        this.last3DPoint =
            null;


        this.xrControllers.forEach(
            state => {

                state.drawing =
                    false;


                state.lastPoint =
                    null;

            }
        );

    }


// ============================================================
// UPDATE
// ============================================================

    update(
        time,
        delta,
        frame
    ) {

        if (
            !this.isOpen ||
            this.mode !==
            '3d'
        ) {

            return;

        }


        this.xrControllers.forEach(
            state => {

                if (
                    !state.drawing
                ) {

                    return;

                }


                const point =
                    this.getXRPoint(
                        state.controller
                    );


                if (
                    !point
                ) {

                    return;

                }


                if (
                    state.lastPoint
                ) {

                    this.add3DSegment(

                        state.lastPoint,

                        point

                    );

                }


                state.lastPoint =
                    point;

            }
        );

    }


// ============================================================
// SAVE
// ============================================================

    async addToGallery() {

        const button =
            this.ui.querySelector(
                '#drawing-add'
            );


        const titleInput =
            this.ui.querySelector(
                '#drawing-title'
            );


        this.title =
            titleInput.value.trim() ||
            'Untitled Creation';


        button.disabled =
            true;


        const oldText =
            button.textContent;


        button.textContent =
            'Saving…';


        try {

            const artwork =
                await this.artGallery
                    .addArtworkFromCanvas({

                        canvas:
                            this.canvas,

                        title:
                            this.title,

                        artist:
                            this.artist

                    });


            if (
                !artwork
            ) {

                throw new Error(
                    'Backend did not return an artwork record.'
                );

            }


            this.showToast(
                'Artwork added to the Sanctuary Gallery.'
            );


            this.close();

        }

        catch (
            error
        ) {

            console.error(
                '[BloomXR] Artwork save failed:',
                error
            );


            this.showToast(
                `Could not save artwork: ${error.message}`
            );

        }

        finally {

            button.disabled =
                false;


            button.textContent =
                oldText;

        }

    }


// ============================================================
// TOAST
// ============================================================

    showToast(
        message
    ) {

        const old =
            document.getElementById(
                'bloomxr-drawing-toast'
            );


        old?.remove();


        const toast =
            document.createElement(
                'div'
            );


        toast.id =
            'bloomxr-drawing-toast';


        toast.textContent =
            message;


        Object.assign(
            toast.style,
            {

                position:
                    'fixed',

                left:
                    '50%',

                bottom:
                    '90px',

                transform:
                    'translateX(-50%)',

                zIndex:
                    '9000',

                padding:
                    '11px 17px',

                borderRadius:
                    '11px',

                background:
                    'rgba(35,67,47,0.94)',

                color:
                    '#f4f8ed',

                font:
                    '600 13px Arial',

                boxShadow:
                    '0 12px 30px rgba(0,0,0,0.20)'

            }
        );


        document.body.appendChild(
            toast
        );


        setTimeout(
            () => {

                toast.remove();

            },
            2800
        );

    }


// ============================================================
// STYLES
// ============================================================

    injectStyles() {

        if (
            document.getElementById(
                'bloomxr-drawing-style'
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                'style'
            );


        style.id =
            'bloomxr-drawing-style';


        style.textContent = `

            .drawing-card {

                width:
                    min(
                        960px,
                        calc(100vw - 36px)
                    );

                max-height:
                    calc(100vh - 36px);

                overflow:
                    auto;

                padding:
                    20px;

                border-radius:
                    18px;

                background:
                    #f3f0e6;

                box-shadow:
                    0 30px 100px
                    rgba(
                        0,
                        0,
                        0,
                        0.28
                    );

                color:
                    #27352d;

                font-family:
                    Arial,
                    sans-serif;

            }


            .drawing-header {

                display:
                    flex;

                justify-content:
                    space-between;

                align-items:
                    flex-start;

                margin-bottom:
                    14px;

            }


            .drawing-title {

                font:
                    600 18px
                    Georgia,
                    serif;

                color:
                    #30493a;

                letter-spacing:
                    0.07em;

            }


            .drawing-subtitle {

                margin-top:
                    4px;

                color:
                    #6b786c;

                font-size:
                    12px;

            }


            .drawing-close {

                width:
                    34px;

                height:
                    34px;

                border:
                    none;

                border-radius:
                    50%;

                background:
                    #dfe4da;

                color:
                    #405246;

                font-size:
                    23px;

                cursor:
                    pointer;

            }


            .drawing-mode-row {

                display:
                    flex;

                gap:
                    8px;

                margin-bottom:
                    12px;

            }


            .drawing-mode {

                padding:
                    8px 14px;

                border:
                    1px solid
                    #c9d0c5;

                border-radius:
                    9px;

                background:
                    #e7eadf;

                color:
                    #526255;

                cursor:
                    pointer;

                font:
                    600 12px
                    Arial,
                    sans-serif;

            }


            .drawing-mode.active {

                background:
                    #6e9274;

                color:
                    #f8faf3;

                border-color:
                    #6e9274;

            }


            .drawing-workspace {

                position:
                    relative;

                width:
                    100%;

                aspect-ratio:
                    4 / 3;

                overflow:
                    hidden;

                border:
                    1px solid
                    #ccd3c7;

                border-radius:
                    13px;

                background:
                    #fffdf7;

            }


            #drawing-canvas {

                width:
                    100%;

                height:
                    100%;

                display:
                    block;

                touch-action:
                    none;

                cursor:
                    crosshair;

                background:
                    #fffdf7;

            }


            .drawing-3d-help {

                display:
                    none;

                position:
                    absolute;

                left:
                    50%;

                top:
                    15px;

                transform:
                    translateX(-50%);

                padding:
                    8px 13px;

                border-radius:
                    999px;

                background:
                    rgba(
                        35,
                        57,
                        45,
                        0.82
                    );

                color:
                    #eef5e9;

                font-size:
                    12px;

                pointer-events:
                    none;

            }


            .drawing-controls {

                display:
                    flex;

                align-items:
                    flex-end;

                gap:
                    10px;

                flex-wrap:
                    wrap;

                margin-top:
                    14px;

            }


            .drawing-label {

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    5px;

                color:
                    #667267;

                font-size:
                    11px;

            }


            .drawing-label input[type="text"] {

                min-width:
                    220px;

                height:
                    37px;

                padding:
                    0 10px;

                border:
                    1px solid
                    #cad2c8;

                border-radius:
                    8px;

                background:
                    #ffffff;

                color:
                    #324138;

            }


            .drawing-label input[type="color"] {

                width:
                    44px;

                height:
                    37px;

                padding:
                    2px;

                border:
                    1px solid
                    #cad2c8;

                border-radius:
                    8px;

                background:
                    #fff;

                cursor:
                    pointer;

            }


            .drawing-size-label {

                min-width:
                    175px;

            }


            .drawing-size-label input[type="range"] {

                accent-color:
                    #6e9274;

            }


            #drawing-size-value {

                color:
                    #405548;

                font-weight:
                    600;

            }


            .drawing-secondary,
            .drawing-primary {

                height:
                    38px;

                padding:
                    0 15px;

                border-radius:
                    9px;

                cursor:
                    pointer;

                font:
                    600 12px
                    Arial,
                    sans-serif;

            }


            .drawing-secondary {

                border:
                    1px solid
                    #cbd3c8;

                background:
                    #e6e9e0;

                color:
                    #526255;

            }


            .drawing-primary {

                border:
                    1px solid
                    #719576;

                background:
                    #527b5d;

                color:
                    #f5f8ef;

            }


            .drawing-primary:disabled {

                opacity:
                    0.55;

                cursor:
                    wait;

            }

        `;


        document.head.appendChild(
            style
        );

    }

}