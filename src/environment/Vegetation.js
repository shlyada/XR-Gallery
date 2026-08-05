import * as THREE from "three";

export class Vegetation {

    constructor() {

        this.group = new THREE.Group();

        this.createTrees();
        this.createGrass();
        this.createFlowers();
        this.createMushrooms();
        this.createRocks();

    }


    getRandomIslandPosition(minRadius = 0.2, maxRadius = 2.9) {

        const angle =
            Math.random() * Math.PI * 2;

        // sqrt gives better distribution across the whole circle
        const radius =
            Math.sqrt(Math.random()) *
            (maxRadius - minRadius) +
            minRadius;

        return {

            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius

        };

    }


    createTrees() {

        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x6b4423,
            roughness: 1
        });

        const leavesMaterial = new THREE.MeshStandardMaterial({
            color: 0x2e8b57,
            roughness: 1
        });


        for (let i = 0; i < 8; i++) {

            const position =
                this.getRandomIslandPosition(1, 2.5);


            const tree = new THREE.Group();


            const trunk = new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.08,
                    0.12,
                    0.7,
                    8
                ),

                trunkMaterial

            );

            trunk.position.y = 0.35;


            const leaves = new THREE.Mesh(

                new THREE.ConeGeometry(
                    0.45,
                    1,
                    8
                ),

                leavesMaterial

            );

            leaves.position.y = 1;


            tree.add(trunk);
            tree.add(leaves);


            tree.position.set(
                position.x,
                0.55,
                position.z
            );


            tree.rotation.y =
                Math.random() * Math.PI * 2;


            tree.scale.setScalar(
                0.8 + Math.random() * 0.5
            );


            this.group.add(tree);

        }

    }


    createGrass() {

        const grassMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x7CFC00,
                roughness: 1,
                side: THREE.DoubleSide

            });


        for (let i = 0; i < 350; i++) {

            const position =
                this.getRandomIslandPosition(
                    0.1,
                    3
                );


            const blade = new THREE.Mesh(

                new THREE.PlaneGeometry(
                    0.05,
                    0.2
                ),

                grassMaterial

            );


            blade.position.set(

                position.x,
                0.43,
                position.z

            );


            blade.rotation.y =
                Math.random() * Math.PI;


            blade.rotation.z =
                (Math.random() - 0.5) * 0.5;


            this.group.add(blade);

        }

    }


    createFlowers() {

        const flowerColors = [

            0xffffff,
            0xff69b4,
            0xffd700,
            0x87cefa,
            0xba55d3

        ];


        for (let i = 0; i < 90; i++) {

            const position =
                this.getRandomIslandPosition(
                    0.2,
                    2.9
                );


            const flower = new THREE.Group();


            const stem =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.01,
                        0.01,
                        0.18,
                        6
                    ),

                    new THREE.MeshStandardMaterial({
                        color: 0x2f8f2f
                    })

                );


            stem.position.y = 0.09;


            const blossom =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.05,
                        8,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            flowerColors[
                                Math.floor(
                                    Math.random() *
                                    flowerColors.length
                                )
                            ]

                    })

                );


            blossom.position.y = 0.2;


            flower.add(stem);
            flower.add(blossom);


            flower.position.set(

                position.x,
                0.43,
                position.z

            );


            this.group.add(flower);

        }

    }


    createMushrooms() {

        const capColors = [

            0xff3b30,
            0xff6347,
            0xffffff,
            0xffd700

        ];


        for (let i = 0; i < 45; i++) {

            const position =
                this.getRandomIslandPosition(
                    0.2,
                    2.8
                );


            const mushroom = new THREE.Group();


            const stem =
                new THREE.Mesh(

                    new THREE.CylinderGeometry(
                        0.025,
                        0.035,
                        0.15,
                        8
                    ),

                    new THREE.MeshStandardMaterial({

                        color: 0xf5deb3

                    })

                );


            stem.position.y = 0.075;


            const cap =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.08,
                        10,
                        8,
                        0,
                        Math.PI * 2,
                        0,
                        Math.PI / 2
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            capColors[
                                Math.floor(
                                    Math.random() *
                                    capColors.length
                                )
                            ]

                    })

                );


            cap.position.y = 0.16;


            mushroom.add(stem);
            mushroom.add(cap);


            mushroom.position.set(

                position.x,
                0.43,
                position.z

            );


            this.group.add(mushroom);

        }

    }


    createRocks() {

        const rockMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x777777,
                roughness: 1,
                flatShading: true

            });


        for (let i = 0; i < 50; i++) {

            const position =
                this.getRandomIslandPosition(
                    0.3,
                    3
                );


            const rock =
                new THREE.Mesh(

                    new THREE.DodecahedronGeometry(
                        0.08 +
                        Math.random() * 0.18
                    ),

                    rockMaterial

                );


            rock.position.set(

                position.x,
                0.45,
                position.z

            );


            rock.rotation.set(

                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI

            );


            this.group.add(rock);

        }

    }

}