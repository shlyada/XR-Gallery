import * as THREE from 'three';

export function createButterflyWorld(scene) {
    const worldGroup = new THREE.Group();

    // 1. Rich Smoky Ink-Wash & Watercolor Atmosphere (Cream, Brown, and Warm Beige Gradients)
    scene.background = new THREE.Color(0xd9d2c5);
    scene.fog = new THREE.FogExp2(0xd9d2c5, 0.0032);

    // 2. Soft, Diffused Warm Watercolor Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    worldGroup.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffecd0, 1.6);
    mainLight.position.set(25, 50, 30);
    worldGroup.add(mainLight);

    const subLight = new THREE.DirectionalLight(0xcfd7d0, 0.7);
    subLight.position.set(-25, 20, -25);
    worldGroup.add(subLight);

    // 3. Detailed Organic Island Platform Foundation
    const slabGeo = new THREE.CylinderGeometry(4.8, 5.2, 0.45, 24);
    const slabMat = new THREE.MeshStandardMaterial({
        color: 0x475449,
        roughness: 0.95,
        flatShading: true
    });
    const stoneSlab = new THREE.Mesh(slabGeo, slabMat);
    stoneSlab.position.set(0, -0.22, 0);
    worldGroup.add(stoneSlab);

    // Sub-island soil layer for natural depth
    const soilGeo = new THREE.CylinderGeometry(4.9, 4.8, 0.25, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x333b35, roughness: 1.0 });
    const soilLayer = new THREE.Mesh(soilGeo, soilMat);
    soilLayer.position.set(0, -0.4, 0);
    worldGroup.add(soilLayer);

    // 4. Detailed Low-Profile Oriental Tea Table & Complete Tea Set
    const teaTableGroup = new THREE.Group();
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x2e1f13,
        roughness: 0.6,
        metalness: 0.05
    });

    const tableTopGeo = new THREE.BoxGeometry(2.5, 0.09, 1.7);
    const tableTop = new THREE.Mesh(tableTopGeo, woodMaterial);
    tableTop.position.set(0, 0.25, 0);
    teaTableGroup.add(tableTop);

    // Bamboo/Inlay runner on table center
    const inlayGeo = new THREE.PlaneGeometry(1.9, 1.1);
    const inlayMat = new THREE.MeshStandardMaterial({ color: 0x18100a, roughness: 0.85 });
    const inlay = new THREE.Mesh(inlayGeo, inlayMat);
    inlay.rotation.x = -Math.PI / 2;
    inlay.position.set(0, 0.296, 0);
    teaTableGroup.add(inlay);

    // Tapered wooden table legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.42, 16);
    for (let x of [-1.05, 1.05]) {
        for (let z of [-0.65, 0.65]) {
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            leg.position.set(x, 0.04, z);
            teaTableGroup.add(leg);
        }
    }

    // --- Tea Ware Set (Stoneware Pot, Cups, and Water Bowl) ---
    const ceramicMat = new THREE.MeshStandardMaterial({
        color: 0xe8e2d8,
        roughness: 0.3,
        metalness: 0.05
    });

    const potBody = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 24), ceramicMat);
    potBody.scale.set(1, 0.82, 1);
    potBody.position.set(-0.45, 0.41, 0);
    teaTableGroup.add(potBody);

    const potLid = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.035, 16), ceramicMat);
    potLid.position.set(-0.45, 0.57, 0);
    teaTableGroup.add(potLid);

    const potHandle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 24, Math.PI), ceramicMat);
    potHandle.rotation.z = Math.PI / 2;
    potHandle.position.set(-0.6, 0.45, 0);
    teaTableGroup.add(potHandle);

    const cupGeo = new THREE.CylinderGeometry(0.052, 0.038, 0.082, 16);
    const cupPositions = [
        { x: 0.25, z: -0.28 },
        { x: 0.25, z: 0.28 },
        { x: 0.55, z: 0.0 }
    ];
    cupPositions.forEach(pos => {
        const cup = new THREE.Mesh(cupGeo, ceramicMat);
        cup.position.set(pos.x, 0.37, pos.z);
        teaTableGroup.add(cup);
    });

    // Miniature Table Bonsai Tree
    const bonsaiGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1f1610, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x436152, roughness: 0.85, flatShading: true });

    const bonsaiPot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.11, 16), ceramicMat);
    bonsaiPot.position.set(-0.05, 0.35, -0.45);
    bonsaiGroup.add(bonsaiPot);

    const bonsaiTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 0.32, 8), trunkMat);
    bonsaiTrunk.position.set(-0.05, 0.51, -0.45);
    bonsaiTrunk.rotation.z = 0.18;
    bonsaiGroup.add(bonsaiTrunk);

    for (let c = 0; c < 4; c++) {
        const leafCluster = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.06, 1), foliageMat);
        leafCluster.position.set(
            -0.05 + (c === 1 ? -0.12 : c === 2 ? 0.12 : 0),
            0.7 + c * 0.07,
            -0.45 + (c === 3 ? 0.08 : -0.04)
        );
        bonsaiGroup.add(leafCluster);
    }
    teaTableGroup.add(bonsaiGroup);
    worldGroup.add(teaTableGroup);

    // 5. Natural Scenery: Weathered Rock Formations & Multi-layered Forest Trees
    const naturalSceneryGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x364743, roughness: 0.95, flatShading: true });
    
    // Asymmetrical weathered cliff clusters
    const cliffGroup = new THREE.Group();
    for (let r = 0; r < 5; r++) {
        const rockChunk = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3 + r * 0.35, 1), rockMat);
        rockChunk.position.set(r * 0.35 - 0.2, r * 1.1, -r * 0.45);
        rockChunk.rotation.set(r * 0.15, r * 0.4, r * 0.08);
        cliffGroup.add(rockChunk);
    }
    cliffGroup.position.set(3.8, 0, -2.2);
    naturalSceneryGroup.add(cliffGroup);

    // Organic forest trees surrounding the perimeter
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x221812, roughness: 0.9 });
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + 0.4;
        const dist = 4.3;
        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 3.8, 8), treeTrunkMat);
        trunk.position.y = 1.6;
        trunk.rotation.z = (Math.random() - 0.5) * 0.22;
        tree.add(trunk);

        for (let b = 0; b < 5; b++) {
            const canopyPiece = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1 + Math.random() * 0.4, 1), foliageMat);
            canopyPiece.position.set((Math.random() - 0.5) * 0.7, 2.9 + b * 0.45, (Math.random() - 0.5) * 0.7);
            tree.add(canopyPiece);
        }

        tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        naturalSceneryGroup.add(tree);
    }
    worldGroup.add(naturalSceneryGroup);

    // 6. Detailed Ground Wildflowers (Pink, Yellow, and Soft White Clusters)
    const flowerGroup = new THREE.Group();
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4f6b57, roughness: 0.7 });
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffccd5, roughness: 0.4, side: THREE.DoubleSide });
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffea75, roughness: 0.4, side: THREE.DoubleSide });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, side: THREE.DoubleSide });

    for (let i = 0; i < 24; i++) {
        const angle = -1.5 + (i / 23) * 3.0;
        const dist = 2.4 + Math.random() * 0.6;
        const flowerCluster = new THREE.Group();

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.018, 0.85, 8), stemMat);
        stem.position.y = 0.42;
        stem.rotation.z = (Math.random() - 0.5) * 0.3;
        flowerCluster.add(stem);

        const mats = [pinkMat, yellowMat, whiteMat];
        const chosenMat = mats[i % mats.length];
        const bloomGroup = new THREE.Group();
        
        for (let p = 0; p < 5; p++) {
            const petal = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), chosenMat);
            petal.scale.set(1, 0.28, 1.35);
            const pAngle = (p / 5) * Math.PI * 2;
            petal.position.set(Math.cos(pAngle) * 0.075, 0.84, Math.sin(pAngle) * 0.075);
            petal.rotation.y = -pAngle;
            petal.rotation.x = 0.28;
            bloomGroup.add(petal);
        }

        flowerCluster.add(bloomGroup);
        flowerCluster.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        flowerGroup.add(flowerCluster);
    }
    worldGroup.add(flowerGroup);

    // 7. EXPANDED: Large Floating Lotus Platforms & Hanging Root Systems
    const floatingLotusGroup = new THREE.Group();
    const lotusPetalOuter = new THREE.MeshStandardMaterial({ color: 0x5a7ca8, roughness: 0.5, side: THREE.DoubleSide });
    const lotusPetalInner = new THREE.MeshStandardMaterial({ color: 0x82c5be, roughness: 0.4, side: THREE.DoubleSide });
    const rootSystemMat = new THREE.MeshStandardMaterial({ color: 0xc4bcb0, roughness: 0.85 });

    // Multiple large floating lotuses drifting across the sky view
    const lotusPositions = [
        { x: -7.5, y: 4.2, z: -5.0, scale: 1.4 },
        { x: 5.5, y: 3.8, z: -6.5, scale: 1.6 },
        { x: -3.5, y: 5.8, z: -8.5, scale: 1.2 },
        { x: 7.2, y: 6.2, z: 3.0, scale: 1.5 }
    ];

    lotusPositions.forEach((pos, idx) => {
        const lotusIsland = new THREE.Group();
        const lotusBase = new THREE.Group();

        // Multi-layered petals forming the floating lotus platform
        for (let layer = 0; layer < 2; layer++) {
            const petalCount = 10 + layer * 4;
            for (let p = 0; p < petalCount; p++) {
                const petalGeo = new THREE.ConeGeometry(0.5 + layer * 0.2, 0.22, 5);
                const pMat = (p + layer) % 2 === 0 ? lotusPetalOuter : lotusPetalInner;
                const petal = new THREE.Mesh(petalGeo, pMat);
                const pAngle = (p / petalCount) * Math.PI * 2;
                const radiusOffset = 0.35 + layer * 0.3;
                petal.position.set(Math.cos(pAngle) * radiusOffset, layer * 0.1, Math.sin(pAngle) * radiusOffset);
                petal.rotation.y = -pAngle;
                petal.rotation.x = 0.38 - layer * 0.08;
                lotusBase.add(petal);
            }
        }
        lotusIsland.add(lotusBase);

        // Intricate hanging root fibers underneath the lotus platform
        for (let rt = 0; rt < 10; rt++) {
            const rootLen = 2.5 + Math.random() * 1.8;
            const root = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.004, rootLen, 5), rootSystemMat);
            const rAngle = (rt / 10) * Math.PI * 2;
            root.position.set(Math.cos(rAngle) * 0.4, -rootLen / 2 - 0.1, Math.sin(rAngle) * 0.4);
            root.rotation.z = (Math.random() - 0.5) * 0.25;
            lotusIsland.add(root);
        }

        lotusIsland.position.set(pos.x, pos.y, pos.z);
        lotusIsland.scale.set(pos.scale, pos.scale, pos.scale);
        floatingLotusGroup.add(lotusIsland);
    });
    worldGroup.add(floatingLotusGroup);

    // 8. EXPANDED: Floating Rock Islands Covered in Purple and Pink Flowers
    const floralIsletsGroup = new THREE.Group();
    const purpleBlossomMat = new THREE.MeshStandardMaterial({ color: 0x7b52ed, roughness: 0.5, flatShading: true });
    const brightPinkMat = new THREE.MeshStandardMaterial({ color: 0xff5ca1, roughness: 0.4, flatShading: true });
    const stemFloraMat = new THREE.MeshStandardMaterial({ color: 0x4a6352, roughness: 0.8 });

    const isletPositions = [
        { x: 3.2, y: 4.8, z: -4.5 },
        { x: -5.8, y: 5.2, z: -4.0 },
        { x: 1.5, y: 7.2, z: -8.0 }
    ];

    isletPositions.forEach((pos, idx) => {
        const islet = new THREE.Group();

        // Irregular rocky base hanging in space
        const rockIsletGeo = new THREE.DodecahedronGeometry(1.0, 1);
        const rockIslet = new THREE.Mesh(rockIsletGeo, rockMat);
        rockIslet.scale.set(1.2, 0.7, 1.2);
        islet.add(rockIslet);

        // Hanging soil/roots underneath the rock
        for (let r = 0; r < 6; r++) {
            const hangingRoot = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.003, 1.8, 5), rootSystemMat);
            const rAng = (r / 6) * Math.PI * 2;
            hangingRoot.position.set(Math.cos(rAng) * 0.4, -0.9, Math.sin(rAng) * 0.4);
            hangingRoot.rotation.z = (Math.random() - 0.5) * 0.3;
            islet.add(hangingRoot);
        }

        // Dense clusters of purple and pink flowers covering the top of the island
        for (let f = 0; f < 14; f++) {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.015, 0.6 + Math.random() * 0.5, 6), stemFloraMat);
            const fAngle = Math.random() * Math.PI * 2;
            const fDist = Math.random() * 0.6;
            stem.position.set(Math.cos(fAngle) * fDist, 0.5 + Math.random() * 0.2, Math.sin(fAngle) * fDist);
            islet.add(stem);

            const clusterMat = f % 2 === 0 ? purpleBlossomMat : brightPinkMat;
            const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + Math.random() * 0.1, 1), clusterMat);
            bloom.position.set(stem.position.x, stem.position.y + 0.4, stem.position.z);
            islet.add(bloom);
        }

        islet.position.set(pos.x, pos.y, pos.z);
        floralIsletsGroup.add(islet);
    });
    worldGroup.add(floralIsletsGroup);

    // 9. EXPANDED: Smoky, Cream-Brown Puffy Watercolor Background Clouds (Deep Layering)
    const horizonGroup = new THREE.Group();
    const smokyCloudMats = [
        new THREE.MeshStandardMaterial({ color: 0xede6dc, roughness: 1.0, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0xe3dbcd, roughness: 1.0, flatShading: true }),
        new THREE.MeshStandardMaterial({ color: 0xf5f1eb, roughness: 1.0, flatShading: true })
    ];

    for (let i = 0; i < 22; i++) {
        const cloud = new THREE.Group();
        const puffCount = 5 + Math.floor(Math.random() * 3);
        const mat = smokyCloudMats[i % smokyCloudMats.length];

        for (let b = 0; b < puffCount; b++) {
            const puffGeo = new THREE.DodecahedronGeometry(3.2 + Math.random() * 1.8, 1);
            const puff = new THREE.Mesh(puffGeo, mat);
            puff.position.set(b * 2.4 - (puffCount * 1.2), (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 2.0);
            cloud.add(puff);
        }

        const angle = (i / 22) * Math.PI * 2 + (Math.random() * 0.2);
        const dist = 30 + Math.random() * 18;
        cloud.position.set(Math.cos(angle) * dist, 0.5 + Math.random() * 9, Math.sin(angle) * dist);
        horizonGroup.add(cloud);
    }
    worldGroup.add(horizonGroup);

    // 10. Floating Gentle Animation Hook
    worldGroup.userData = {
        update: (time, delta) => {
            // Subtle floating drift for the sky islands
            floatingLotusGroup.children.forEach((island, index) => {
                island.position.y += Math.sin(time * 0.8 + index) * 0.002;
            });
            floralIsletsGroup.children.forEach((islet, index) => {
                islet.position.y += Math.cos(time * 0.7 + index) * 0.0025;
            });
        }
    };

    scene.add(worldGroup);
    return worldGroup;
}