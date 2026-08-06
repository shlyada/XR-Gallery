import * as THREE from 'three';

export class LotusSanctuary {
    constructor(scene, environmentLoader) {
        this.scene = scene;
        this.loader = environmentLoader;

        this.sanctuaryGroup = new THREE.Group();
        this.scene.add(this.sanctuaryGroup);

        this.terrainSize = 140;
        this.terrainSegments = 128;
        this.pondRadius = 16;

        this.assets = {
            heroTree: null,
            forestPack: null,
            lotus: null,
            butterfly: null
        };
    }

    async init() {
        // Linear Fog with explicit near/far range (prevents full whiteout)
        const skyColor = 0xb2d3dd;
        this.scene.background = new THREE.Color(skyColor);
        this.scene.fog = new THREE.Fog(skyColor, 20, 110);

        // Build core ground geometry first
        this.createTerrain();
        this.createPondWater();

        // Safely load GLTF models without throwing unhandled exceptions
        await this.loadAssetsSafely();

        // Populate assets
        this.populateVegetation();
        this.populateLotusPond();
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize,
            this.terrainSize,
            this.terrainSegments,
            this.terrainSegments
        );
        geometry.rotateX(-Math.PI / 2);

        const pos = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < pos.count; i++) {
            vertex.fromBufferAttribute(pos, i);
            const dist = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);

            let elevation = 0;
            if (dist < this.pondRadius) {
                // Smooth basin depression for water
                const norm = dist / this.pondRadius;
                elevation = -2.2 * (1 - Math.pow(norm, 2));
            } else {
                const s1 = 0.04;
                const s2 = 0.1;
                const noise = Math.sin(vertex.x * s1) * Math.cos(vertex.z * s1) * 3.0 +
                              Math.sin(vertex.x * s2 + 1.2) * Math.cos(vertex.z * s2 + 0.5) * 1.0;
                
                const rim = Math.pow((dist - this.pondRadius) / 25, 1.3) * 0.4;
                elevation = noise + rim - 0.2;
            }

            pos.setY(i, elevation);
        }

        geometry.computeVertexNormals();

        const terrainMat = new THREE.MeshStandardMaterial({
            color: 0x38522b,
            roughness: 0.9,
            metalness: 0.1
        });

        this.terrainMesh = new THREE.Mesh(geometry, terrainMat);
        this.terrainMesh.receiveShadow = true;
        this.terrainMesh.castShadow = true;
        this.sanctuaryGroup.add(this.terrainMesh);
    }

    createPondWater() {
        const waterGeo = new THREE.CircleGeometry(this.pondRadius * 0.98, 64);
        waterGeo.rotateX(-Math.PI / 2);

        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x1f4e52,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8
        });

        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.set(0, -0.3, 0);
        this.sanctuaryGroup.add(water);
    }

    async loadAssetsSafely() {
        const load = async (path) => {
            try {
                return await this.loader.loadModel(path);
            } catch (err) {
                console.warn(`Failed to load asset at ${path}:`, err);
                return null;
            }
        };

        this.assets.heroTree = await load('models/vegetation/treeGN.glb');
        this.assets.forestPack = await load('models/vegetation/forestPack.glb');
        this.assets.lotus = await load('models/flowers/lotus.glb');
        this.assets.butterfly = await load('models/creatures/butterfly.glb');
    }

    getTerrainHeightAt(x, z) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist < this.pondRadius) {
            const norm = dist / this.pondRadius;
            return -2.2 * (1 - Math.pow(norm, 2));
        }
        const s1 = 0.04;
        const s2 = 0.1;
        const noise = Math.sin(x * s1) * Math.cos(z * s1) * 3.0 +
                      Math.sin(x * s2 + 1.2) * Math.cos(z * s2 + 0.5) * 1.0;
        const rim = Math.pow((dist - this.pondRadius) / 25, 1.3) * 0.4;
        return noise + rim - 0.2;
    }

    populateVegetation() {
        // 1. Hero Tree
        if (this.assets.heroTree) {
            const heroInstance = this.assets.heroTree.clone(true);
            const hX = 5, hZ = 4;
            heroInstance.position.set(hX, this.getTerrainHeightAt(hX, hZ) - 0.2, hZ);
            heroInstance.scale.set(1.1, 1.1, 1.1);
            
            this.sanitizeAndEnableShadows(heroInstance);
            this.sanctuaryGroup.add(heroInstance);
        }

        // 2. Background Forest
        if (this.assets.forestPack) {
            const treeCount = 70;
            const innerRadius = this.pondRadius + 3;
            const outerRadius = (this.terrainSize / 2) - 8;

            for (let i = 0; i < treeCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = innerRadius + Math.sqrt(Math.random()) * (outerRadius - innerRadius);

                const x = Math.cos(angle) * dist;
                const z = Math.sin(angle) * dist;
                const y = this.getTerrainHeightAt(x, z);

                const tree = this.assets.forestPack.clone(true);
                tree.position.set(x, y - 0.1, z);

                const s = 0.7 + Math.random() * 0.5;
                tree.scale.set(s, s, s);
                tree.rotation.y = Math.random() * Math.PI * 2;

                this.sanitizeAndEnableShadows(tree);
                this.sanctuaryGroup.add(tree);
            }
        }
    }

    populateLotusPond() {
        if (!this.assets.lotus) return;

        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * (this.pondRadius * 0.75);

            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            const lotus = this.assets.lotus.clone(true);
            lotus.position.set(x, -0.28, z);
            
            const s = 0.35 + Math.random() * 0.3;
            lotus.scale.set(s, s, s);
            lotus.rotation.y = Math.random() * Math.PI * 2;

            this.sanitizeAndEnableShadows(lotus);
            this.sanctuaryGroup.add(lotus);
        }
    }

    sanitizeAndEnableShadows(obj) {
        if (!obj) return;
        obj.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    if (child.material.metalness > 0.5) {
                        child.material.metalness = 0.1;
                    }
                    child.material.needsUpdate = true;
                }
            }
        });
    }

    update(delta) {}
}