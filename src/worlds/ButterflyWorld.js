import * as THREE from 'three';

export function createButterflyWorld(scene) {
    const worldGroup = new THREE.Group();

    // 1. Atmospheric Background / Mist Fog
    scene.background = new THREE.Color(0xe6e2dd); // Soft ink-wash paper tint
    scene.fog = new THREE.FogExp2(0xe6e2dd, 0.015);

    // 2. Lighting (Soft, painterly ambient light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    worldGroup.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
    dirLight.position.set(10, 20, 10);
    worldGroup.add(dirLight);

    // 3. Stylized Ink-Wash Floating Island (Low-poly jagged stone)
    const islandGeo = new THREE.IcosahedronGeometry(4, 1);
    // Displace vertices slightly to make it look organic/rocky
    const positionAttribute = islandGeo.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        vertex.x += (Math.random() - 0.5) * 0.8;
        vertex.y += (Math.random() - 0.5) * 0.5;
        vertex.z += (Math.random() - 0.5) * 0.8;
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    islandGeo.computeVertexNormals();

    const islandMat = new THREE.MeshStandardMaterial({
        color: 0x4a5d4e, // Muted mossy green-gray ink tone
        roughness: 0.9,
        flatShading: true
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(0, -2, -4);
    worldGroup.add(island);

    // 4. Tea Table (Procedural cylinder and top)
    const tableGroup = new THREE.Group();
    
    const tableTopGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7 });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 0.5, -2.5);
    tableGroup.add(tableTop);

    const tableLegGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16);
    const tableLeg = new THREE.Mesh(tableLegGeo, tableMat);
    tableLeg.position.set(0, -0.1, -2.5);
    tableGroup.add(tableLeg);

    worldGroup.add(tableGroup);

    // 5. Abstract Floating Interactive Element (The "Ink Sphere / Bubble")
    const sphereGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0xffeb3b, // Golden yellow ink drop cue from reference
        transmission: 0.6,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
        ior: 1.2
    });
    const inkSphere = new THREE.Mesh(sphereGeo, sphereMat);
    inkSphere.position.set(0, 1.2, -2.5);
    worldGroup.add(inkSphere);

    // Animation hook for floating motion
    worldGroup.userData = {
        update: (time) => {
            inkSphere.position.y = 1.2 + Math.sin(time * 2) * 0.1; // Gentle bobbing
        }
    };

    scene.add(worldGroup);
    return worldGroup;
}