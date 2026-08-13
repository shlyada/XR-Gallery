import * as THREE from 'three';


// ============================================================
// BLOOMXR DRAWING STUDIO
// ============================================================

export default class DrawingStudio {

    constructor({
        scene,
        camera,
        renderer,
        gallery
    } = {}) {

        if (!scene) {
            throw new Error(
                'DrawingStudio requires a scene.'
            );
        }

        if (!camera) {
            throw new Error(
                'DrawingStudio requires a camera.'
            );
        }

        if (!renderer) {
            throw new Error(
                'DrawingStudio requires a renderer.'
            );
        }

        this.scene =
            scene;

        this.camera =
            camera;

        this.renderer =
            renderer;

        this.gallery =
            gallery;


        // ----------------------------------------------------
        // STATE
        // ----------------------------------------------------

        this.isOpen =
            false;

        this.mode =
            'browser';

        this.currentColor =
            '#ffffff';

        this.currentThickness =
            8;

        this.isDrawing =
            false;

        this.xrDrawing =
            false;

        this.lastPoint =
            null;

        this.lastXRPoint =
            null;


        // ----------------------------------------------------
        // CANVAS
        // ----------------------------------------------------

        this.canvas =
            document.createElement(
                'canvas'
            );

        this.canvas.width =
            1400;

        this.canvas.height =
            900;

        this.ctx =
            this.canvas.getContext(
                '2d'
            );

        this.ctx.lineCap =
            'round';

        this.ctx.lineJoin =
            'round';

        this.texture =
            new THREE.CanvasTexture(
                this.canvas
            );

        this.texture.colorSpace =
            THREE.SRGBColorSpace;


        // ----------------------------------------------------
        // THREE.JS DRAWING BOARD
        // ----------------------------------------------------

        this.raycaster =
            new THREE.Raycaster();

        this.pointer =
            new THREE.Vector2();

        this.drawingPlane =
            null;

        this.drawingFrame =
            null;

        this.controllerLines =
            [];


        // ----------------------------------------------------
        // HISTORY
        // ----------------------------------------------------

        this.history = [];

        this.maxHistory =
            30;


        // ----------------------------------------------------
        // UI
        // ----------------------------------------------------

        this.createUI();

        this.setupCanvas();

        this.create3DDrawingSurface();

        this.attachPointerEvents();

        this.initializeHistory();

    }


// ============================================================
// UI
// ============================================================

    createUI() {

        const existing =
            document.getElementById(
                'drawing-studio'
            );

        if (existing) {

            existing.remove();

        }


        this.panel =
            document.createElement(
                'div'
            );

        this.panel.id =
            'drawing-studio';


        this.panel.innerHTML = `

            <div class="drawing-panel">

                <div class="drawing-panel-header">

                    <div>

                        <div class="drawing-eyebrow">
                            BLOOMXR CREATIVE SPACE
                        </div>

                        <h2>
                            Create Your Art
                        </h2>

                        <p>
                            Draw freely, then place
                            your creation inside the
                            Sanctuary Gallery.
                        </p>

                    </div>

                    <button
                        id="drawing-close"
                        class="drawing-close"
                        type="button"
                    >
                        ×
                    </button>

                </div>


                <div class="drawing-controls">

                    <div class="control-group">

                        <span class="control-label">
                            Canvas
                        </span>

                        <div class="mode-switch">

                            <button
                                id="drawing-browser-mode"
                                class="mode-choice active"
                                type="button"
                            >
                                Browser
                            </button>

                            <button
                                id="drawing-3d-mode"
                                class="mode-choice"
                                type="button"
                            >
                                3D
                            </button>

                        </div>

                    </div>


                    <div class="control-group">

                        <span class="control-label">
                            Color
                        </span>

                        <input
                            id="drawing-color"
                            type="color"
                            value="#ffffff"
                        />

                    </div>


                    <div class="control-group brush-group">

                        <span class="control-label">

                            Thickness

                            <strong
                                id="drawing-thickness-label"
                            >
                                8
                            </strong>

                        </span>

                        <input
                            id="drawing-thickness"
                            type="range"
                            min="1"
                            max="45"
                            value="8"
                        />

                    </div>

                </div>


                <div
                    id="browser-drawing-area"
                    class="browser-drawing-area"
                >

                    <canvas
                        id="drawing-browser-canvas"
                    ></canvas>

                </div>


                <div
                    id="drawing-3d-info"
                    class="drawing-3d-info"
                >

                    <div class="three-icon">
                        ✦
                    </div>

                    <div>

                        <strong>
                            3D Canvas
                        </strong>

                        <p>
                            Your canvas is now inside
                            the sanctuary. Draw on it
                            with your mouse or XR
                            controller.
                        </p>

                    </div>

                </div>


                <div class="drawing-actions">

                    <div>

                        <button
                            id="drawing-undo"
                            class="drawing-action secondary"
                            type="button"
                        >
                            Undo
                        </button>

                        <button
                            id="drawing-clear"
                            class="drawing-action secondary"
                            type="button"
                        >
                            Clear
                        </button>

                    </div>

                    <div>

                        <button
                            id="drawing-cancel"
                            class="drawing-action secondary"
                            type="button"
                        >
                            Cancel
                        </button>

                        <button
                            id="drawing-gallery"
                            class="drawing-action primary"
                            type="button"
                        >
                            Add to Gallery
                        </button>

                    </div>

                </div>

            </div>


            <div
                id="art-title-overlay"
                class="art-title-overlay"
            >

                <div class="art-title-card">

                    <div class="drawing-eyebrow">
                        YOUR CREATION
                    </div>

                    <h3>
                        Give your artwork a name
                    </h3>

                    <input
                        id="art-title-input"
                        type="text"
                        maxlength="60"
                        placeholder="Untitled"
                    />

                    <div class="art-title-actions">

                        <button
                            id="art-title-cancel"
                            class="drawing-action secondary"
                            type="button"
                        >
                            Cancel
                        </button>

                        <button
                            id="art-title-confirm"
                            class="drawing-action primary"
                            type="button"
                        >
                            Place in Gallery
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            this.panel
        );


        this.injectStyles();

        this.bindUI();

    }


// ============================================================
// STYLES
// ============================================================

    injectStyles() {

        if (
            document.getElementById(
                'drawing-studio-styles'
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                'style'
            );

        style.id =
            'drawing-studio-styles';


        style.textContent = `

            #drawing-studio {

                position: fixed;

                inset: 0;

                z-index: 9000;

                display: none;

                color:
                    #edf3ea;

                font-family:
                    Inter,
                    Arial,
                    sans-serif;

            }


            #drawing-studio.open {

                display: block;

            }


            .drawing-panel {

                position: absolute;

                left: 50%;

                top: 50%;

                transform:
                    translate(-50%, -50%);

                width:
                    min(
                        1120px,
                        calc(100vw - 50px)
                    );

                height:
                    min(
                        800px,
                        calc(100vh - 50px)
                    );

                display:
                    flex;

                flex-direction:
                    column;

                background:
                    linear-gradient(
                        145deg,
                        rgba(24,37,28,0.98),
                        rgba(9,17,12,0.98)
                    );

                border:
                    1px solid
                    rgba(
                        210,
                        229,
                        212,
                        0.16
                    );

                border-radius:
                    22px;

                box-shadow:
                    0 40px 120px
                    rgba(0,0,0,0.55);

                overflow:
                    hidden;

                backdrop-filter:
                    blur(20px);

            }


            .drawing-panel-header {

                display:
                    flex;

                align-items:
                    flex-start;

                justify-content:
                    space-between;

                padding:
                    28px 32px 22px;

                border-bottom:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.07
                    );

            }


            .drawing-eyebrow {

                margin-bottom:
                    6px;

                font-size:
                    10px;

                letter-spacing:
                    0.22em;

                opacity:
                    0.62;

            }


            .drawing-panel h2 {

                margin:
                    0 0 7px;

                font:
                    500 31px
                    Georgia,
                    serif;

            }


            .drawing-panel-header p {

                margin:
                    0;

                max-width:
                    600px;

                color:
                    #aebbad;

                font-size:
                    14px;

                line-height:
                    1.5;

            }


            .drawing-close {

                width:
                    40px;

                height:
                    40px;

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    );

                border-radius:
                    50%;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.05
                    );

                color:
                    white;

                font-size:
                    25px;

                cursor:
                    pointer;

            }


            .drawing-controls {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    30px;

                padding:
                    14px 32px;

                border-bottom:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.07
                    );

            }


            .control-group {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    11px;

                color:
                    #aebbad;

                font-size:
                    13px;

            }


            .control-label {

                white-space:
                    nowrap;

            }


            .mode-switch {

                display:
                    flex;

                gap:
                    6px;

            }


            .mode-choice {

                padding:
                    8px 14px;

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.11
                    );

                border-radius:
                    9px;

                color:
                    #b6c1b5;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.04
                    );

                cursor:
                    pointer;

            }


            .mode-choice.active {

                color:
                    #f1f6ef;

                border-color:
                    rgba(
                        176,
                        214,
                        182,
                        0.44
                    );

                background:
                    rgba(
                        86,
                        123,
                        91,
                        0.3
                    );

            }


            #drawing-color {

                width:
                    36px;

                height:
                    30px;

                padding:
                    0;

                border:
                    0;

                background:
                    transparent;

                cursor:
                    pointer;

            }


            #drawing-thickness {

                width:
                    145px;

                accent-color:
                    #bad3b5;

            }


            .brush-group strong {

                color:
                    #e8efe6;

            }


            .browser-drawing-area {

                flex:
                    1;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                padding:
                    22px 30px;

                background:
                    radial-gradient(
                        circle at center,
                        rgba(
                            100,
                            125,
                            104,
                            0.1
                        ),
                        transparent 65%
                    );

                min-height:
                    0;

            }


            #drawing-browser-canvas {

                width:
                    100%;

                height:
                    100%;

                display:
                    block;

                border-radius:
                    15px;

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.11
                    );

                cursor:
                    crosshair;

                touch-action:
                    none;

                box-shadow:
                    inset
                    0 0 50px
                    rgba(0,0,0,0.16);

            }


            .drawing-3d-info {

                display:
                    none;

                align-items:
                    center;

                gap:
                    17px;

                position:
                    absolute;

                left:
                    50%;

                top:
                    50%;

                transform:
                    translate(-50%, -50%);

                max-width:
                    420px;

                padding:
                    18px 22px;

                border:
                    1px solid
                    rgba(
                        180,
                        215,
                        185,
                        0.18
                    );

                border-radius:
                    16px;

                background:
                    rgba(
                        8,
                        17,
                        11,
                        0.84
                    );

                color:
                    #c9d5ca;

            }


            .three-icon {

                width:
                    42px;

                height:
                    42px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    50%;

                background:
                    rgba(
                        106,
                        145,
                        111,
                        0.22
                    );

                font-size:
                    20px;

            }


            .drawing-3d-info strong {

                display:
                    block;

                margin-bottom:
                    4px;

                color:
                    #eff5ed;

            }


            .drawing-3d-info p {

                margin:
                    0;

                line-height:
                    1.45;

                font-size:
                    13px;

            }


            .drawing-actions {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                padding:
                    17px 30px 24px;

                border-top:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.07
                    );

            }


            .drawing-action {

                padding:
                    11px 18px;

                border-radius:
                    10px;

                font:
                    600 13px
                    Arial,
                    sans-serif;

                cursor:
                    pointer;

            }


            .drawing-action.secondary {

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    );

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.045
                    );

                color:
                    #bec8bd;

            }


            .drawing-action.primary {

                border:
                    1px solid
                    #bcd4b8;

                background:
                    #bcd4b8;

                color:
                    #162019;

            }


            .art-title-overlay {

                position:
                    absolute;

                inset:
                    0;

                display:
                    none;

                align-items:
                    center;

                justify-content:
                    center;

                background:
                    rgba(
                        3,
                        8,
                        5,
                        0.72
                    );

            }


            .art-title-overlay.open {

                display:
                    flex;

            }


            .art-title-card {

                width:
                    min(
                        460px,
                        calc(100vw - 50px)
                    );

                padding:
                    30px;

                border-radius:
                    18px;

                border:
                    1px solid
                    rgba(
                        200,
                        225,
                        203,
                        0.17
                    );

                background:
                    linear-gradient(
                        145deg,
                        #1f2e22,
                        #111b14
                    );

                box-shadow:
                    0 30px 100px
                    rgba(0,0,0,0.55);

            }


            .art-title-card h3 {

                margin:
                    0 0 20px;

                font:
                    500 27px
                    Georgia,
                    serif;

            }


            #art-title-input {

                width:
                    100%;

                box-sizing:
                    border-box;

                padding:
                    12px 14px;

                border:
                    1px solid
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    );

                border-radius:
                    9px;

                background:
                    rgba(
                        255,
                        255,
                        255,
                        0.05
                    );

                color:
                    white;

                outline:
                    none;

                font-size:
                    15px;

            }


            .art-title-actions {

                display:
                    flex;

                justify-content:
                    flex-end;

                gap:
                    9px;

                margin-top:
                    20px;

            }

        `;


        document.head.appendChild(
            style
        );

    }


// ============================================================
// CANVAS
// ============================================================

    setupCanvas() {

        this.browserCanvas =
            this.panel.querySelector(
                '#drawing-browser-canvas'
            );

        this.browserContext =
            this.browserCanvas.getContext(
                '2d'
            );

        this.resizeBrowserCanvas();

        this.clearCanvas(
            false
        );

    }


    resizeBrowserCanvas() {

        const rect =
            this.browserCanvas.getBoundingClientRect();


        if (
            rect.width === 0 ||
            rect.height === 0
        ) {

            return;

        }


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        this.browserCanvas.width =
            Math.round(
                rect.width * dpr
            );

        this.browserCanvas.height =
            Math.round(
                rect.height * dpr
            );


        this.browserContext.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        this.browserContext.lineCap =
            'round';

        this.browserContext.lineJoin =
            'round';

    }


// ============================================================
// CANVAS BACKGROUND
// ============================================================

    clearCanvas(
        remember = true
    ) {

        const rect =
            this.browserCanvas.getBoundingClientRect();


        if (
            rect.width === 0 ||
            rect.height === 0
        ) {

            return;

        }


        this.browserContext.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );


        const gradient =
            this.browserContext.createRadialGradient(
                rect.width / 2,
                rect.height / 2,
                0,
                rect.width / 2,
                rect.height / 2,
                Math.max(
                    rect.width,
                    rect.height
                )
            );


        gradient.addColorStop(
            0,
            '#29362e'
        );

        gradient.addColorStop(
            1,
            '#101811'
        );


        this.browserContext.fillStyle =
            gradient;


        this.browserContext.fillRect(
            0,
            0,
            rect.width,
            rect.height
        );


        if (remember) {

            this.saveHistory();

        }


        this.updateDrawingTexture();

    }


// ============================================================
// HISTORY
// ============================================================

    initializeHistory() {

        this.history = [];

        this.saveHistory();

    }


    saveHistory() {

        if (
            !this.browserCanvas
        ) {

            return;

        }


        const state =
            this.browserCanvas.toDataURL(
                'image/png'
            );


        this.history.push(
            state
        );


        if (
            this.history.length >
            this.maxHistory
        ) {

            this.history.shift();

        }

    }


    undo() {

        if (
            this.history.length <=
            1
        ) {

            return;

        }


        this.history.pop();


        const previous =
            this.history[
                this.history.length - 1
            ];


        const image =
            new Image();


        image.onload = () => {

            const rect =
                this.browserCanvas.getBoundingClientRect();


            this.browserContext.clearRect(
                0,
                0,
                rect.width,
                rect.height
            );


            this.browserContext.drawImage(
                image,
                0,
                0,
                rect.width,
                rect.height
            );


            this.updateDrawingTexture();

        };


        image.src =
            previous;

    }


// ============================================================
// UI BINDING
// ============================================================

    bindUI() {

        this.panel.querySelector(
            '#drawing-close'
        ).addEventListener(
            'click',
            () => this.hide()
        );


        this.panel.querySelector(
            '#drawing-cancel'
        ).addEventListener(
            'click',
            () => this.hide()
        );


        this.panel.querySelector(
            '#drawing-browser-mode'
        ).addEventListener(
            'click',
            () => this.setMode(
                'browser'
            )
        );


        this.panel.querySelector(
            '#drawing-3d-mode'
        ).addEventListener(
            'click',
            () => this.setMode(
                '3d'
            )
        );


        this.panel.querySelector(
            '#drawing-color'
        ).addEventListener(
            'input',
            (event) => {

                this.currentColor =
                    event.target.value;

            }
        );


        this.panel.querySelector(
            '#drawing-thickness'
        ).addEventListener(
            'input',
            (event) => {

                this.currentThickness =
                    Number(
                        event.target.value
                    );


                this.panel.querySelector(
                    '#drawing-thickness-label'
                ).textContent =
                    this.currentThickness;

            }
        );


        this.panel.querySelector(
            '#drawing-clear'
        ).addEventListener(
            'click',
            () => {

                this.clearCanvas();

            }
        );


        this.panel.querySelector(
            '#drawing-undo'
        ).addEventListener(
            'click',
            () => {

                this.undo();

            }
        );


        this.panel.querySelector(
            '#drawing-gallery'
        ).addEventListener(
            'click',
            () => {

                this.openTitleDialog();

            }
        );


        this.panel.querySelector(
            '#art-title-cancel'
        ).addEventListener(
            'click',
            () => {

                this.closeTitleDialog();

            }
        );


        this.panel.querySelector(
            '#art-title-confirm'
        ).addEventListener(
            'click',
            () => {

                this.addToGallery();

            }
        );


        this.panel.querySelector(
            '#art-title-input'
        ).addEventListener(
            'keydown',
            (event) => {

                if (
                    event.key ===
                    'Enter'
                ) {

                    this.addToGallery();

                }

            }
        );

    }


// ============================================================
// BROWSER DRAWING
// ============================================================

    attachPointerEvents() {

        this.browserCanvas.addEventListener(
            'pointerdown',
            (event) => {

                if (
                    this.mode !==
                    'browser'
                ) {

                    return;

                }


                this.isDrawing =
                    true;

                this.browserCanvas.setPointerCapture?.(
                    event.pointerId
                );


                const point =
                    this.getBrowserPoint(
                        event
                    );


                this.lastPoint =
                    point;

                this.beginStroke(
                    point
                );

            }
        );


        this.browserCanvas.addEventListener(
            'pointermove',
            (event) => {

                if (
                    !this.isDrawing ||
                    this.mode !==
                    'browser'
                ) {

                    return;

                }


                const point =
                    this.getBrowserPoint(
                        event
                    );


                this.drawBrowserLine(
                    this.lastPoint,
                    point
                );


                this.lastPoint =
                    point;

            }
        );


        this.browserCanvas.addEventListener(
            'pointerup',
            () => {

                this.finishBrowserDrawing();

            }
        );


        this.browserCanvas.addEventListener(
            'pointercancel',
            () => {

                this.finishBrowserDrawing();

            }
        );


        window.addEventListener(
            'pointerup',
            () => {

                this.finishBrowserDrawing();

            }
        );


        /*
         * Three.js renderer pointer events for 3D drawing.
         */

        this.renderer.domElement.addEventListener(
            'pointerdown',
            (event) => {

                if (
                    !this.isOpen ||
                    this.mode !== '3d'
                ) {

                    return;

                }


                this.begin3DDrawing(
                    event
                );

            }
        );


        this.renderer.domElement.addEventListener(
            'pointermove',
            (event) => {

                if (
                    !this.isOpen ||
                    this.mode !== '3d' ||
                    !this.isDrawing
                ) {

                    return;

                }


                this.continue3DDrawing(
                    event
                );

            }
        );


        window.addEventListener(
            'pointerup',
            () => {

                if (
                    this.mode === '3d'
                ) {

                    this.finish3DDrawing();

                }

            }
        );


        window.addEventListener(
            'resize',
            () => {

                this.resizeBrowserCanvas();

            }
        );

    }


// ============================================================
// BROWSER DRAWING HELPERS
// ============================================================

    getBrowserPoint(
        event
    ) {

        const rect =
            this.browserCanvas.getBoundingClientRect();


        return {

            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top

        };

    }


    beginStroke(
        point
    ) {

        this.browserContext.strokeStyle =
            this.currentColor;

        this.browserContext.lineWidth =
            this.currentThickness;

        this.browserContext.beginPath();

        this.browserContext.moveTo(
            point.x,
            point.y
        );

    }


    drawBrowserLine(
        from,
        to
    ) {

        this.browserContext.strokeStyle =
            this.currentColor;

        this.browserContext.lineWidth =
            this.currentThickness;

        this.browserContext.beginPath();

        this.browserContext.moveTo(
            from.x,
            from.y
        );

        this.browserContext.lineTo(
            to.x,
            to.y
        );

        this.browserContext.stroke();

    }


    finishBrowserDrawing() {

        if (
            !this.isDrawing ||
            this.mode !==
                'browser'
        ) {

            return;

        }


        this.isDrawing =
            false;

        this.lastPoint =
            null;

        this.saveHistory();

    }


// ============================================================
// THREE.JS DRAWING SURFACE
// ============================================================

    create3DDrawingSurface() {

        /*
         * 3D canvas:
         *
         * 6.4m wide
         * 4.1m tall
         *
         * Large enough to feel useful in XR.
         */

        const geometry =
            new THREE.PlaneGeometry(
                6.4,
                4.1
            );


        const material =
            new THREE.MeshBasicMaterial({
                map:
                    this.texture,

                side:
                    THREE.DoubleSide
            });


        this.drawingPlane =
            new THREE.Mesh(
                geometry,
                material
            );


        this.drawingPlane.name =
            'BloomXR_3D_DrawingCanvas';


        this.drawingPlane.visible =
            false;


        this.scene.add(
            this.drawingPlane
        );


        /*
         * Elegant frame.
         */

        const frameGeometry =
            new THREE.BoxGeometry(
                6.62,
                4.32,
                0.13
            );


        const frameMaterial =
            new THREE.MeshStandardMaterial({
                color:
                    0xb0955d,

                roughness:
                    0.38,

                metalness:
                    0.4
            });


        this.drawingFrame =
            new THREE.Mesh(
                frameGeometry,
                frameMaterial
            );


        this.drawingFrame.name =
            'BloomXR_3D_DrawingCanvasFrame';


        this.drawingFrame.visible =
            false;


        this.scene.add(
            this.drawingFrame
        );

    }


// ============================================================
// PLACE 3D CANVAS
// ============================================================

    position3DCanvas() {

        const direction =
            new THREE.Vector3();


        this.camera.getWorldDirection(
            direction
        );


        /*
         * Put the canvas in front of the user,
         * not inside their camera.
         */

        const position =
            this.camera.position
                .clone()
                .add(
                    direction.multiplyScalar(
                        4.5
                    )
                );


        position.y =
            Math.max(
                position.y,
                1.6
            );


        this.drawingPlane.position.copy(
            position
        );


        /*
         * Plane needs to face user.
         */

        this.drawingPlane.quaternion
            .copy(
                this.camera.quaternion
            );


        /*
         * Rotate plane so its visible surface faces
         * the camera correctly.
         */

        this.drawingPlane.rotateY(
            Math.PI
        );


        this.drawingFrame.position.copy(
            this.drawingPlane.position
        );


        this.drawingFrame.quaternion.copy(
            this.drawingPlane.quaternion
        );


    }


// ============================================================
// 3D RAYCASTING
// ============================================================

    get3DHit(
        clientX,
        clientY
    ) {

        const rect =
            this.renderer
                .domElement
                .getBoundingClientRect();


        this.pointer.x =
            (
                (clientX - rect.left) /
                rect.width
            ) *
                2 -
            1;


        this.pointer.y =
            -(
                (
                    clientY -
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


        const hits =
            this.raycaster.intersectObject(
                this.drawingPlane
            );


        if (
            !hits.length
        ) {

            return null;

        }


        return hits[0];

    }


// ============================================================
// 3D DRAW START
// ============================================================

    begin3DDrawing(
        event
    ) {

        const hit =
            this.get3DHit(
                event.clientX,
                event.clientY
            );


        if (!hit) {

            return;

        }


        this.isDrawing =
            true;


        this.lastPoint =
            hit.uv.clone();


        this.drawAtUV(
            hit.uv
        );

    }


// ============================================================
// 3D DRAW MOVE
// ============================================================

    continue3DDrawing(
        event
    ) {

        const hit =
            this.get3DHit(
                event.clientX,
                event.clientY
            );


        if (!hit) {

            return;

        }


        this.drawAtUV(
            hit.uv
        );

    }


// ============================================================
// UV DRAWING
// ============================================================

    drawAtUV(
        uv
    ) {

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;


        const x =
            uv.x * width;

        const y =
            (1 - uv.y) *
            height;


        const logicalLast =
            this.lastPoint
                ? {

                    x:
                        this.lastPoint.x *
                        width,

                    y:
                        (
                            1 -
                            this.lastPoint.y
                        ) *
                        height

                }
                : null;


        this.ctx.strokeStyle =
            this.currentColor;

        this.ctx.lineWidth =
            this.currentThickness * 2.2;


        this.ctx.beginPath();


        if (logicalLast) {

            this.ctx.moveTo(
                logicalLast.x,
                logicalLast.y
            );

        }

        else {

            this.ctx.moveTo(
                x,
                y
            );

        }


        this.ctx.lineTo(
            x,
            y
        );


        this.ctx.stroke();


        this.lastPoint =
            uv.clone();


        this.updateDrawingTexture();

    }


// ============================================================
// 3D DRAW FINISH
// ============================================================

    finish3DDrawing() {

        if (
            !this.isDrawing ||
            this.mode !== '3d'
        ) {

            return;

        }


        this.isDrawing =
            false;

        this.lastPoint =
            null;

        this.saveHistory();

    }


// ============================================================
// TEXTURE
// ============================================================

    updateDrawingTexture() {

        this.texture.needsUpdate =
            true;

    }


// ============================================================
// MODE
// ============================================================

    setMode(
        mode
    ) {

        if (
            mode !==
                'browser' &&
            mode !==
                '3d'
        ) {

            return;

        }


        this.mode =
            mode;


        const browserButton =
            this.panel.querySelector(
                '#drawing-browser-mode'
            );

        const threeButton =
            this.panel.querySelector(
                '#drawing-3d-mode'
            );

        const browserArea =
            this.panel.querySelector(
                '#browser-drawing-area'
            );

        const threeInfo =
            this.panel.querySelector(
                '#drawing-3d-info'
            );


        browserButton.classList.toggle(
            'active',
            mode === 'browser'
        );

        threeButton.classList.toggle(
            'active',
            mode === '3d'
        );


        if (
            mode === 'browser'
        ) {

            browserArea.style.display =
                'flex';

            threeInfo.style.display =
                'none';


            this.set3DCanvasVisible(
                false
            );


            this.renderer.domElement.style.pointerEvents =
                'auto';

        }

        else {

            browserArea.style.display =
                'none';

            threeInfo.style.display =
                'flex';


            this.position3DCanvas();


            this.set3DCanvasVisible(
                true
            );


            /*
             * Important:
             *
             * Pointer events remain enabled because the
             * renderer itself is now the interaction surface.
             */

            this.renderer.domElement.style.pointerEvents =
                'auto';

        }

    }


// ============================================================
// 3D VISIBILITY
// ============================================================

    set3DCanvasVisible(
        visible
    ) {

        if (
            this.drawingPlane
        ) {

            this.drawingPlane.visible =
                visible;

        }


        if (
            this.drawingFrame
        ) {

            this.drawingFrame.visible =
                visible;

        }

    }


// ============================================================
// OPEN
// ============================================================

    open() {

        if (
            this.isOpen
        ) {

            return;

        }


        this.isOpen =
            true;


        this.panel.classList.add(
            'open'
        );


        this.setMode(
            'browser'
        );


        /*
         * Resize after modal becomes visible.
         */

        requestAnimationFrame(
            () => {

                this.resizeBrowserCanvas();

            }
        );

    }


// ============================================================
// SHOW COMPATIBILITY
// ============================================================

    show() {

        this.open();

    }


// ============================================================
// HIDE
// ============================================================

    hide() {

        this.close();

    }


// ============================================================
// CLOSE
// ============================================================

    close() {

        this.isOpen =
            false;


        this.isDrawing =
            false;


        this.lastPoint =
            null;


        this.panel.classList.remove(
            'open'
        );


        this.set3DCanvasVisible(
            false
        );

        this.closeTitleDialog();

    }


// ============================================================
// TITLE DIALOG
// ============================================================

    openTitleDialog() {

        if (
            !this.gallery
        ) {

            console.warn(
                'DrawingStudio has no connected ArtGallery.'
            );

            return;

        }


        const overlay =
            this.panel.querySelector(
                '#art-title-overlay'
            );


        const input =
            this.panel.querySelector(
                '#art-title-input'
            );


        input.value =
            'Untitled';


        overlay.classList.add(
            'open'
        );


        setTimeout(
            () => {

                input.focus();

                input.select();

            },
            50
        );

    }


    closeTitleDialog() {

        const overlay =
            this.panel.querySelector(
                '#art-title-overlay'
            );


        overlay?.classList.remove(
            'open'
        );

    }


// ============================================================
// ADD TO GALLERY
// ============================================================

    async addToGallery() {

        if (
            !this.gallery
        ) {

            return;

        }


        const input =
            this.panel.querySelector(
                '#art-title-input'
            );


        const title =
            input.value.trim() ||
            'Untitled';


        try {

            await this.gallery
                .addArtworkFromCanvas({

                    canvas:
                        this.canvas,

                    title,

                    artist:
                        'You'

                });


            this.closeTitleDialog();


            this.showSuccessMessage();


            /*
             * Keep the artwork visible in the gallery,
             * then clear the studio for the next creation.
             */

            this.clearCanvas();

        }

        catch (
            error
        ) {

            console.error(
                'Unable to add artwork to gallery:',
                error
            );

        }

    }


// ============================================================
// SUCCESS MESSAGE
// ============================================================

    showSuccessMessage() {

        const message =
            document.createElement(
                'div'
            );


        message.textContent =
            'Your artwork has been placed in the Sanctuary Gallery.';


        Object.assign(
            message.style,
            {

                position:
                    'fixed',

                left:
                    '50%',

                bottom:
                    '35px',

                transform:
                    'translateX(-50%)',

                zIndex:
                    '10000',

                padding:
                    '13px 21px',

                borderRadius:
                    '999px',

                color:
                    '#ebf4e8',

                background:
                    'rgba(17,31,20,0.96)',

                border:
                    '1px solid rgba(184,217,188,0.22)',

                boxShadow:
                    '0 15px 50px rgba(0,0,0,0.4)',

                font:
                    '600 13px Arial'

            }
        );


        document.body.appendChild(
            message
        );


        setTimeout(
            () => {

                message.remove();

            },
            3200
        );

    }


// ============================================================
// XR CONTROLLERS
// ============================================================

    addXRController(
        controller
    ) {

        if (
            !controller
        ) {

            return;

        }


        /*
         * Avoid duplicate listeners.
         */

        if (
            controller.userData
                .bloomDrawingController
        ) {

            return;

        }


        controller.userData
            .bloomDrawingController =
                true;


        controller.addEventListener(
            'selectstart',
            () => {

                if (
                    !this.isOpen ||
                    this.mode !== '3d'
                ) {

                    return;

                }


                this.xrDrawing =
                    true;


                this.lastXRPoint =
                    null;

            }
        );


        controller.addEventListener(
            'selectend',
            () => {

                if (
                    this.mode !== '3d'
                ) {

                    return;

                }


                this.xrDrawing =
                    false;


                this.lastXRPoint =
                    null;


                this.saveHistory();

            }
        );


        controller.userData
            .bloomDrawing =
                this;

    }


// ============================================================
// XR DRAWING
// ============================================================

    updateXRControllers() {

        if (
            !this.renderer.xr.isPresenting
        ) {

            return;

        }


        if (
            !this.isOpen ||
            this.mode !== '3d'
        ) {

            return;

        }


        /*
         * Search controllers attached to scene.
         */

        this.scene.traverse(
            (object) => {

                if (
                    !object.isGroup &&
                    !object.userData
                ) {

                    return;

                }


                if (
                    !object.userData ||
                    object.userData.bloomDrawing !==
                        this
                ) {

                    return;

                }


                this.raycaster.ray.origin
                    .setFromMatrixPosition(
                        object.matrixWorld
                    );


                const direction =
                    new THREE.Vector3(
                        0,
                        0,
                        -1
                    );


                direction.applyQuaternion(
                    object.getWorldQuaternion(
                        new THREE.Quaternion()
                    )
                );


                this.raycaster.ray.direction.copy(
                    direction.normalize()
                );


                const hits =
                    this.raycaster.intersectObject(
                        this.drawingPlane
                    );


                if (
                    !hits.length ||
                    !this.xrDrawing
                ) {

                    return;

                }


                const uv =
                    hits[0].uv;


                this.drawAtUV(
                    uv
                );

            }
        );

    }


// ============================================================
// UPDATE
// ============================================================

    update() {

        if (
            !this.isOpen
        ) {

            return;

        }


        this.updateXRControllers();

    }


// ============================================================
// DISPOSE
// ============================================================

    dispose() {

        this.set3DCanvasVisible(
            false
        );


        if (
            this.drawingPlane
        ) {

            this.scene.remove(
                this.drawingPlane
            );


            this.drawingPlane.geometry.dispose();

            this.drawingPlane.material.dispose();

        }


        if (
            this.drawingFrame
        ) {

            this.scene.remove(
                this.drawingFrame
            );


            this.drawingFrame.geometry.dispose();

            this.drawingFrame.material.dispose();

        }


        this.texture.dispose();

    }

}