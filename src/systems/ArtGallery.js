import * as THREE from 'three';


// ============================================================
// BLOOMXR ART GALLERY
// ============================================================

export default class ArtGallery {

    constructor({
        scene,
        camera = null,
        renderer = null,

        galleryCenter =
            new THREE.Vector3(
                0,
                0,
                2.8
            ),

        width = 24,
        depth = 18,
        height = 5.5

    } = {}) {

        if (!scene) {

            throw new Error(
                'ArtGallery requires a scene.'
            );

        }


        this.scene =
            scene;

        this.camera =
            camera;

        this.renderer =
            renderer;


        this.width =
            width;

        this.depth =
            depth;

        this.height =
            height;


        this.defaultPosition =
            galleryCenter.clone();


        this.group =
            new THREE.Group();

        this.group.name =
            'BloomXR_SanctuaryGallery';


        this.artworkGroup =
            new THREE.Group();

        this.artworkGroup.name =
            'GalleryArtworks';


        this.environmentGroup =
            new THREE.Group();

        this.environmentGroup.name =
            'GalleryEnvironment';


        this.lightGroup =
            new THREE.Group();

        this.lightGroup.name =
            'GalleryLights';


        this.group.add(
            this.environmentGroup
        );

        this.group.add(
            this.artworkGroup
        );

        this.group.add(
            this.lightGroup
        );


        this.scene.add(
            this.group
        );


        this.textureLoader =
            new THREE.TextureLoader();


        this.artworks = [];

        this.artworkCounter =
            1;


        /*
         * ----------------------------------------------------
         * STARTER ARTWORK
         * ----------------------------------------------------
         *
         * Your files are JPGs.
         */

        this.defaultArt = [

            {
                id:
                    'sanctuary-1',

                title:
                    'Quiet Growth',

                artist:
                    'BloomXR Collection',

                image:
                    '/art/artwork1.jpg'

            },

            {
                id:
                    'sanctuary-2',

                title:
                    'Between Worlds',

                artist:
                    'BloomXR Collection',

                image:
                    '/art/artwork2.jpg'

            },

            {
                id:
                    'sanctuary-3',

                title:
                    'Becoming',

                artist:
                    'BloomXR Collection',

                image:
                    '/art/artwork3.jpg'

            }

        ];


        this.createGallery();

        this.loadInitialArtwork();

    }


// ============================================================
// GALLERY CONSTRUCTION
// ============================================================

    createGallery() {

        this.createFloor();

        this.createWalls();

        this.createEntrance();

        this.createPedestals();

        this.createPlants();

        this.createLighting();

        this.createFloatingParticles();

        this.createTitle();

    }


// ============================================================
// FLOOR
// ============================================================

    createFloor() {

        const floor =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    this.width * 0.62,
                    this.width * 0.66,
                    0.3,
                    64
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x293529,

                    roughness:
                        0.82,

                    metalness:
                        0.03

                })

            );


        floor.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y -
                0.15,
            this.defaultPosition.z
        );


        floor.receiveShadow =
            true;


        this.environmentGroup.add(
            floor
        );


        const ring =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    this.width * 0.49,
                    0.055,
                    14,
                    96
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xa7bfa9,

                    emissive:
                        0x20372a,

                    emissiveIntensity:
                        0.45

                })

            );


        ring.rotation.x =
            Math.PI / 2;


        ring.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y +
                0.02,
            this.defaultPosition.z
        );


        this.environmentGroup.add(
            ring
        );

    }


// ============================================================
// WALLS
// ============================================================

    createWalls() {

        const wallMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x17241c,

                roughness:
                    0.86

            });


        const backWall =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    this.width * 0.68,
                    this.height,
                    0.38
                ),

                wallMaterial

            );


        backWall.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y +
                this.height / 2,
            this.defaultPosition.z -
                this.depth * 0.32
        );


        backWall.castShadow =
            true;

        backWall.receiveShadow =
            true;


        this.environmentGroup.add(
            backWall
        );


        const wingGeometry =
            new THREE.BoxGeometry(
                0.42,
                this.height,
                this.depth * 0.52
            );


        const leftWing =
            new THREE.Mesh(
                wingGeometry,
                wallMaterial
            );


        leftWing.position.set(
            this.defaultPosition.x -
                this.width * 0.34,
            this.defaultPosition.y +
                this.height / 2,
            this.defaultPosition.z
        );


        const rightWing =
            new THREE.Mesh(
                wingGeometry,
                wallMaterial
            );


        rightWing.position.set(
            this.defaultPosition.x +
                this.width * 0.34,
            this.defaultPosition.y +
                this.height / 2,
            this.defaultPosition.z
        );


        this.environmentGroup.add(
            leftWing
        );

        this.environmentGroup.add(
            rightWing
        );

    }


// ============================================================
// ENTRANCE
// ============================================================

    createEntrance() {

        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0x35513e,

                roughness:
                    0.72

            });


        const geometry =
            new THREE.CylinderGeometry(
                0.22,
                0.29,
                this.height,
                16
            );


        const entranceWidth =
            this.width * 0.24;


        const left =
            new THREE.Mesh(
                geometry,
                material
            );


        left.position.set(
            this.defaultPosition.x -
                entranceWidth,
            this.defaultPosition.y +
                this.height / 2,
            this.defaultPosition.z +
                this.depth * 0.30
        );


        const right =
            new THREE.Mesh(
                geometry,
                material
            );


        right.position.set(
            this.defaultPosition.x +
                entranceWidth,
            this.defaultPosition.y +
                this.height / 2,
            this.defaultPosition.z +
                this.depth * 0.30
        );


        this.environmentGroup.add(
            left
        );

        this.environmentGroup.add(
            right
        );

    }


// ============================================================
// PEDESTALS
// ============================================================

    createPedestals() {

        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0x2a382a,

                roughness:
                    0.72

            });


        const positions = [

            [-5.4, -0.9],

            [5.4, -0.9],

            [-4.5, -3.8],

            [4.5, -3.8]

        ];


        positions.forEach(
            ([x, z]) => {

                const pedestal =
                    new THREE.Mesh(

                        new THREE.CylinderGeometry(
                            0.48,
                            0.58,
                            0.65,
                            24
                        ),

                        material

                    );


                pedestal.position.set(

                    this.defaultPosition.x +
                        x,

                    this.defaultPosition.y +
                        0.325,

                    this.defaultPosition.z +
                        z

                );


                pedestal.castShadow =
                    true;


                this.environmentGroup.add(
                    pedestal
                );

            }
        );

    }


// ============================================================
// PLANTS
// ============================================================

    createPlants() {

        const positions = [

            [-7.1, 2.5],

            [7.1, 2.5],

            [-7.0, -4.7],

            [7.0, -4.7]

        ];


        positions.forEach(
            ([x, z]) => {

                const plant =
                    new THREE.Group();


                const pot =
                    new THREE.Mesh(

                        new THREE.CylinderGeometry(
                            0.27,
                            0.34,
                            0.42,
                            16
                        ),

                        new THREE.MeshStandardMaterial({

                            color:
                                0x3d3027,

                            roughness:
                                0.88

                        })

                    );


                pot.position.y =
                    0.21;


                plant.add(
                    pot
                );


                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    const leaf =
                        new THREE.Mesh(

                            new THREE.SphereGeometry(
                                0.15,
                                9,
                                8
                            ),

                            new THREE.MeshStandardMaterial({

                                color:
                                    i % 2 ===
                                    0
                                        ? 0x628c67
                                        : 0x78a173,

                                roughness:
                                    0.82

                            })

                        );


                    const angle =
                        (
                            i /
                            6
                        ) *
                        Math.PI *
                        2;


                    leaf.position.set(

                        Math.cos(angle) *
                            0.23,

                        0.56 +
                            Math.random() *
                                0.12,

                        Math.sin(angle) *
                            0.23

                    );


                    leaf.scale.set(
                        1,
                        0.48,
                        0.65
                    );


                    plant.add(
                        leaf
                    );

                }


                plant.position.set(

                    this.defaultPosition.x +
                        x,

                    this.defaultPosition.y,

                    this.defaultPosition.z +
                        z

                );


                this.environmentGroup.add(
                    plant
                );

            }
        );

    }


// ============================================================
// LIGHTING
// ============================================================

    createLighting() {

        const ambient =
            new THREE.HemisphereLight(
                0xd5e7d8,
                0x182019,
                0.72
            );


        this.lightGroup.add(
            ambient
        );


        const directional =
            new THREE.DirectionalLight(
                0xffe9c4,
                1.1
            );


        directional.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y +
                9,
            this.defaultPosition.z +
                5
        );


        directional.castShadow =
            true;


        directional.shadow.mapSize.width =
            1024;

        directional.shadow.mapSize.height =
            1024;


        this.lightGroup.add(
            directional
        );


        const positions = [

            [-5.0, -5.0],

            [0, -5.0],

            [5.0, -5.0]

        ];


        positions.forEach(
            ([x, z]) => {

                const light =
                    new THREE.SpotLight(
                        0xffe8b5,
                        2.7,
                        9,
                        Math.PI / 8,
                        0.55,
                        1.4
                    );


                light.position.set(
                    this.defaultPosition.x +
                        x,
                    this.defaultPosition.y +
                        4.7,
                    this.defaultPosition.z +
                        z
                );


                light.target.position.set(
                    this.defaultPosition.x +
                        x,
                    this.defaultPosition.y +
                        2.0,
                    this.defaultPosition.z -
                        4.5
                );


                this.lightGroup.add(
                    light
                );

                this.lightGroup.add(
                    light.target
                );

            }
        );

    }


// ============================================================
// PARTICLES
// ============================================================

    createFloatingParticles() {

        const count =
            160;


        const positions =
            new Float32Array(
                count * 3
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const radius =
                3.5 +
                Math.random() *
                    7;


            const angle =
                Math.random() *
                Math.PI *
                2;


            positions[
                i * 3
            ] =
                this.defaultPosition.x +
                Math.cos(angle) *
                    radius;


            positions[
                i * 3 + 1
            ] =
                this.defaultPosition.y +
                0.4 +
                Math.random() *
                    4.2;


            positions[
                i * 3 + 2
            ] =
                this.defaultPosition.z +
                Math.sin(angle) *
                    radius;

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
                    0xdfe990,

                size:
                    0.045,

                transparent:
                    true,

                opacity:
                    0.5,

                depthWrite:
                    false

            });


        this.particles =
            new THREE.Points(
                geometry,
                material
            );


        this.environmentGroup.add(
            this.particles
        );

    }


// ============================================================
// TITLE
// ============================================================

    createTitle() {

        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width =
            1024;

        canvas.height =
            230;


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';


        ctx.fillStyle =
            '#f1ead8';

        ctx.font =
            '600 70px Georgia, serif';


        ctx.fillText(
            'THE SANCTUARY GALLERY',
            512,
            92
        );


        ctx.fillStyle =
            '#abbda9';

        ctx.font =
            '30px Arial';


        ctx.fillText(
            'Art created within BloomXR',
            512,
            153
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.colorSpace =
            THREE.SRGBColorSpace;


        const title =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    7.2,
                    1.62
                ),

                new THREE.MeshBasicMaterial({

                    map:
                        texture,

                    transparent:
                        true,

                    depthWrite:
                        false

                })

            );


        title.position.set(
            this.defaultPosition.x,
            this.defaultPosition.y +
                this.height -
                0.25,
            this.defaultPosition.z -
                this.depth * 0.31
        );


        this.environmentGroup.add(
            title
        );

    }


// ============================================================
// INITIAL ART
// ============================================================

    async loadInitialArtwork() {

        for (
            const art of
            this.defaultArt
        ) {

            try {

                await this.addArtworkFromImage(
                    {
                        ...art,
                        source:
                            'gallery'
                    }
                );

            }

            catch (
                error
            ) {

                console.warn(
                    `[BloomXR] Could not load artwork ${art.image}.`,
                    error
                );

            }

        }

    }


// ============================================================
// ADD IMAGE ARTWORK
// ============================================================

    async addArtworkFromImage({

        image,

        title =
            'Untitled',

        artist =
            'Anonymous',

        id =
            null,

        source =
            'user'

    }) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                this.textureLoader.load(

                    image,

                    (texture) => {

                        texture.colorSpace =
                            THREE.SRGBColorSpace;


                        const artwork =
                            this.createArtwork(
                                {

                                    texture,

                                    title,

                                    artist,

                                    id:
                                        id ||
                                        `art-${Date.now()}-${this.artworkCounter++}`,

                                    source

                                }
                            );


                        this.artworks.push(
                            artwork
                        );


                        resolve(
                            artwork
                        );

                    },

                    undefined,

                    (error) => {

                        reject(
                            error
                        );

                    }

                );

            }
        );

    }


// ============================================================
// ADD CANVAS ARTWORK
// ============================================================

    async addArtworkFromCanvas({

        canvas,

        title =
            'Untitled',

        artist =
            'You'

    }) {

        if (
            !canvas
        ) {

            throw new Error(
                'Canvas is required.'
            );

        }


        const image =
            canvas instanceof
                HTMLCanvasElement
                ? canvas.toDataURL(
                    'image/png'
                )
                : canvas;


        return this.addArtworkFromImage({

            image,

            title,

            artist,

            source:
                'user'

        });

    }


// ============================================================
// CREATE ARTWORK
// ============================================================

    createArtwork({

        texture,

        title,

        artist,

        id,

        source

    }) {

        const group =
            new THREE.Group();


        group.name =
            `Artwork_${id}`;


        const aspect =
            texture.image &&
            texture.image.width &&
            texture.image.height

                ? texture.image.width /
                    texture.image.height

                : 1.5;


        const maxWidth =
            2.8;

        const maxHeight =
            2.45;


        let width =
            maxWidth;

        let height =
            width /
            aspect;


        if (
            height >
            maxHeight
        ) {

            height =
                maxHeight;

            width =
                height *
                aspect;

        }


        const frameThickness =
            0.14;


        const frame =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    width +
                        frameThickness *
                        2,
                    height +
                        frameThickness *
                        2,
                    0.16
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xb39b63,

                    roughness:
                        0.38,

                    metalness:
                        0.42

                })

            );


        frame.castShadow =
            true;


        group.add(
            frame
        );


        const artwork =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    width,
                    height
                ),

                new THREE.MeshStandardMaterial({

                    map:
                        texture,

                    roughness:
                        0.7,

                    metalness:
                        0.01

                })

            );


        artwork.position.z =
            0.095;


        group.add(
            artwork
        );


        const labelTexture =
            this.createLabelTexture(
                title,
                artist
            );


        const label =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    2.9,
                    0.55
                ),

                new THREE.MeshBasicMaterial({

                    map:
                        labelTexture,

                    transparent:
                        true,

                    depthWrite:
                        false

                })

            );


        label.position.y =
            -(
                height / 2
            ) -
            0.39;


        label.position.z =
            0.02;


        group.add(
            label
        );


        group.userData = {

            artworkId:
                id,

            title,

            artist,

            source

        };


        this.positionArtwork(
            group
        );


        this.artworkGroup.add(
            group
        );


        return group;

    }


// ============================================================
// ARTWORK LAYOUT
// ============================================================

    positionArtwork(
        artwork
    ) {

        const index =
            this.artworks.length;


        const layouts = [

            {
                x: -4.7,
                y: 2.6,
                z: -5.05,
                rotation: 0
            },

            {
                x: 0,
                y: 2.6,
                z: -5.05,
                rotation: 0
            },

            {
                x: 4.7,
                y: 2.6,
                z: -5.05,
                rotation: 0
            },

            {
                x: -8.0,
                y: 2.45,
                z: -2.0,
                rotation:
                    Math.PI / 2
            },

            {
                x: -8.0,
                y: 2.45,
                z: 1.6,
                rotation:
                    Math.PI / 2
            },

            {
                x: 8.0,
                y: 2.45,
                z: 1.6,
                rotation:
                    -Math.PI / 2
            },

            {
                x: 8.0,
                y: 2.45,
                z: -2.0,
                rotation:
                    -Math.PI / 2
            }

        ];


        const layout =
            layouts[
                index %
                layouts.length
            ];


        artwork.position.set(

            this.defaultPosition.x +
                layout.x,

            this.defaultPosition.y +
                layout.y,

            this.defaultPosition.z +
                layout.z

        );


        artwork.rotation.y =
            layout.rotation;

    }


// ============================================================
// LABEL
// ============================================================

    createLabelTexture(
        title,
        artist
    ) {

        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width =
            1024;

        canvas.height =
            220;


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.fillStyle =
            'rgba(12,19,14,0.94)';


        ctx.roundRect(
            20,
            20,
            984,
            180,
            18
        );


        ctx.fill();


        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';


        ctx.fillStyle =
            '#f1ead8';


        ctx.font =
            '600 50px Georgia, serif';


        ctx.fillText(
            title,
            512,
            82
        );


        ctx.fillStyle =
            '#aebdac';


        ctx.font =
            '30px Arial';


        ctx.fillText(
            artist,
            512,
            142
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.colorSpace =
            THREE.SRGBColorSpace;


        return texture;

    }


// ============================================================
// ATTACH TO WORLD
// ============================================================

    attachToWorld(
        worldGroup
    ) {

        /*
         * Intentionally NOT parented to the world.
         *
         * World switching should never destroy artwork.
         */

        this.group.position.set(
            0,
            0.05,
            2.8
        );


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

                this.group.position.copy(
                    anchor
                );

            }

            else if (
                Number.isFinite(
                    anchor.x
                )
            ) {

                this.group.position.set(
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
// GET OBJECT
// ============================================================

    getObject() {

        return this.group;

    }


// ============================================================
// UPDATE
// ============================================================

    update(
        time,
        delta
    ) {

        if (
            this.particles
        ) {

            this.particles.rotation.y +=
                delta *
                0.012;

        }

    }


// ============================================================
// DISPOSE
// ============================================================

    dispose() {

        this.group.traverse(
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


                            material.dispose();

                        }
                    );

                }

            }
        );


        this.scene.remove(
            this.group
        );

    }

}