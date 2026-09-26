import * as THREE from 'three';


// ============================================================
// BLOOMXR — LOTUS SANCTUARY BASE WORLD
// ============================================================
//
// This is intentionally the clean foundation:
//
//     • bright sky
//     • flat open land
//     • central circular gallery platform
//     • no rocks
//     • no terrain clutter
//
// More sanctuary elements can be added later without changing
// the gallery system.
// ============================================================


export class World {

    constructor(
        scene
    ) {

        if (
            !scene
        ) {

            throw new Error(
                'World requires a Three.js scene.'
            );

        }


        this.scene =
            scene;


        this.group =
            new THREE.Group();


        this.group.name =
            'LotusSanctuaryWorld';


        // ----------------------------------------------------
        // Important:
        // Clear Dreaming of Butterflies atmosphere when
        // returning to Lotus Sanctuary.
        // ----------------------------------------------------

        this.scene.background =
            new THREE.Color(
                0x9dd8eb
            );


        this.scene.fog =
            null;


        // ----------------------------------------------------
        // Gallery anchor
        // ----------------------------------------------------

        this.galleryAnchor =
            new THREE.Vector3(
                0,
                0,
                0
            );


        this.group.userData.galleryAnchor =
            this.galleryAnchor;


        // ----------------------------------------------------
        // Build
        // ----------------------------------------------------

        this.createSky();

        this.createLighting();

        this.createLand();

        this.createCentralPlatform();


        // ----------------------------------------------------
        // Add
        // ----------------------------------------------------

        this.scene.add(
            this.group
        );

    }


// ============================================================
// SKY
// ============================================================

    createSky() {

        const skyGeometry =
            new THREE.SphereGeometry(
                180,
                48,
                32
            );


        const skyMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0x9dd8eb,

                side:
                    THREE.BackSide

            });


        const sky =
            new THREE.Mesh(
                skyGeometry,
                skyMaterial
            );


        sky.name =
            'BrightSky';


        this.group.add(
            sky
        );

    }


// ============================================================
// LIGHTING
// ============================================================

    createLighting() {

        const hemisphere =
            new THREE.HemisphereLight(

                0xf0fbff,

                0x6e8368,

                2.1

            );


        hemisphere.name =
            'SanctuaryHemisphereLight';


        this.group.add(
            hemisphere
        );


        const sunlight =
            new THREE.DirectionalLight(

                0xfff0d2,

                2.35

            );


        sunlight.name =
            'SanctuarySun';


        sunlight.position.set(
            35,
            55,
            25
        );


        sunlight.castShadow =
            true;


        sunlight.shadow.mapSize.width =
            2048;


        sunlight.shadow.mapSize.height =
            2048;


        sunlight.shadow.camera.left =
            -70;


        sunlight.shadow.camera.right =
            70;


        sunlight.shadow.camera.top =
            70;


        sunlight.shadow.camera.bottom =
            -70;


        this.group.add(
            sunlight
        );

    }


// ============================================================
// LAND
// ============================================================

    createLand() {

        const geometry =
            new THREE.PlaneGeometry(
                180,
                180
            );


        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0x83aa7c,

                roughness:
                    0.97,

                metalness:
                    0

            });


        const land =
            new THREE.Mesh(
                geometry,
                material
            );


        land.name =
            'SanctuaryFlatLand';


        land.rotation.x =
            -Math.PI /
            2;


        land.position.y =
            -0.08;


        land.receiveShadow =
            true;


        this.group.add(
            land
        );


        this.land =
            land;

    }


// ============================================================
// CENTRAL PLATFORM
// ============================================================

    createCentralPlatform() {

        /*
         * Large enough that the gallery is completely separated
         * from the surrounding land.
         */

        const base =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    19.5,
                    20.0,
                    0.55,
                    96
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x6d8172,

                    roughness:
                        0.90,

                    metalness:
                        0.02

                })

            );


        base.name =
            'GalleryPlatformBase';


        base.position.y =
            0.20;


        base.castShadow =
            true;


        base.receiveShadow =
            true;


        this.group.add(
            base
        );


        const top =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    19.15,
                    19.15,
                    0.12,
                    96
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xa9b6a1,

                    roughness:
                        0.90

                })

            );


        top.name =
            'GalleryPlatformTop';


        top.position.y =
            0.51;


        top.receiveShadow =
            true;


        this.group.add(
            top
        );


        const outerRing =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    18.65,
                    0.12,
                    16,
                    128
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xd7c48b,

                    roughness:
                        0.42,

                    metalness:
                        0.30

                })

            );


        outerRing.rotation.x =
            Math.PI /
            2;


        outerRing.position.y =
            0.60;


        this.group.add(
            outerRing
        );


        const innerRing =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    6.9,
                    0.06,
                    12,
                    96
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0xd0d8c4,

                    roughness:
                        0.57,

                    metalness:
                        0.04

                })

            );


        innerRing.rotation.x =
            Math.PI /
            2;


        innerRing.position.y =
            0.60;


        this.group.add(
            innerRing
        );

    }


// ============================================================
// UPDATE
// ============================================================

    update(
        time,
        delta
    ) {

        /*
         * Reserved for future Lotus Sanctuary animation.
         */

    }


// ============================================================
// DESTROY
// ============================================================

    destroy() {

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
                        material =>
                            material.dispose()
                    );

                }

            }
        );

    }

}