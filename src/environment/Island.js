import * as THREE from "three";

export class Island {

    constructor() {

        this.group = new THREE.Group();

        this.createIsland();

    }

    createIsland() {

        // ---------- Grass ----------
        const topGeometry = new THREE.CylinderGeometry(
            2,
            2.5,
            0.5,
            64
        );

        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50
        });

        const top = new THREE.Mesh(
            topGeometry,
            topMaterial
        );

        top.position.y = 0.25;


        // ---------- Rock ----------
        const bottomGeometry = new THREE.ConeGeometry(
            2.5,
            2,
            64
        );

        const bottomMaterial = new THREE.MeshStandardMaterial({
            color: 0x777777
        });

        const bottom = new THREE.Mesh(
            bottomGeometry,
            bottomMaterial
        );

        bottom.position.y = -1;


        this.group.add(top);
        this.group.add(bottom);

        // Float slightly above origin
        this.group.position.set(
            0,
            0,
            0
        );

    }

}