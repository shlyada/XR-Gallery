import * as THREE from "three";

export class Island {

    constructor() {

        this.group = new THREE.Group();

        this.createTerrain();
        this.createDirtLayer();
        this.createRockBase();
        this.createRocks();

    }

    createTerrain() {

        const geometry = new THREE.CylinderGeometry(
            3.2,
            3.8,
            0.6,
            64
        );

        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {

            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            if (y > 0) {

                const noise =
                    Math.sin(x * 2.5) * 0.08 +
                    Math.cos(z * 2.2) * 0.08 +
                    Math.sin((x + z) * 1.8) * 0.05;

                positions.setY(i, y + noise);

            }

        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({

            color: 0x69b34c,
            roughness: 0.95,
            metalness: 0

        });

        const terrain = new THREE.Mesh(
            geometry,
            material
        );

        terrain.position.y = 0.35;

        this.group.add(terrain);

    }

    createDirtLayer() {

        const geometry = new THREE.CylinderGeometry(
            3.3,
            3.7,
            0.18,
            64
        );

        const material = new THREE.MeshStandardMaterial({

            color: 0x8b5a2b,
            roughness: 1

        });

        const dirt = new THREE.Mesh(
            geometry,
            material
        );

        dirt.position.y = 0.02;

        this.group.add(dirt);

    }

    createRockBase() {

        const geometry = new THREE.ConeGeometry(
            3.6,
            4.2,
            64
        );

        const positions = geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {

            const x = positions.getX(i);
            const z = positions.getZ(i);

            const noise =
                Math.sin(x * 3.2) * 0.15 +
                Math.cos(z * 2.8) * 0.12;

            positions.setX(
                i,
                x + noise * 0.25
            );

            positions.setZ(
                i,
                z + noise * 0.25
            );

        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({

            color: 0x6d6d6d,
            roughness: 1,
            flatShading: true

        });

        const rock = new THREE.Mesh(
            geometry,
            material
        );

        rock.position.y = -2;

        this.group.add(rock);

    }

    createRocks() {

        const material = new THREE.MeshStandardMaterial({

            color: 0x666666,
            roughness: 1,
            flatShading: true

        });

        for (let i = 0; i < 20; i++) {

            const size =
                0.1 + Math.random() * 0.18;

            const rock =
                new THREE.Mesh(

                    new THREE.DodecahedronGeometry(size),

                    material

                );

            const angle =
                Math.random() * Math.PI * 2;

            const radius =
                2.3 + Math.random() * 0.8;

            rock.position.set(

                Math.cos(angle) * radius,

                0.3,

                Math.sin(angle) * radius

            );

            rock.rotation.set(

                Math.random() * Math.PI,

                Math.random() * Math.PI,

                Math.random() * Math.PI

            );

            this.group.add(rock);

        }

        this.group.position.set(
            0,
            2,
            0
        );

    }

    update(elapsedTime) {

        this.group.position.y =
            2 +
            Math.sin(elapsedTime * 0.5) * 0.08;

        this.group.rotation.y += 0.0007;

    }

}