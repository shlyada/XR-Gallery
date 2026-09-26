import * as THREE from 'three';


// ============================================================
// BLOOMXR
// DREAMING OF BUTTERFLIES WORLD
// ============================================================
//
// Original BloomXR interpretation inspired by the documented
// high-level structure of IEEE VR 2026's "Dreaming of
// Butterflies":
//
//     Arrival / Tea Room
//             ↓
//     Terrace of Free Wandering
//             ↓
//     Isle of Cosmic Turning
//             ↓
//     Cliff of No-Self
//             ↓
//           Return
//
// In BloomXR:
//
//     Sanctuary Gallery is a permanent location inside the
//     same world, not a separate Lotus Sanctuary world.
//
// ============================================================


class DreamingOfButterflies {

    constructor(

        scene,

        camera,

        renderer,

        controllers = [],

        options = {}

    ) {

        this.scene =
            scene;


        this.camera =
            camera;


        this.renderer =
            renderer;


        this.controllers =
            controllers;


        this.onCameraPose =
            options.onCameraPose ||
            null;


        // ====================================================
        // ROOT
        // ====================================================

        this.group =
            new THREE.Group();


        this.group.name =
            'DreamingOfButterfliesWorld';


        this.scene.add(
            this.group
        );


        // ====================================================
        // GALLERY LOCATION
        // ====================================================
        //
        // The ArtGallery reads this value and places itself
        // here in the Dreaming world.
        //
        // The gallery is deliberately off to one side of the
        // arrival meadow so the tea room remains readable.
        //
        // ====================================================

        this.galleryAnchor =
            new THREE.Vector3(
                25,
                0,
                -8
            );


        this.group.userData.galleryAnchor =
            this.galleryAnchor;


        // ====================================================
        // CHAPTER STATE
        // ====================================================

        this.chapter =
            0;


        this.chapterTransition =
            false;


        this.transitionTimer =
            0;


        this.elapsed =
            0;


        this.storyTimer =
            0;


        this.finishedJourney =
            false;


        // ====================================================
        // CHAPTER GROUPS
        // ====================================================

        this.teaRoom =
            new THREE.Group();


        this.terrace =
            new THREE.Group();


        this.cosmic =
            new THREE.Group();


        this.noSelf =
            new THREE.Group();


        this.returnGroup =
            new THREE.Group();


        this.galleryMeadow =
            new THREE.Group();


        this.journeyGarden =
            new THREE.Group();


        this.teaRoom.name =
            'Chapter1_TeaRoom';


        this.terrace.name =
            'Chapter2_Terrace';


        this.cosmic.name =
            'Chapter3_CosmicTurning';


        this.noSelf.name =
            'Chapter4_CliffOfNoSelf';


        this.returnGroup.name =
            'Chapter5_Return';


        this.galleryMeadow.name =
            'GalleryMeadow';


        this.journeyGarden.name =
            'ButterflyJourneyGarden';


        this.group.add(
            this.teaRoom
        );


        this.group.add(
            this.terrace
        );


        this.group.add(
            this.cosmic
        );


        this.group.add(
            this.noSelf
        );


        this.group.add(
            this.returnGroup
        );


        /*
         * Gallery meadow exists independently from the chapter
         * groups because the gallery is persistent.
         */

        this.group.add(
            this.galleryMeadow
        );


        this.group.add(
            this.journeyGarden
        );


        // ====================================================
        // STATE ARRAYS
        // ====================================================

        this.butterflies =
            [];


        this.interactables =
            [];


        this.activeInteractables =
            [];


        this.goldenFish =
            [];


        this.textBlocks =
            [];


        this.lotusPlatforms =
            [];


        // ====================================================
        // BUILD
        // ====================================================

        this.createGalleryMeadow();

        this.createJourneyGarden();

        this.createTeaRoom();

        this.createTerrace();

        this.createCosmicTurning();

        this.createCliffOfNoSelf();

        this.createReturnRoom();

        this.createAmbientSystem();

        this.createChapterHUD();


        // ====================================================
        // INTERACTION
        // ====================================================

        this.setupInteraction();

        this.setupControllers();


        // ====================================================
        // START
        // ====================================================

        this.activateChapter(
            0,
            true
        );

    }


// ============================================================
// MATERIAL HELPERS
// ============================================================

    material(
        color,
        options = {}
    ) {

        return new THREE.MeshStandardMaterial({

            color,

            roughness:
                options.roughness ??
                0.82,

            metalness:
                options.metalness ??
                0,

            transparent:
                options.transparent ??
                false,

            opacity:
                options.opacity ??
                1,

            flatShading:
                options.flatShading ??
                true,

            emissive:
                options.emissive ??
                0x000000,

            emissiveIntensity:
                options.emissiveIntensity ??
                0

        });

    }


    basic(
        color,
        options = {}
    ) {

        return new THREE.MeshBasicMaterial({

            color,

            transparent:
                options.transparent ??
                false,

            opacity:
                options.opacity ??
                1,

            side:
                options.side ??
                THREE.FrontSide,

            depthWrite:
                options.depthWrite ??
                true

        });

    }


// ============================================================
// TEXTURE FROM CANVAS
// ============================================================

    textureFromCanvas(
        canvas
    ) {

        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.colorSpace =
            THREE.SRGBColorSpace;


        texture.needsUpdate =
            true;


        return texture;

    }


// ============================================================
// PAPER TEXTURE
// ============================================================

    createPaperTexture() {

        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width =
            1400;


        canvas.height =
            900;


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.fillStyle =
            '#ede4d2';


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        for (
            let i = 0;
            i < 4000;
            i++
        ) {

            const alpha =
                Math.random() *
                0.045;


            ctx.fillStyle =
                `rgba(57,63,55,${alpha})`;


            ctx.fillRect(

                Math.random() *
                    canvas.width,

                Math.random() *
                    canvas.height,

                1 +
                    Math.random() *
                    3,

                1

            );

        }


        return this.textureFromCanvas(
            canvas
        );

    }


// ============================================================
// ATMOSPHERE
// ============================================================

    setAtmosphere(
        chapter
    ) {

        const settings = [

            {

                background:
                    0xcfe6df,

                fog:
                    0xcfe6df,

                density:
                    0.012

            },


            {

                background:
                    0xd8e9df,

                fog:
                    0xd8e9df,

                density:
                    0.010

            },


            {

                background:
                    0x9aafbd,

                fog:
                    0x9aafbd,

                density:
                    0.008

            },


            {

                background:
                    0x657988,

                fog:
                    0x657988,

                density:
                    0.006

            },


            {

                background:
                    0xdcece4,

                fog:
                    0xdcece4,

                density:
                    0.009

            }

        ];


        const setting =
            settings[
                chapter
            ];


        this.scene.background =
            new THREE.Color(
                setting.background
            );


        this.scene.fog =
            new THREE.FogExp2(
                setting.fog,
                setting.density
            );

    }


// ============================================================
// LIGHTING
// ============================================================

    createLighting(
        parent,
        groundColor,
        intensity
    ) {

        const hemisphere =
            new THREE.HemisphereLight(

                0xf4faf4,

                groundColor,

                intensity

            );


        parent.add(
            hemisphere
        );


        const sun =
            new THREE.DirectionalLight(

                0xffeed0,

                intensity *
                0.82

            );


        sun.position.set(
            12,
            20,
            10
        );


        sun.castShadow =
            true;


        sun.shadow.mapSize.width =
            1024;


        sun.shadow.mapSize.height =
            1024;


        parent.add(
            sun
        );

    }


// ============================================================
// GALLERY MEADOW
// ============================================================
//
// The physical gallery now belongs here visually.
//
// ============================================================

    createGalleryMeadow() {

        const group =
            this.galleryMeadow;


        this.createLighting(
            group,
            0x69816f,
            1.30
        );


        // ----------------------------------------------------
        // Large soft meadow
        // ----------------------------------------------------

        const meadow =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    31,
                    72
                ),

                this.material(
                    0x8eaa8c,
                    {
                        roughness:
                            0.98
                    }
                )

            );


        meadow.rotation.x =
            -Math.PI /
            2;


        meadow.position.set(

            this.galleryAnchor.x,

            -0.04,

            this.galleryAnchor.z

        );


        meadow.receiveShadow =
            true;


        group.add(
            meadow
        );


        // ----------------------------------------------------
        // Outer ink ring
        // ----------------------------------------------------

        const ring =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    28,
                    0.045,
                    12,
                    128
                ),

                this.material(
                    0xc3cdb6,
                    {
                        roughness:
                            0.64
                    }
                )

            );


        ring.rotation.x =
            Math.PI /
            2;


        ring.position.set(

            this.galleryAnchor.x,

            0.02,

            this.galleryAnchor.z

        );


        group.add(
            ring
        );


        // ----------------------------------------------------
        // Low garden clusters
        // ----------------------------------------------------

        const bushLocations = [

            [4, -3],
            [47, -3],
            [8, 9],
            [43, 9],
            [5, -20],
            [45, -21],
            [15, 18],
            [35, 18]

        ];


        bushLocations.forEach(
            (
                [x, z],
                index
            ) => {

                this.createSoftBush(
                    group,
                    x,
                    z,
                    index
                );

            }
        );


        // ----------------------------------------------------
        // Lanterns
        // ----------------------------------------------------

        const lanternLocations = [

            [5, 8],

            [45, 8],

            [7, -17],

            [43, -17],

            [14, 19],

            [36, 19]

        ];


        lanternLocations.forEach(
            ([x, z]) => {

                this.createLantern(
                    group,
                    x,
                    z
                );

            }
        );


        // ----------------------------------------------------
        // Path from tea room toward gallery
        // ----------------------------------------------------

        this.createGalleryPath();

    }


// ============================================================
// SOFT BUSH
// ============================================================

    createSoftBush(
        parent,
        x,
        z,
        seed
    ) {

        const colors = [

            0x739778,

            0x83a783,

            0x91ae8e

        ];


        const bush =
            new THREE.Mesh(

                new THREE.DodecahedronGeometry(
                    0.72 +
                    (
                        seed %
                        3
                    ) *
                    0.10,

                    1
                ),

                this.material(
                    colors[
                        seed %
                        colors.length
                    ],
                    {
                        roughness:
                            0.96
                    }
                )

            );


        bush.position.set(
            x,
            0.55,
            z
        );


        bush.scale.y =
            0.65;


        parent.add(
            bush
        );

    }


// ============================================================
// LANTERN
// ============================================================

    createLantern(
        parent,
        x,
        z
    ) {

        const pole =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.03,
                    0.05,
                    1.8,
                    8
                ),

                this.material(
                    0x536158,
                    {
                        roughness:
                            0.79
                    }
                )

            );


        pole.position.set(
            x,
            0.9,
            z
        );


        parent.add(
            pole
        );


        const globe =
            this.createGlowSphere(
                0.14,
                0xffe3a4
            );


        globe.position.set(
            x,
            1.82,
            z
        );


        parent.add(
            globe
        );


        const light =
            new THREE.PointLight(
                0xffdc9d,
                0.42,
                5,
                2
            );


        light.position.copy(
            globe.position
        );


        parent.add(
            light
        );

    }


// ============================================================
// GALLERY PATH
// ============================================================

    createGalleryPath() {

        /*
         * A long, gentle stepping-stone path from the tea room
         * side of the world to the gallery meadow.
         */

        const material =
            this.material(
                0xd2d0be,
                {
                    roughness:
                        0.95
                }
            );


        for (
            let i = 0;
            i < 14;
            i++
        ) {

            const progress =
                i /
                13;


            const stone =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        1.65,
                        0.10,
                        1.15
                    ),

                    material

                );


            stone.position.set(

                8 +
                progress *
                17,

                0.04,

                9 -
                progress *
                17

            );


            stone.rotation.y =
                (
                    Math.random() -
                    0.5
                ) *
                0.14;


            this.galleryMeadow.add(
                stone
            );

        }

    }


// ============================================================
// JOURNEY GARDEN
// ============================================================
//
// A connected visual space between the gallery and symbolic
// scenes: brush strokes, floating paper fragments, bamboo,
// low flowers and butterfly markers.
// ============================================================

    createJourneyGarden() {

        const group =
            this.journeyGarden;


        // ----------------------------------------------------
        // Long meadow
        // ----------------------------------------------------

        const meadow =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    90,
                    55
                ),

                this.material(
                    0x789783,
                    {
                        roughness:
                            0.98
                    }
                )

            );


        meadow.rotation.x =
            -Math.PI /
            2;


        meadow.position.set(
            0,
            -0.03,
            -30
        );


        group.add(
            meadow
        );


        // ----------------------------------------------------
        // Ink brush lines
        // ----------------------------------------------------

        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const line =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        18 +
                        Math.random() *
                        8,

                        0.035,

                        0.05

                    ),

                    this.material(
                        0x61776d,
                        {
                            roughness:
                                0.96
                        }
                    )

                );


            line.position.set(

                (
                    Math.random() -
                    0.5
                ) *
                45,

                0.01,

                -10 -
                i *
                6

            );


            line.rotation.y =
                (
                    Math.random() -
                    0.5
                ) *
                0.3;


            group.add(
                line
            );

        }


        // ----------------------------------------------------
        // Bamboo
        // ----------------------------------------------------

        this.createBambooCluster(
            group,
            -28,
            -17,
            7
        );


        this.createBambooCluster(
            group,
            28,
            -17,
            7
        );


        // ----------------------------------------------------
        // Floating paper panels
        // ----------------------------------------------------

        const panel1 =
            this.createFloatingInkText(
                'WANDER',
                4.2,
                1.0
            );


        panel1.position.set(
            -12,
            4.7,
            -20
        );


        group.add(
            panel1
        );


        const panel2 =
            this.createFloatingInkText(
                'TURN',
                3.4,
                0.95
            );


        panel2.position.set(
            11,
            5.3,
            -35
        );


        group.add(
            panel2
        );


        // ----------------------------------------------------
        // Butterfly waymarkers
        // ----------------------------------------------------

        const positions = [

            [-7, 1.8, -15],

            [5, 2.2, -24],

            [-4, 2.6, -34]

        ];


        positions.forEach(
            (
                [x, y, z],
                index
            ) => {

                const butterfly =
                    this.createButterfly(
                        x,
                        y,
                        z
                    );


                butterfly.scale.setScalar(
                    0.72
                );


                butterfly.userData.phase =
                    index *
                    1.5;


                group.add(
                    butterfly
                );


                this.butterflies.push(
                    butterfly
                );

            }
        );

    }


// ============================================================
// BAMBOO
// ============================================================

    createBambooCluster(
        parent,
        x,
        z,
        count
    ) {

        const cluster =
            new THREE.Group();


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const height =
                3.2 +
                Math.random() *
                2.4;


            const stalk =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.055,
                        0.078,
                        height,
                        7
                    ),

                    this.material(
                        0x668471,
                        {
                            roughness:
                                0.94
                        }
                    )

                );


            stalk.position.set(

                (
                    Math.random() -
                    0.5
                ) *
                1.8,

                height /
                2,

                (
                    Math.random() -
                    0.5
                ) *
                1.8

            );


            stalk.rotation.z =
                (
                    Math.random() -
                    0.5
                ) *
                0.14;


            cluster.add(
                stalk
            );


            for (
                let j = 0;
                j < 5;
                j++
            ) {

                const leaf =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            0.18,
                            7,
                            6
                        ),

                        this.material(
                            0x7fa186,
                            {
                                roughness:
                                    0.97
                            }
                        )

                    );


                leaf.scale.set(
                    0.38,
                    0.11,
                    0.95
                );


                leaf.position.set(

                    stalk.position.x +
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.45,

                    0.9 +
                    j *
                    (
                        height /
                        6
                    ),

                    stalk.position.z

                );


                cluster.add(
                    leaf
                );

            }

        }


        cluster.position.set(
            x,
            0,
            z
        );


        parent.add(
            cluster
        );

    }


// ============================================================
// CHAPTER 1 — TEA ROOM
// ============================================================

    createTeaRoom() {

        const group =
            this.teaRoom;


        this.createLighting(
            group,
            0x69796f,
            1.38
        );


        // ----------------------------------------------------
        // Floor
        // ----------------------------------------------------

        const floor =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    18,
                    18
                ),

                this.material(
                    0xeadfc9,
                    {
                        roughness:
                            0.99
                    }
                )

            );


        floor.rotation.x =
            -Math.PI /
            2;


        group.add(
            floor
        );


        // ----------------------------------------------------
        // Tatami pattern
        // ----------------------------------------------------

        for (
            let i = -3;
            i <= 3;
            i++
        ) {

            const line =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        18,
                        0.018,
                        0.032
                    ),

                    this.material(
                        0xc2b8a4,
                        {
                            roughness:
                                1
                        }
                    )

                );


            line.position.set(
                0,
                0.025,
                i *
                2.55
            );


            group.add(
                line
            );

        }


        // ----------------------------------------------------
        // Shoji wall
        // ----------------------------------------------------

        const wall =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    16,
                    7,
                    0.20
                ),

                this.material(
                    0xe9dfca,
                    {
                        roughness:
                            0.96
                    }
                )

            );


        wall.position.set(
            0,
            3.5,
            -7.2
        );


        group.add(
            wall
        );


        for (
            let x = -6;
            x <= 6;
            x += 3
        ) {

            const frame =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        0.07,
                        6.3,
                        0.22
                    ),

                    this.material(
                        0x8f765b,
                        {
                            roughness:
                                0.83
                        }
                    )

                );


            frame.position.set(
                x,
                3.3,
                -7.02
            );


            group.add(
                frame
            );

        }


        // ----------------------------------------------------
        // Tea table
        // ----------------------------------------------------

        this.createTeaTable(
            group,
            0,
            -0.8
        );


        // ----------------------------------------------------
        // Tea cup
        // ----------------------------------------------------

        this.teaCup =
            this.createTeaCup(
                group,
                0,
                0.85
            );


        this.registerInteractable(
            this.teaCup,
            'teaCup'
        );


        // ----------------------------------------------------
        // Butterfly
        // ----------------------------------------------------

        this.teaRoomButterfly =
            this.createButterfly(
                0.8,
                2.1,
                0.6
            );


        group.add(
            this.teaRoomButterfly
        );


        this.butterflies.push(
            this.teaRoomButterfly
        );


        // ----------------------------------------------------
        // Scroll
        // ----------------------------------------------------

        const scroll =
            this.createFloatingInkText(
                'THE DREAM BEGINS',
                5.0,
                1.15
            );


        scroll.position.set(
            -4.3,
            3.2,
            -6.9
        );


        group.add(
            scroll
        );


        // ----------------------------------------------------
        // Gallery glimpse
        // ----------------------------------------------------
        //
        // A small opening aligned visually toward the gallery
        // meadow.
        //

        const opening =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    4.0,
                    2.8
                ),

                this.basic(
                    0xb9d1c5
                )

            );


        opening.position.set(
            5.1,
            2.7,
            -6.93
        );


        group.add(
            opening
        );


        // ----------------------------------------------------
        // Bamboo corners
        // ----------------------------------------------------

        this.createBambooCluster(
            group,
            -6.0,
            -4.8,
            4
        );


        this.createBambooCluster(
            group,
            6.0,
            -4.8,
            4
        );

    }


// ============================================================
// TEA TABLE
// ============================================================

    createTeaTable(
        parent,
        x,
        z
    ) {

        const wood =
            this.material(
                0x8d7559,
                {
                    roughness:
                        0.88
                }
            );


        const top =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    3.3,
                    0.20,
                    1.8
                ),

                wood

            );


        top.position.set(
            x,
            0.95,
            z
        );


        parent.add(
            top
        );


        const legs = [

            [-1.25, -0.62],

            [1.25, -0.62],

            [-1.25, 0.62],

            [1.25, 0.62]

        ];


        legs.forEach(
            ([lx, lz]) => {

                const leg =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            0.17,
                            0.94,
                            0.17
                        ),

                        wood

                    );


                leg.position.set(
                    x + lx,
                    0.47,
                    z + lz
                );


                parent.add(
                    leg
                );

            }
        );

    }


// ============================================================
// TEA CUP
// ============================================================

    createTeaCup(
        parent,
        x,
        z
    ) {

        const cup =
            new THREE.Group();


        cup.name =
            'TeaCup';


        const body =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.34,
                    0.26,
                    0.35,
                    20
                ),

                this.material(
                    0xf3ebd8,
                    {
                        roughness:
                            0.50
                    }
                )

            );


        body.position.y =
            1.15;


        cup.add(
            body
        );


        const tea =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.27,
                    0.27,
                    0.016,
                    20
                ),

                this.material(
                    0x9a7147,
                    {
                        roughness:
                            0.40
                    }
                )

            );


        tea.position.y =
            1.335;


        cup.add(
            tea
        );


        cup.position.set(
            x,
            0,
            z
        );


        parent.add(
            cup
        );


        return cup;

    }


// ============================================================
// CHAPTER 2 — TERRACE
// ============================================================

    createTerrace() {

        const group =
            this.terrace;


        this.createLighting(
            group,
            0x69816f,
            1.35
        );


        // ----------------------------------------------------
        // Floating island
        // ----------------------------------------------------

        const island =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    9.5,
                    6.7,
                    1.7,
                    12
                ),

                this.material(
                    0x78967d,
                    {
                        roughness:
                            0.97
                    }
                )

            );


        island.position.y =
            -0.70;


        island.scale.y =
            0.82;


        group.add(
            island
        );


        const top =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    9.15,
                    12
                ),

                this.material(
                    0xa9bda2,
                    {
                        roughness:
                            0.96
                    }
                )

            );


        top.rotation.x =
            -Math.PI /
            2;


        top.position.y =
            0.14;


        group.add(
            top
        );


        // ----------------------------------------------------
        // Bamboo
        // ----------------------------------------------------

        this.createBambooCluster(
            group,
            -6,
            -2.3,
            7
        );


        this.createBambooCluster(
            group,
            6,
            -1.9,
            7
        );


        // ----------------------------------------------------
        // Tea continuity
        // ----------------------------------------------------

        this.createTeaTable(
            group,
            0,
            1
        );


        this.terraceCup =
            this.createTeaCup(
                group,
                0,
                1
            );


        this.registerInteractable(
            this.terraceCup,
            'terraceCup'
        );


        // ----------------------------------------------------
        // Closed lotus
        // ----------------------------------------------------

        this.flowerBud =
            this.createClosedLotus(
                group,
                4,
                0.75,
                -1
            );


        this.registerInteractable(
            this.flowerBud,
            'flowerBud'
        );


        // ----------------------------------------------------
        // Ink mountains
        // ----------------------------------------------------

        this.createInkMountains(
            group
        );


        // ----------------------------------------------------
        // Butterfly guide
        // ----------------------------------------------------

        this.terraceButterfly =
            this.createButterfly(
                1.2,
                2.2,
                0.9
            );


        group.add(
            this.terraceButterfly
        );


        this.butterflies.push(
            this.terraceButterfly
        );


        // ----------------------------------------------------
        // Floating script
        // ----------------------------------------------------

        const script =
            this.createFloatingInkText(
                'FREE WANDERING',
                6.2,
                1.2
            );


        script.position.set(
            0,
            5.0,
            -5.2
        );


        group.add(
            script
        );

    }


// ============================================================
// INK MOUNTAINS
// ============================================================

    createInkMountains(
        parent
    ) {

        const mountains = [

            [-15, 8.0, 0x687c75],

            [-7, 6.2, 0x7b8c82],

            [0, 8.0, 0x82958a],

            [8, 6.6, 0x70867d],

            [15, 7.6, 0x60766f]

        ];


        mountains.forEach(
            item => {

                const mountain =
                    new THREE.Mesh(

                        new THREE.ConeGeometry(
                            item[1],
                            item[1] *
                            1.18,
                            7
                        ),

                        this.material(
                            item[2],
                            {
                                roughness:
                                    1
                            }
                        )

                    );


                mountain.position.set(

                    item[0],

                    item[1] /
                    2 -
                    1.1,

                    -17

                );


                mountain.scale.z =
                    0.5;


                parent.add(
                    mountain
                );

            }
        );

    }


// ============================================================
// CHAPTER 3 — COSMIC TURNING
// ============================================================

    createCosmicTurning() {

        const group =
            this.cosmic;


        this.createLighting(
            group,
            0x596d7a,
            1.08
        );


        // ----------------------------------------------------
        // Sky floor
        // ----------------------------------------------------

        const floor =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    40,
                    64
                ),

                this.material(
                    0x5f7888,
                    {
                        roughness:
                            0.98
                    }
                )

            );


        floor.rotation.x =
            -Math.PI /
            2;


        floor.position.y =
            -4;


        group.add(
            floor
        );


        // ----------------------------------------------------
        // Stars
        // ----------------------------------------------------

        this.createStars(
            group,
            260,
            26
        );


        // ----------------------------------------------------
        // Three lotus platforms
        // ----------------------------------------------------

        const positions = [

            [-5.3, 1.7, -0.5],

            [0, 2.8, -1.7],

            [5.3, 1.7, -0.5]

        ];


        positions.forEach(
            (
                position,
                index
            ) => {

                const lotus =
                    this.createLotusPlatform(

                        group,

                        position[0],

                        position[1],

                        position[2],

                        index

                    );


                this.lotusPlatforms.push(
                    lotus
                );


                this.registerInteractable(
                    lotus,
                    'lotusPlatform'
                );

            }
        );


        // ----------------------------------------------------
        // Central unreachable bloom
        // ----------------------------------------------------

        this.cosmicBloom =
            this.createRadiantLotus(
                group,
                0,
                7,
                -8
            );


        this.cosmicBloom.userData.locked =
            true;


        this.registerInteractable(
            this.cosmicBloom,
            'cosmicBloom'
        );


        // ----------------------------------------------------
        // Guide butterfly
        // ----------------------------------------------------

        this.cosmicButterfly =
            this.createButterfly(
                0,
                4.0,
                0
            );


        group.add(
            this.cosmicButterfly
        );


        this.butterflies.push(
            this.cosmicButterfly
        );


        // ----------------------------------------------------
        // Inscription
        // ----------------------------------------------------

        const inscription =
            this.createFloatingInkText(
                'TURN AND SEE',
                5.5,
                1.2
            );


        inscription.position.set(
            0,
            8.0,
            -13
        );


        group.add(
            inscription
        );

    }


// ============================================================
// LOTUS PLATFORM
// ============================================================

    createLotusPlatform(
        parent,
        x,
        y,
        z,
        index
    ) {

        const group =
            new THREE.Group();


        group.name =
            `LotusPlatform_${index}`;


        group.position.set(
            x,
            y,
            z
        );


        const base =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    2.25,
                    2.4,
                    0.30,
                    12
                ),

                this.material(
                    0x7c9e95,
                    {
                        roughness:
                            0.84
                    }
                )

            );


        group.add(
            base
        );


        const colors = [

            0xdabfcf,

            0xe5b8bd,

            0xc6d8cd,

            0xe4c88d

        ];


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const petal =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.84,
                        10,
                        8
                    ),

                    this.material(
                        colors[
                            i %
                            colors.length
                        ],
                        {
                            roughness:
                                0.80
                        }
                    )

                );


            const angle =
                (
                    i /
                    8
                ) *
                Math.PI *
                2;


            petal.position.set(

                Math.cos(
                    angle
                ) *
                1.42,

                0.24,

                Math.sin(
                    angle
                ) *
                1.42

            );


            petal.scale.set(
                1.15,
                0.38,
                1.72
            );


            petal.rotation.y =
                angle;


            group.add(
                petal
            );

        }


        const core =
            this.createGlowSphere(
                0.24,
                0xffdfa1
            );


        core.position.y =
            0.48;


        group.add(
            core
        );


        group.userData.turnCount =
            0;


        group.userData.index =
            index;


        parent.add(
            group
        );


        return group;

    }


// ============================================================
// CHAPTER 4 — CLIFF OF NO-SELF
// ============================================================

    createCliffOfNoSelf() {

        const group =
            this.noSelf;


        this.createLighting(
            group,
            0x435b64,
            1.0
        );


        // ----------------------------------------------------
        // Ground
        // ----------------------------------------------------

        const ground =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    16,
                    64
                ),

                this.material(
                    0x637b77,
                    {
                        roughness:
                            0.97
                    }
                )

            );


        ground.rotation.x =
            -Math.PI /
            2;


        group.add(
            ground
        );


        // ----------------------------------------------------
        // Pond
        // ----------------------------------------------------

        const pond =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    5,
                    5.2,
                    0.18,
                    64
                ),

                this.material(
                    0x78a3a5,
                    {
                        roughness:
                            0.40,

                        transparent:
                            true,

                        opacity:
                            0.88
                    }
                )

            );


        pond.position.set(
            0,
            0.10,
            2
        );


        group.add(
            pond
        );


        // ----------------------------------------------------
        // Tree
        // ----------------------------------------------------

        this.noSelfTree =
            this.createInkTree(
                group,
                0,
                0,
                -4
            );


        // ----------------------------------------------------
        // Luminous text blocks
        // ----------------------------------------------------

        const words = [

            'SELF',

            'OTHER',

            'DREAM',

            'FLOW'

        ];


        const positions = [

            [-1.8, 5.0, 0.2],

            [1.8, 5.6, -0.2],

            [-2.4, 4.1, -0.4],

            [2.4, 4.3, 0.5]

        ];


        words.forEach(
            (
                word,
                index
            ) => {

                const block =
                    this.createFloatingInkText(
                        word,
                        1.9,
                        0.78
                    );


                block.name =
                    `TextBlock_${word}`;


                block.position.set(

                    positions[
                        index
                    ][0],

                    positions[
                        index
                    ][1],

                    positions[
                        index
                    ][2]

                );


                block.userData.text =
                    word;


                block.userData.collected =
                    false;


                group.add(
                    block
                );


                this.textBlocks.push(
                    block
                );


                this.registerInteractable(
                    block,
                    'textBlock'
                );

            }
        );


        // ----------------------------------------------------
        // Waterfall
        // ----------------------------------------------------

        this.waterfall =
            this.createWaterfall(
                group
            );


        this.registerInteractable(
            this.waterfall,
            'waterfall'
        );


        // ----------------------------------------------------
        // Cliff
        // ----------------------------------------------------

        this.createCliff(
            group
        );


        // ----------------------------------------------------
        // Butterfly
        // ----------------------------------------------------

        this.noSelfButterfly =
            this.createButterfly(
                -3.3,
                2.2,
                1.3
            );


        group.add(
            this.noSelfButterfly
        );


        this.butterflies.push(
            this.noSelfButterfly
        );


        // ----------------------------------------------------
        // Title
        // ----------------------------------------------------

        const title =
            this.createFloatingInkText(
                'BEYOND FORM',
                5.2,
                1.2
            );


        title.position.set(
            0,
            7,
            -10.5
        );


        group.add(
            title
        );

    }


// ============================================================
// TREE
// ============================================================

    createInkTree(
        parent,
        x,
        y,
        z
    ) {

        const tree =
            new THREE.Group();


        const trunk =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.34,
                    0.55,
                    4.8,
                    8
                ),

                this.material(
                    0x364943,
                    {
                        roughness:
                            0.98
                    }
                )

            );


        trunk.position.y =
            2.4;


        trunk.rotation.z =
            -0.08;


        tree.add(
            trunk
        );


        const canopyColors = [

            0x5d796b,

            0x6f897a,

            0x7f9783,

            0x92a691

        ];


        const positions = [

            [-1.6, 5.0, 0],

            [0, 5.5, 0],

            [1.5, 5.0, 0],

            [-0.8, 6.05, -0.2],

            [0.9, 6.1, -0.15]

        ];


        positions.forEach(
            (
                position,
                index
            ) => {

                const crown =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            1.45,
                            10,
                            8
                        ),

                        this.material(
                            canopyColors[
                                index %
                                canopyColors.length
                            ],
                            {
                                roughness:
                                    0.96
                            }
                        )

                    );


                crown.position.set(
                    position[0],
                    position[1],
                    position[2]
                );


                crown.scale.set(
                    1.25,
                    0.62,
                    0.92
                );


                tree.add(
                    crown
                );

            }
        );


        tree.position.set(
            x,
            y,
            z
        );


        parent.add(
            tree
        );


        return tree;

    }


// ============================================================
// WATERFALL
// ============================================================

    createWaterfall(
        parent
    ) {

        const group =
            new THREE.Group();


        group.name =
            'NoSelfWaterfall';


        const wall =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.55,
                    5.6,
                    5.2
                ),

                this.material(
                    0x50646c,
                    {
                        roughness:
                            0.98
                    }
                )

            );


        wall.position.set(
            -7.5,
            3,
            -0.7
        );


        group.add(
            wall
        );


        const water =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    3.8,
                    5
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xb2dbd7,

                    transparent:
                        true,

                    opacity:
                        0.60,

                    side:
                        THREE.DoubleSide,

                    depthWrite:
                        false

                })

            );


        water.position.set(
            -7.15,
            3.05,
            -0.7
        );


        group.add(
            water
        );


        group.userData.revealed =
            false;


        parent.add(
            group
        );


        return group;

    }


// ============================================================
// CLIFF
// ============================================================

    createCliff(
        parent
    ) {

        const cliff =
            new THREE.Mesh(

                new THREE.ConeGeometry(
                    4.8,
                    8.5,
                    7,
                    1,
                    true
                ),

                this.material(
                    0x43565f,
                    {
                        roughness:
                            0.99
                    }
                )

            );


        cliff.position.set(
            9,
            4.3,
            -10
        );


        cliff.rotation.z =
            0.12;


        parent.add(
            cliff
        );

    }


// ============================================================
// RETURN
// ============================================================

    createReturnRoom() {

        const group =
            this.returnGroup;


        this.createLighting(
            group,
            0x6f8378,
            1.38
        );


        const floor =
            new THREE.Mesh(

                new THREE.CircleGeometry(
                    15,
                    48
                ),

                this.material(
                    0xb8c9b5,
                    {
                        roughness:
                            0.96
                    }
                )

            );


        floor.rotation.x =
            -Math.PI /
            2;


        group.add(
            floor
        );


        const portal =
            this.createGlowRing(
                2.0,
                0xf3d69a,
                0.40
            );


        portal.position.set(
            0,
            3.5,
            -1.0
        );


        group.add(
            portal
        );


        const script =
            this.createFloatingInkText(
                'DREAM OR DREAMER?',
                7.4,
                1.3
            );


        script.position.set(
            0,
            5.5,
            -5.0
        );


        group.add(
            script
        );


        this.returnButterfly =
            this.createButterfly(
                0.4,
                2.2,
                0.9
            );


        group.add(
            this.returnButterfly
        );


        this.butterflies.push(
            this.returnButterfly
        );

    }


// ============================================================
// GLOW SPHERE
// ============================================================

    createGlowSphere(
        radius,
        color
    ) {

        return new THREE.Mesh(

            new THREE.SphereGeometry(
                radius,
                16,
                12
            ),

            this.material(
                color,
                {

                    roughness:
                        0.42,

                    emissive:
                        color,

                    emissiveIntensity:
                        1.45,

                    flatShading:
                        false

                }
            )

        );

    }


// ============================================================
// GLOW RING
// ============================================================

    createGlowRing(
        radius,
        color,
        opacity
    ) {

        return new THREE.Mesh(

            new THREE.TorusGeometry(
                radius,
                0.035,
                10,
                64
            ),

            new THREE.MeshBasicMaterial({

                color,

                transparent:
                    true,

                opacity,

                depthWrite:
                    false

            })

        );

    }


// ============================================================
// CLOSED LOTUS
// ============================================================

    createClosedLotus(
        parent,
        x,
        y,
        z
    ) {

        const group =
            new THREE.Group();


        group.name =
            'InteractiveFlowerBud';


        const colors = [

            0xe1b5bf,

            0xd5acc5,

            0xf0c990

        ];


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const petal =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.35,
                        10,
                        8
                    ),

                    this.material(
                        colors[
                            i %
                            colors.length
                        ],
                        {
                            roughness:
                                0.76
                        }
                    )

                );


            const angle =
                (
                    i /
                    8
                ) *
                Math.PI *
                2;


            petal.position.set(

                Math.cos(
                    angle
                ) *
                0.23,

                0.28,

                Math.sin(
                    angle
                ) *
                0.23

            );


            petal.scale.set(
                0.65,
                1.15,
                0.65
            );


            group.add(
                petal
            );

        }


        group.position.set(
            x,
            y,
            z
        );


        group.userData.bloomProgress =
            0;


        parent.add(
            group
        );


        return group;

    }


// ============================================================
// RADIANT LOTUS
// ============================================================

    createRadiantLotus(
        parent,
        x,
        y,
        z
    ) {

        const group =
            new THREE.Group();


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            const petal =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.50,
                        10,
                        8
                    ),

                    this.material(
                        0xf0c9cb,
                        {
                            roughness:
                                0.72,

                            emissive:
                                0x764e5e,

                            emissiveIntensity:
                                0.18
                        }
                    )

                );


            const angle =
                (
                    i /
                    12
                ) *
                Math.PI *
                2;


            petal.position.set(

                Math.cos(
                    angle
                ) *
                1.2,

                0.17,

                Math.sin(
                    angle
                ) *
                1.2

            );


            petal.scale.set(
                0.88,
                0.45,
                1.38
            );


            petal.rotation.y =
                angle;


            group.add(
                petal
            );

        }


        const core =
            this.createGlowSphere(
                0.42,
                0xffdfa0
            );


        core.position.y =
            0.36;


        group.add(
            core
        );


        group.position.set(
            x,
            y,
            z
        );


        parent.add(
            group
        );


        return group;

    }


// ============================================================
// BUTTERFLY
// ============================================================

    createButterfly(
        x,
        y,
        z
    ) {

        const butterfly =
            new THREE.Group();


        butterfly.name =
            'DreamingButterfly';


        butterfly.userData.isButterfly =
            true;


        const body =
            new THREE.Mesh(

                new THREE.CapsuleGeometry(
                    0.06,
                    0.34,
                    4,
                    8
                ),

                this.material(
                    0x4c554d,
                    {
                        roughness:
                            0.82
                    }
                )

            );


        body.rotation.z =
            Math.PI /
            2;


        butterfly.add(
            body
        );


        const wingMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0xa68bbd,

                transparent:
                    true,

                opacity:
                    0.82,

                side:
                    THREE.DoubleSide,

                depthWrite:
                    false

            });


        const leftWing =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.40,
                    8,
                    6
                ),

                wingMaterial

            );


        const rightWing =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.40,
                    8,
                    6
                ),

                wingMaterial.clone()

            );


        leftWing.scale.set(
            0.92,
            0.10,
            1.42
        );


        rightWing.scale.set(
            0.92,
            0.10,
            1.42
        );


        leftWing.position.x =
            -0.30;


        rightWing.position.x =
            0.30;


        butterfly.add(
            leftWing
        );


        butterfly.add(
            rightWing
        );


        butterfly.userData.leftWing =
            leftWing;


        butterfly.userData.rightWing =
            rightWing;


        butterfly.position.set(
            x,
            y,
            z
        );


        butterfly.userData.phase =
            Math.random() *
            Math.PI *
            2;


        butterfly.userData.speed =
            0.75 +
            Math.random() *
            0.25;


        return butterfly;

    }


// ============================================================
// INK TEXT
// ============================================================

    createFloatingInkText(
        text,
        width,
        height
    ) {

        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width =
            1200;


        canvas.height =
            250;


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.fillStyle =
            'rgba(239,231,213,0.88)';


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /*
         * Subtle brush wash.
         */

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            ctx.strokeStyle =
                `rgba(48,64,57,${0.05 + Math.random() * 0.07})`;


            ctx.lineWidth =
                8 +
                Math.random() *
                14;


            ctx.beginPath();


            ctx.moveTo(
                80,
                50 +
                i *
                34
            );


            ctx.bezierCurveTo(

                360,
                10 +
                Math.random() *
                90,

                830,
                160 +
                Math.random() *
                60,

                1120,
                55 +
                Math.random() *
                110

            );


            ctx.stroke();

        }


        ctx.textAlign =
            'center';


        ctx.textBaseline =
            'middle';


        ctx.fillStyle =
            '#344940';


        ctx.font =
            '600 60px Georgia, serif';


        ctx.fillText(
            text,
            600,
            126
        );


        const texture =
            this.textureFromCanvas(
                canvas
            );


        return new THREE.Mesh(

            new THREE.PlaneGeometry(
                width,
                height
            ),

            new THREE.MeshBasicMaterial({

                map:
                    texture,

                transparent:
                    true,

                depthWrite:
                    false,

                side:
                    THREE.DoubleSide

            })

        );

    }


// ============================================================
// STARS
// ============================================================

    createStars(
        parent,
        count,
        radius
    ) {

        const positions =
            new Float32Array(
                count *
                3
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;


            const radial =
                radius *
                (
                    0.40 +
                    Math.random() *
                    0.60
                );


            positions[
                i * 3
            ] =
                Math.cos(
                    angle
                ) *
                radial;


            positions[
                i * 3 + 1
            ] =
                4 +
                Math.random() *
                15;


            positions[
                i * 3 + 2
            ] =
                -10 +
                (
                    Math.random() -
                    0.5
                ) *
                38;

        }


        const geometry =
            new THREE.BufferGeometry();


        geometry.setAttribute(

            'position',

            new THREE.BufferAttribute(
                positions,
                3
            )

        );


        const material =
            new THREE.PointsMaterial({

                color:
                    0xffefd0,

                size:
                    0.055,

                transparent:
                    true,

                opacity:
                    0.62,

                depthWrite:
                    false

            });


        const stars =
            new THREE.Points(
                geometry,
                material
            );


        parent.add(
            stars
        );


        this.stars =
            stars;

    }


// ============================================================
// AMBIENT PARTICLES
// ============================================================

    createAmbientSystem() {

        const count =
            90;


        const positions =
            new Float32Array(
                count *
                3
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            positions[
                i * 3
            ] =
                (
                    Math.random() -
                    0.5
                ) *
                38;


            positions[
                i * 3 + 1
            ] =
                1 +
                Math.random() *
                10;


            positions[
                i * 3 + 2
            ] =
                (
                    Math.random() -
                    0.5
                ) *
                38;

        }


        const geometry =
            new THREE.BufferGeometry();


        geometry.setAttribute(

            'position',

            new THREE.BufferAttribute(
                positions,
                3
            )

        );


        const material =
            new THREE.PointsMaterial({

                color:
                    0xe8ddae,

                size:
                    0.035,

                transparent:
                    true,

                opacity:
                    0.28,

                depthWrite:
                    false

            });


        this.ambient =
            new THREE.Points(
                geometry,
                material
            );


        this.group.add(
            this.ambient
        );

    }


// ============================================================
// INTERACTION SETUP
// ============================================================

    setupInteraction() {

        this.raycaster =
            new THREE.Raycaster();


        this.pointer =
            new THREE.Vector2();

    }


    setupControllers() {

        this.controllers.forEach(
            controller => {

                if (
                    !controller
                ) {

                    return;

                }


                if (
                    controller.userData
                        .dreamButterflyBound
                ) {

                    return;

                }


                controller.userData
                    .dreamButterflyBound =
                    true;


                controller.addEventListener(
                    'selectstart',
                    () => {

                        this.handleXRSelect(
                            controller
                        );

                    }
                );

            }
        );

    }


// ============================================================
// REGISTER INTERACTABLE
// ============================================================

    registerInteractable(
        object,
        type
    ) {

        object.userData
            .butterflyInteractable =
            true;


        object.userData
            .interactionType =
            type;


        this.interactables.push(
            object
        );

    }


// ============================================================
// HANDLE POINTER
// ============================================================

    handlePointer(
        event
    ) {

        if (
            !this.renderer
        ) {

            return false;

        }


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


        this.updateActiveInteractables();


        const hits =
            this.raycaster.intersectObjects(
                this.activeInteractables,
                true
            );


        if (
            !hits.length
        ) {

            return false;

        }


        let target =
            hits[0].object;


        while (
            target &&
            !target.userData
                ?.butterflyInteractable &&
            target.parent
        ) {

            target =
                target.parent;

        }


        if (
            target?.userData
                ?.butterflyInteractable
        ) {

            this.interactWith(
                target
            );


            return true;

        }


        return false;

    }


// ============================================================
// XR
// ============================================================

    handleXRSelect(
        controller
    ) {

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


        this.raycaster.set(
            origin,
            direction
        );


        this.updateActiveInteractables();


        const hits =
            this.raycaster.intersectObjects(
                this.activeInteractables,
                true
            );


        if (
            !hits.length
        ) {

            return;

        }


        let target =
            hits[0].object;


        while (
            target &&
            !target.userData
                ?.butterflyInteractable &&
            target.parent
        ) {

            target =
                target.parent;

        }


        if (
            target?.userData
                ?.butterflyInteractable
        ) {

            this.interactWith(
                target
            );

        }

    }


// ============================================================
// ACTIVE INTERACTABLES
// ============================================================

    updateActiveInteractables() {

        const chapterGroup =
            [

                this.teaRoom,

                this.terrace,

                this.cosmic,

                this.noSelf,

                this.returnGroup

            ][
                this.chapter
            ];


        this.activeInteractables =
            this.interactables.filter(
                object => {

                    let current =
                        object;


                    while (
                        current &&
                        current !==
                            this.group
                    ) {

                        if (
                            current ===
                            chapterGroup
                        ) {

                            return true;

                        }


                        current =
                            current.parent;

                    }


                    return false;

                }
            );

    }


// ============================================================
// INTERACTION
// ============================================================

    interactWith(
        object
    ) {

        const type =
            object.userData
                ?.interactionType;


        switch (
            type
        ) {

            case 'teaCup':

                this.interactTeaCup();

                break;


            case 'terraceCup':

                this.interactTerraceCup();

                break;


            case 'flowerBud':

                this.interactFlowerBud();

                break;


            case 'lotusPlatform':

                this.interactLotusPlatform(
                    object
                );

                break;


            case 'cosmicBloom':

                this.interactCosmicBloom();

                break;


            case 'textBlock':

                this.interactTextBlock(
                    object
                );

                break;


            case 'waterfall':

                this.interactWaterfall(
                    object
                );

                break;


            default:
                break;

        }

    }


// ============================================================
// TEA CUP
// ============================================================

    interactTeaCup() {

        if (
            this.chapter !==
            0
        ) {

            return;

        }


        this.pulseGlow(
            this.teaRoomButterfly
        );


        /*
         * The user can move naturally to the gallery after
         * entering the dream. We do not force an immediate
         * transition anymore.
         */

        this.createButterflyTrail(
            new THREE.Vector3(
                0,
                2,
                -4
            )
        );

    }


// ============================================================
// TERRACE CUP
// ============================================================

    interactTerraceCup() {

        this.createButterflyTrail(
            new THREE.Vector3(
                0,
                2,
                -2
            )
        );

    }


// ============================================================
// FLOWER
// ============================================================

    interactFlowerBud() {

        if (
            !this.flowerBud
        ) {

            return;

        }


        if (
            this.flowerBud.userData
                .bloomProgress >
            0
        ) {

            return;

        }


        this.flowerBud.userData
            .bloomProgress =
            1;


        this.bloomFlower(
            this.flowerBud
        );


        setTimeout(
            () => {

                this.activateChapter(
                    2
                );

            },
            1300
        );

    }


// ============================================================
// BLOOM
// ============================================================

    bloomFlower(
        group
    ) {

        group.scale.set(
            1.25,
            1.05,
            1.25
        );


        group.children.forEach(
            (
                petal,
                index
            ) => {

                const angle =
                    (
                        index /
                        group.children.length
                    ) *
                    Math.PI *
                    2;


                petal.position.x =
                    Math.cos(
                        angle
                    ) *
                    0.43;


                petal.position.z =
                    Math.sin(
                        angle
                    ) *
                    0.43;


                petal.rotation.z =
                    (
                        index %
                        2 ===
                        0
                    )
                        ? 0.32
                        : -0.32;

            }
        );

    }


// ============================================================
// LOTUS ROTATION
// ============================================================

    interactLotusPlatform(
        platform
    ) {

        if (
            this.chapter !==
            2
        ) {

            return;

        }


        platform.rotation.y +=
            Math.PI /
            4;


        platform.userData.turnCount++;


        if (
            this.lotusPlatforms.every(
                lotus =>
                    lotus.userData.turnCount >
                    0
            )
        ) {

            this.cosmicBloom.userData.locked =
                false;


            this.createLotusPath();

        }

    }


// ============================================================
// LOTUS PATH
// ============================================================

    createLotusPath() {

        if (
            this.cosmicPathCreated
        ) {

            return;

        }


        this.cosmicPathCreated =
            true;


        for (
            let i = 0;
            i < 11;
            i++
        ) {

            const step =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.68,
                        0.68,
                        0.035,
                        32
                    ),

                    this.material(
                        i % 2
                            ? 0xc7dbcf
                            : 0xe0c5c2,
                        {
                            emissive:
                                0x3b5650,

                            emissiveIntensity:
                                0.20,

                            roughness:
                                0.75
                        }
                    )

                );


            step.position.set(

                (
                    i -
                    5
                ) *
                0.85,

                0.7 +
                i *
                0.18,

                -1.5 -
                i *
                0.62

            );


            this.cosmic.add(
                step
            );

        }

    }


// ============================================================
// COSMIC BLOOM
// ============================================================

    interactCosmicBloom() {

        if (
            this.cosmicBloom.userData.locked
        ) {

            return;

        }


        this.createButterflyBurst(
            this.cosmicBloom.position
        );


        setTimeout(
            () => {

                this.activateChapter(
                    3
                );

            },
            1500
        );

    }


// ============================================================
// TEXT BLOCK
// ============================================================

    interactTextBlock(
        block
    ) {

        if (
            block.userData.collected
        ) {

            return;

        }


        block.userData.collected =
            true;


        block.visible =
            false;


        this.createGoldenFish(
            block.userData.text
        );


        const collected =
            this.textBlocks.filter(
                item =>
                    item.userData.collected
            ).length;


        if (
            collected >=
            4
        ) {

            setTimeout(
                () => {

                    this.triggerTransformation();

                },
                1300
            );

        }

    }


// ============================================================
// WATERFALL
// ============================================================

    interactWaterfall(
        waterfall
    ) {

        waterfall.userData.revealed =
            true;


        waterfall.children.forEach(
            child => {

                child.scale.x *=
                    1.20;

                child.scale.y *=
                    1.15;

            }
        );

    }


// ============================================================
// GOLDEN FISH
// ============================================================

    createGoldenFish(
        text
    ) {

        const fish =
            new THREE.Group();


        fish.name =
            'GoldenFish';


        const body =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.20,
                    10,
                    8
                ),

                this.material(
                    0xe0ae58,
                    {
                        emissive:
                            0x69451c,

                        emissiveIntensity:
                            0.50,

                        roughness:
                            0.39
                    }
                )

            );


        body.scale.set(
            1.55,
            0.65,
            0.65
        );


        fish.add(
            body
        );


        const tail =
            new THREE.Mesh(

                new THREE.ConeGeometry(
                    0.18,
                    0.32,
                    4
                ),

                this.material(
                    0xedc777,
                    {
                        roughness:
                            0.42
                    }
                )

            );


        tail.rotation.z =
            Math.PI /
            2;


        tail.position.x =
            -0.34;


        fish.add(
            tail
        );


        fish.position.set(

            (
                Math.random() -
                0.5
            ) *
            2.8,

            0.48,

            1.9 +
            (
                Math.random() -
                0.5
            ) *
            3.0

        );


        fish.userData.angle =
            Math.random() *
            Math.PI *
            2;


        fish.userData.radius =
            1.4 +
            Math.random() *
            1.7;


        this.noSelf.add(
            fish
        );


        this.goldenFish.push(
            fish
        );

    }


// ============================================================
// TRANSFORMATION
// ============================================================

    triggerTransformation() {

        if (
            this.finishedJourney
        ) {

            return;

        }


        this.finishedJourney =
            true;


        const silhouette =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    1.6,
                    14,
                    10
                ),

                this.basic(
                    0x2f4a50,
                    {
                        transparent:
                            true,

                        opacity:
                            0.70
                    }
                )

            );


        silhouette.scale.set(
            2.3,
            0.52,
            0.90
        );


        silhouette.position.set(
            0,
            3,
            1
        );


        this.noSelf.add(
            silhouette
        );


        setTimeout(
            () => {

                this.activateChapter(
                    4
                );

            },
            2200
        );

    }


// ============================================================
// BUTTERFLY BURST
// ============================================================

    createButterflyBurst(
        position
    ) {

        /*
         * Small burst, not a swarm.
         */

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            const butterfly =
                this.createButterfly(

                    position.x +
                    (
                        Math.random() -
                        0.5
                    ) *
                    2.0,

                    position.y +
                    (
                        Math.random() -
                        0.5
                    ) *
                    1.5,

                    position.z +
                    (
                        Math.random() -
                        0.5
                    ) *
                    2.0

                );


            butterfly.scale.setScalar(
                0.60
            );


            this.cosmic.add(
                butterfly
            );


            this.butterflies.push(
                butterfly
            );

        }

    }


// ============================================================
// BUTTERFLY TRAIL
// ============================================================

    createButterflyTrail(
        start
    ) {

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const marker =
                this.createGlowSphere(
                    0.055,
                    0xffdda0
                );


            marker.position.set(

                start.x +
                i *
                0.9,

                start.y +
                Math.sin(
                    i
                ) *
                0.22,

                start.z -
                i *
                0.9

            );


            const group =
                this.teaRoom.visible
                    ? this.teaRoom
                    : this.group;


            group.add(
                marker
            );

        }

    }


// ============================================================
// ACTIVATE CHAPTER
// ============================================================

    activateChapter(
        chapter,
        instant = false
    ) {

        if (
            chapter < 0 ||
            chapter > 4
        ) {

            return;

        }


        this.chapter =
            chapter;


        this.chapterTransition =
            !instant;


        this.transitionTimer =
            0;


        // ----------------------------------------------------
        // Visibility
        // ----------------------------------------------------

        this.teaRoom.visible =
            chapter === 0;


        this.terrace.visible =
            chapter === 1;


        this.cosmic.visible =
            chapter === 2;


        this.noSelf.visible =
            chapter === 3;


        this.returnGroup.visible =
            chapter === 4;


        /*
         * Gallery meadow ALWAYS remains.
         */

        this.galleryMeadow.visible =
            true;


        this.journeyGarden.visible =
            true;


        // ----------------------------------------------------
        // Atmosphere
        // ----------------------------------------------------

        this.setAtmosphere(
            chapter
        );


        // ----------------------------------------------------
        // Camera poses
        // ----------------------------------------------------

        const poses = [

            {

                position:
                    new THREE.Vector3(
                        0,
                        1.75,
                        6.5
                    ),

                target:
                    new THREE.Vector3(
                        0,
                        2.0,
                        -2.5
                    )

            },


            {

                position:
                    new THREE.Vector3(
                        0,
                        2.1,
                        6.3
                    ),

                target:
                    new THREE.Vector3(
                        0,
                        2.3,
                        -1.5
                    )

            },


            {

                position:
                    new THREE.Vector3(
                        0,
                        3.2,
                        8.3
                    ),

                target:
                    new THREE.Vector3(
                        0,
                        3.6,
                        -4.5
                    )

            },


            {

                position:
                    new THREE.Vector3(
                        0,
                        1.9,
                        9.0
                    ),

                target:
                    new THREE.Vector3(
                        0,
                        3.0,
                        0
                    )

            },


            {

                position:
                    new THREE.Vector3(
                        0,
                        1.8,
                        5.2
                    ),

                target:
                    new THREE.Vector3(
                        0,
                        2.1,
                        -2.5
                    )

            }

        ];


        const pose =
            poses[
                chapter
            ];


        if (
            this.onCameraPose
        ) {

            this.onCameraPose(

                pose.position,

                pose.target

            );

        }

        else {

            this.camera.position.copy(
                pose.position
            );


            this.camera.lookAt(
                pose.target
            );

        }


        // ----------------------------------------------------
        // HUD
        // ----------------------------------------------------

        this.updateChapterHUD();


        setTimeout(
            () => {

                this.chapterTransition =
                    false;

            },
            instant
                ? 0
                : 750
        );

    }


// ============================================================
// CHAPTER HUD
// ============================================================

    createChapterHUD() {

        this.hud =
            document.createElement(
                'div'
            );


        this.hud.id =
            'bloomxr-dream-hud';


        this.hud.innerHTML = `

            <div
                id="bloomxr-dream-title"
            >
                DREAMING OF BUTTERFLIES
            </div>

            <div
                id="bloomxr-dream-subtitle"
            >
                The tea room
            </div>

        `;


        document.body.appendChild(
            this.hud
        );


        const style =
            document.createElement(
                'style'
            );


        style.id =
            'bloomxr-dream-hud-style';


        style.textContent = `

            #bloomxr-dream-hud {

                position:
                    fixed;

                left:
                    50%;

                top:
                    20px;

                transform:
                    translateX(-50%);

                z-index:
                    4100;

                min-width:
                    300px;

                padding:
                    10px 18px;

                text-align:
                    center;

                border:
                    1px solid
                    rgba(
                        246,
                        244,
                        226,
                        0.28
                    );

                border-radius:
                    999px;

                background:
                    rgba(
                        46,
                        72,
                        64,
                        0.46
                    );

                backdrop-filter:
                    blur(10px);

                pointer-events:
                    none;

            }


            #bloomxr-dream-title {

                color:
                    #fff2d7;

                font:
                    600 10px
                    Georgia,
                    serif;

                letter-spacing:
                    0.16em;

            }


            #bloomxr-dream-subtitle {

                margin-top:
                    4px;

                color:
                    #d8e3d8;

                font:
                    11px
                    Arial,
                    sans-serif;

            }

        `;


        document.head.appendChild(
            style
        );

    }


// ============================================================
// UPDATE CHAPTER HUD
// ============================================================

    updateChapterHUD() {

        if (
            !this.hud
        ) {

            return;

        }


        const title =
            this.hud.querySelector(
                '#bloomxr-dream-title'
            );


        const subtitle =
            this.hud.querySelector(
                '#bloomxr-dream-subtitle'
            );


        const names = [

            [
                'DREAMING OF BUTTERFLIES',
                'Tea room • arrival'
            ],

            [
                'TERRACE OF FREE WANDERING',
                'A world that unfolds without force'
            ],

            [
                'ISLE OF COSMIC TURNING',
                'Shift your point of view'
            ],

            [
                'CLIFF OF NO-SELF',
                'Let meaning become movement'
            ],

            [
                'RETURN',
                'The dream leaves something behind'
            ]

        ];


        title.textContent =
            names[
                this.chapter
            ][0];


        subtitle.textContent =
            names[
                this.chapter
            ][1];

    }


// ============================================================
// PULSE
// ============================================================

    pulseGlow(
        object
    ) {

        if (
            !object
        ) {

            return;

        }


        object.scale.multiplyScalar(
            1.16
        );


        setTimeout(
            () => {

                object.scale.multiplyScalar(
                    0.86
                );

            },
            400
        );

    }


// ============================================================
// UPDATE
// ============================================================

    update(
        time,
        delta
    ) {

        this.elapsed =
            time;


        this.storyTimer +=
            delta;


        // ----------------------------------------------------
        // Butterflies
        // ----------------------------------------------------

        this.butterflies.forEach(
            (
                butterfly,
                index
            ) => {

                if (
                    !butterfly.visible
                ) {

                    return;

                }


                const phase =
                    butterfly.userData
                        .phase ||
                    0;


                butterfly.position.y +=

                    Math.sin(
                        time *
                        1.4 +
                        phase
                    ) *
                    delta *
                    0.12;


                butterfly.position.x +=

                    Math.cos(
                        time *
                        0.55 +
                        phase
                    ) *
                    delta *
                    0.09;


                butterfly.position.z +=

                    Math.sin(
                        time *
                        0.5 +
                        phase *
                        0.8
                    ) *
                    delta *
                    0.08;


                const wing =
                    Math.sin(
                        time *
                        9.0 +
                        phase
                    ) *
                    0.58;


                if (
                    butterfly.userData
                        .leftWing
                ) {

                    butterfly.userData
                        .leftWing
                        .rotation.y =
                        wing;

                }


                if (
                    butterfly.userData
                        .rightWing
                ) {

                    butterfly.userData
                        .rightWing
                        .rotation.y =
                        -wing;

                }

            }
        );


        // ----------------------------------------------------
        // Stars
        // ----------------------------------------------------

        if (
            this.stars
        ) {

            this.stars.rotation.y +=
                delta *
                0.004;

        }


        // ----------------------------------------------------
        // Ambient particles
        // ----------------------------------------------------

        if (
            this.ambient
        ) {

            this.ambient.rotation.y +=
                delta *
                0.002;

        }


        // ----------------------------------------------------
        // Lotus platforms
        // ----------------------------------------------------

        this.lotusPlatforms.forEach(
            (
                platform,
                index
            ) => {

                platform.position.y +=

                    Math.sin(
                        time *
                        0.85 +
                        index
                    ) *
                    delta *
                    0.08;

            }
        );


        // ----------------------------------------------------
        // Fish
        // ----------------------------------------------------

        this.goldenFish.forEach(
            (
                fish,
                index
            ) => {

                fish.userData.angle +=
                    delta *
                    0.38;


                const angle =
                    fish.userData.angle;


                const radius =
                    fish.userData.radius;


                fish.position.x =
                    Math.cos(
                        angle
                    ) *
                    radius;


                fish.position.z =
                    1.9 +
                    Math.sin(
                        angle
                    ) *
                    radius *
                    0.65;


                fish.position.y =
                    0.48 +
                    Math.sin(
                        time *
                        1.8 +
                        index
                    ) *
                    0.10;


                fish.rotation.y =
                    -angle +
                    Math.PI /
                    2;

            }
        );


        if (
            this.chapterTransition
        ) {

            this.transitionTimer +=
                delta;

        }

    }


// ============================================================
// DEBUG / PUBLIC API
// ============================================================

    nextChapter() {

        this.activateChapter(

            Math.min(
                this.chapter + 1,
                4
            )

        );

    }


    previousChapter() {

        this.activateChapter(

            Math.max(
                this.chapter - 1,
                0
            )

        );

    }


    restart() {

        this.finishedJourney =
            false;


        this.noSelfFishCount =
            0;


        this.textBlocks.forEach(
            block => {

                block.visible =
                    true;


                block.userData.collected =
                    false;

            }
        );


        this.activateChapter(
            0,
            true
        );

    }


// ============================================================
// DESTROY
// ============================================================

    destroy() {

        this.hud?.remove();


        document.getElementById(
            'bloomxr-dream-hud-style'
        )?.remove();


        if (
            this.group.parent
        ) {

            this.group.parent.remove(
                this.group
            );

        }


        this.group.traverse(
            object => {

                if (
                    object.geometry
                ) {

                    object.geometry.dispose();

                }


                if (
                    object.material
                ) {

                    const materials =
                        Array.isArray(
                            object.material
                        )
                            ? object.material
                            : [
                                object.material
                            ];


                    materials.forEach(
                        material => {

                            if (
                                material.map
                            ) {

                                material.map.dispose();

                            }


                            material.dispose();

                        }
                    );

                }

            }
        );

    }

}


// ============================================================
// FACTORY
// ============================================================

export function createButterflyWorld(

    scene,

    camera = null,

    renderer = null,

    controllers = [],

    options = {}

) {

    const world =
        new DreamingOfButterflies(

            scene,

            camera,

            renderer,

            controllers,

            options

        );


    world.group.userData.update =
        (
            time,
            delta
        ) => {

            world.update(
                time,
                delta
            );

        };


    world.group.userData.butterflyWorld =
        world;


    world.group.userData.nextChapter =
        () =>
            world.nextChapter();


    world.group.userData.previousChapter =
        () =>
            world.previousChapter();


    world.group.userData.restart =
        () =>
            world.restart();


    return world.group;

}