import * as THREE from 'three';

export class LotusSanctuary {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.lotusNodes = [];
    this.butterflies = [];
    this.hummingbirds = [];
    this.fireflyParticles = null;
    this.waterMaterial = null;

    this.initEnvironment();
  }

  initEnvironment() {
    this.setupAtmosphere();
    this.createTerrain();
    this.createDreamWater();
    this.createNaturalRocks(30);
    this.createLushCanopyTrees(80);
    this.createSwayingLotuses(25);
    this.createWildflowerMeadows(250);
    this.createDeepMushroomClusters(80);
    this.createOrganicButterflies(25);
    this.createIridescentHummingbirds(12);
    this.createAbundantGoldenFireflies(350);
  }

  // --- 1. Atmosphere ---
  setupAtmosphere() {
    this.scene.background = new THREE.Color(0x060d1e);
    this.scene.fog = new THREE.FogExp2(0x0a1631, 0.018);

    const mainLight = new THREE.DirectionalLight(0xffedd2, 2.0);
    mainLight.position.set(15, 35, -10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    this.group.add(mainLight);

    const centerWarmth = new THREE.PointLight(0xffa200, 3.5, 50);
    centerWarmth.position.set(0, 3, 0);
    this.group.add(centerWarmth);

    const ambiance = new THREE.HemisphereLight(0x408a63, 0x1a2b47, 1.2);
    this.group.add(ambiance);
  }

  // --- 2. Terrain ---
  createTerrain() {
    const size = 130;
    const segments = 128;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);

      let y = 0;
      if (dist < 18) {
        y = -2.0 * Math.pow(Math.cos((dist / 18) * (Math.PI / 2)), 1.4);
      } else {
        y = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 1.5 + 
            Math.sin(x * 0.02 + z * 0.01) * 3.5;
      }
      pos.setY(i, y);
    }

    geometry.computeVertexNormals();

    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x163628,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true
    });

    const terrain = new THREE.Mesh(geometry, terrainMaterial);
    terrain.receiveShadow = true;
    this.group.add(terrain);
  }

  // --- 3. Dynamic Water Shader ---
  createDreamWater() {
    const waterGeo = new THREE.CircleGeometry(17.8, 64);
    waterGeo.rotateX(-Math.PI / 2);

    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorDeep: { value: new THREE.Color(0x01182d) },
        uColorShallow: { value: new THREE.Color(0x004c6e) },
        uColorGlow: { value: new THREE.Color(0x65fbbf) }
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vWave;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave = sin(pos.x * 1.1 + uTime * 0.9) * cos(pos.z * 1.1 + uTime * 0.7) * 0.15;
          pos.y += wave;
          vWave = wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorDeep;
        uniform vec3 uColorShallow;
        uniform vec3 uColorGlow;
        varying vec2 vUv;
        varying float vWave;

        void main() {
          float dist = length(vUv - vec2(0.5));
          vec3 baseColor = mix(uColorShallow, uColorDeep, dist * 1.6);
          float edgeGlow = smoothstep(0.4, 0.5, dist) * 0.6;
          vec3 finalColor = mix(baseColor, uColorGlow, edgeGlow + vWave * 0.7);
          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const water = new THREE.Mesh(waterGeo, this.waterMaterial);
    water.position.y = -0.18;
    this.group.add(water);
  }

  // --- 4. Rocks & Hanging Vines ---
  createNaturalRocks(count) {
    const rockGroup = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x242933,
      roughness: 0.95,
      flatShading: true
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 16 + Math.random() * 25;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const size = 0.8 + Math.random() * 2.5;
      const rockGeo = new THREE.DodecahedronGeometry(size, 1);
      const rock = new THREE.Mesh(rockGeo, rockMat);

      rock.position.set(x, size * 0.3, z);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.scale.set(1 + Math.random() * 0.5, 0.7 + Math.random() * 0.6, 1 + Math.random() * 0.5);
      rock.castShadow = true;
      rockGroup.add(rock);

      if (Math.random() < 0.4) {
        this.createRockVines(rock, size);
      }
    }
    this.group.add(rockGroup);
  }

  createRockVines(parentRock, rockSize) {
    const vineGroup = new THREE.Group();
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x226e38, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d9e5a });

    const vineCount = 2 + Math.floor(Math.random() * 3);
    for (let v = 0; v < vineCount; v++) {
      const length = rockSize * (1.0 + Math.random() * 0.6);
      const vineGeo = new THREE.CylinderGeometry(0.02, 0.02, length, 5);
      const vine = new THREE.Mesh(vineGeo, vineMat);

      vine.position.set(
        (Math.random() - 0.5) * rockSize,
        length * 0.3,
        (Math.random() - 0.5) * rockSize
      );
      vine.rotation.z = Math.PI;

      for (let l = 0; l < 6; l++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), leafMat);
        leaf.position.y = (Math.random() - 0.5) * length * 0.8;
        leaf.position.x = (Math.random() - 0.5) * 0.15;
        leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        vine.add(leaf);
      }

      vineGroup.add(vine);
    }
    parentRock.add(vineGroup);
  }

  // --- 5. Lush Canopy Trees ---
  createLushCanopyTrees(count) {
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.75, 6, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2419, roughness: 0.95 });
    const foliageColors = [0x1a4030, 0x275a43, 0x3d8c6b, 0x51ae8a, 0x1e5645, 0x4aa67c];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 22 + Math.random() * 40;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const singleTree = new THREE.Group();

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 3;
      trunk.rotation.z = (Math.random() - 0.5) * 0.12;
      trunk.castShadow = true;
      singleTree.add(trunk);

      const foliageGroup = new THREE.Group();
      const leafMat = new THREE.MeshStandardMaterial({
        color: foliageColors[Math.floor(Math.random() * foliageColors.length)],
        roughness: 0.7,
        flatShading: true
      });

      const sphereGeo = new THREE.DodecahedronGeometry(1.6, 1);
      const clusterCount = 5 + Math.floor(Math.random() * 4);
      for (let c = 0; c < clusterCount; c++) {
        const cloud = new THREE.Mesh(sphereGeo, leafMat);
        cloud.position.set(
          (Math.random() - 0.5) * 2.5,
          5.0 + Math.random() * 2.5,
          (Math.random() - 0.5) * 2.5
        );
        cloud.scale.set(1 + Math.random() * 0.4, 1 + Math.random() * 0.4, 1 + Math.random() * 0.4);
        cloud.castShadow = true;
        foliageGroup.add(cloud);
      }
      singleTree.add(foliageGroup);

      singleTree.position.set(x, 0, z);
      const scale = 0.9 + Math.random() * 0.8;
      singleTree.scale.set(scale, scale, scale);

      treeGroup.add(singleTree);
    }
    this.group.add(treeGroup);
  }

  // --- 6. Lotus Flowers ---
  createSwayingLotuses(count) {
    const lotusGroup = new THREE.Group();

    const padGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.03, 16);
    const padMat = new THREE.MeshStandardMaterial({ color: 0x16467a, roughness: 0.5, side: THREE.DoubleSide });

    const petalGeo = new THREE.ConeGeometry(0.22, 0.8, 5);
    petalGeo.rotateX(Math.PI / 3);

    const bloomMat = new THREE.MeshStandardMaterial({
      color: 0xffcad4,
      emissive: 0xff6b9d,
      emissiveIntensity: 0.8,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const lotusUnit = new THREE.Group();

      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = -0.12;
      lotusUnit.add(pad);

      const bloomGroup = new THREE.Group();
      for (let layer = 0; layer < 2; layer++) {
        const ring = new THREE.Group();
        const numPetals = 8 + layer * 4;
        const layerRadius = 0.2 + layer * 0.08;
        for (let p = 0; p < numPetals; p++) {
          const petal = new THREE.Mesh(petalGeo, bloomMat);
          const pAngle = (p / numPetals) * Math.PI * 2;
          petal.position.set(Math.cos(pAngle) * layerRadius, 0, Math.sin(pAngle) * layerRadius);
          petal.rotation.y = -pAngle + Math.PI / 2;
          petal.rotation.z = layer * (Math.PI / 6);
          ring.add(petal);
        }
        bloomGroup.add(ring);
      }
      lotusUnit.add(bloomGroup);

      const centerMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      for (let s = 0; s < 4; s++) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), centerMat);
        sphere.position.set((Math.random() - 0.5) * 0.2, 0.1, (Math.random() - 0.5) * 0.2);
        lotusUnit.add(sphere);
      }

      lotusUnit.position.set(x, 0, z);
      const scale = 0.6 + Math.random() * 0.5;
      lotusUnit.scale.set(scale, scale, scale);

      this.lotusNodes.push({
        group: lotusUnit,
        baseY: 0,
        bloom: bloomGroup,
        phase: Math.random() * Math.PI * 2,
        swayPhase: Math.random() * Math.PI * 2
      });

      lotusGroup.add(lotusUnit);
    }
    this.group.add(lotusGroup);
  }

  // --- 7. Wildflowers ---
  createWildflowerMeadows(count) {
    const flowerGroup = new THREE.Group();
    const stemGeo = new THREE.CylinderGeometry(0.025, 0.035, 0.4, 5);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4fb020, roughness: 0.8 });
    const bloomColors = [0xff006e, 0xffa500, 0x8338ec, 0x3a86ff, 0xfb5607];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 17 + Math.random() * 35;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const flower = new THREE.Group();
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.2;
      flower.add(stem);

      const color = bloomColors[Math.floor(Math.random() * bloomColors.length)];
      const bloomMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.4,
        flatShading: true
      });

      const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1, 0), bloomMat);
      bloom.position.y = 0.4;
      flower.add(bloom);

      flower.position.set(x, 0, z);
      flowerGroup.add(flower);
    }
    this.group.add(flowerGroup);
  }

  // --- 8. Mushrooms ---
  createDeepMushroomClusters(count) {
    const plantGroup = new THREE.Group();
    const capGeo = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.4, 6);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });

    const capColors = [
      { c: 0xffb703, e: 0xfb8500, i: 1.2 },
      { c: 0x4cc9f0, e: 0x4895ef, i: 1.0 },
      { c: 0xf72585, e: 0xb5179e, i: 0.9 },
      { c: 0x72ffde, e: 0x00ff80, i: 1.1 },
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 16 + Math.random() * 30;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const cluster = new THREE.Group();
      const numShrooms = 2 + Math.floor(Math.random() * 4);
      const palette = capColors[Math.floor(Math.random() * capColors.length)];

      const capMat = new THREE.MeshStandardMaterial({
        color: palette.c,
        emissive: palette.e,
        emissiveIntensity: palette.i,
        roughness: 0.3
      });

      for (let s = 0; s < numShrooms; s++) {
        const shroom = new THREE.Group();
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.2;

        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.4;

        shroom.add(stem);
        shroom.add(cap);

        shroom.position.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5);
        const sc = 0.5 + Math.random() * 0.7;
        shroom.scale.set(sc, sc, sc);

        cluster.add(shroom);
      }

      cluster.position.set(x, 0, z);
      plantGroup.add(cluster);
    }

    this.group.add(plantGroup);
  }

  // --- 9. Detailed Butterflies ---
  createOrganicButterflies(count) {
    const butterflyGroup = new THREE.Group();

    const leftUpperShape = new THREE.Shape();
    leftUpperShape.moveTo(0, 0);
    leftUpperShape.bezierCurveTo(-0.1, 0.05, -0.2, 0.25, -0.05, 0.4);
    leftUpperShape.bezierCurveTo(0.0, 0.35, 0.05, 0.3, 0.08, 0.0);
    const leftUpperWingGeo = new THREE.ShapeGeometry(leftUpperShape);

    const leftLowerShape = new THREE.Shape();
    leftLowerShape.moveTo(0, 0);
    leftLowerShape.bezierCurveTo(-0.05, -0.05, -0.15, -0.2, -0.08, -0.35);
    leftLowerShape.bezierCurveTo(-0.02, -0.3, 0.02, -0.2, 0.03, 0.0);
    const leftLowerWingGeo = new THREE.ShapeGeometry(leftLowerShape);

    const rightUpperWingGeo = leftUpperWingGeo.clone();
    rightUpperWingGeo.scale(-1, 1, 1);
    const rightLowerWingGeo = leftLowerWingGeo.clone();
    rightLowerWingGeo.scale(-1, 1, 1);

    const bodyGeo = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.95 });
    for (let b = 0; b < 3; b++) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), bodyMat);
      sphere.position.y = -b * 0.06;
      bodyGeo.add(sphere);
    }

    const butterflyMaterials = [
      { c: 0x4cc9f0, e: 0x4895ef },
      { c: 0xffa200, e: 0xffd700 },
      { c: 0xf72585, e: 0xb5179e },
      { c: 0x72ffde, e: 0x00ff80 },
    ];

    for (let i = 0; i < count; i++) {
      const bUnit = new THREE.Group();
      const palette = butterflyMaterials[Math.floor(Math.random() * butterflyMaterials.length)];

      const wingMat = new THREE.MeshStandardMaterial({
        color: palette.c,
        emissive: palette.e,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide
      });

      const leftWingsUnit = new THREE.Group();
      leftWingsUnit.add(new THREE.Mesh(leftUpperWingGeo, wingMat));
      leftWingsUnit.add(new THREE.Mesh(leftLowerWingGeo, wingMat));

      const rightWingsUnit = new THREE.Group();
      rightWingsUnit.add(new THREE.Mesh(rightUpperWingGeo, wingMat));
      rightWingsUnit.add(new THREE.Mesh(rightLowerWingGeo, wingMat));

      const wingsGroup = new THREE.Group();
      wingsGroup.add(leftWingsUnit);
      wingsGroup.add(rightWingsUnit);

      bUnit.add(wingsGroup);
      
      const body = bodyGeo.clone();
      body.rotation.x = Math.PI / 2;
      bUnit.add(body);

      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 14;

      bUnit.position.set(Math.cos(angle) * radius, 1.3 + Math.random() * 2.5, Math.sin(angle) * radius);

      this.butterflies.push({
        mesh: bUnit,
        leftWingsUnit,
        rightWingsUnit,
        radius,
        angle,
        speed: 0.2 + Math.random() * 0.4,
        yBase: bUnit.position.y
      });

      butterflyGroup.add(bUnit);
    }
    this.group.add(butterflyGroup);
  }

  // --- 10. Hummingbirds ---
  createIridescentHummingbirds(count) {
    const birdGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.3,
      metalness: 0.8,
    });

    const birdBodyGeo = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.08 - i * 0.015, 8, 8), bodyMat);
      sphere.position.y = -i * 0.1;
      birdBodyGeo.add(sphere);
    }

    const beakGeo = new THREE.CylinderGeometry(0.008, 0.02, 0.4, 5);
    beakGeo.rotateX(-Math.PI / 2);
    beakGeo.translate(0, 0.08, 0.1);
    birdBodyGeo.add(new THREE.Mesh(beakGeo, bodyMat));

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.05, 0.1, 0.25, 0.1, 0.35, 0.0);
    wingShape.bezierCurveTo(0.25, -0.1, 0.05, -0.1, 0.01, 0.0);
    const wingGeo = new THREE.ShapeGeometry(wingShape);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      emissive: 0xaaaaaa,
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < count; i++) {
      const hUnit = new THREE.Group();
      hUnit.add(birdBodyGeo.clone());

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.x = -0.05;
      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.x = 0.05;
      rightWing.scale.x = -1;

      hUnit.add(leftWing);
      hUnit.add(rightWing);

      hUnit.rotation.x = Math.PI / 4;

      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 14;

      hUnit.position.set(Math.cos(angle) * radius, 3 + Math.random() * 3, Math.sin(angle) * radius);

      this.hummingbirds.push({
        mesh: hUnit,
        leftWing,
        rightWing,
        angle,
        radius,
        speed: 0.6 + Math.random() * 0.5,
        yBase: hUnit.position.y
      });

      birdGroup.add(hUnit);
    }
    this.group.add(birdGroup);
  }

  // --- 11. Golden Fireflies ---
  createAbundantGoldenFireflies(count) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 240, 210, 1.0)');
    gradient.addColorStop(0.3, 'rgba(255, 183, 3, 0.8)');
    gradient.addColorStop(0.7, 'rgba(251, 133, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const glowTexture = new THREE.CanvasTexture(canvas);

    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = 0.5 + Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.9,
      map: glowTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflyParticles = new THREE.Points(pGeo, pMat);
    this.group.add(this.fireflyParticles);
  }

  // --- Animation Updates ---
  update(time, deltaTime) {
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value = time;
    }

    this.lotusNodes.forEach((node) => {
      node.group.position.y = node.baseY + Math.sin(time * 1.5 + node.phase) * 0.04;
      node.group.rotation.x = Math.sin(time * 0.8 + node.swayPhase) * 0.02;
      const breatheScale = 1 + Math.sin(time * 1.2 + node.phase) * 0.04;
      node.bloom.scale.set(breatheScale, breatheScale, breatheScale);
    });

    this.butterflies.forEach((b) => {
      b.angle += b.speed * deltaTime * 0.4;
      b.mesh.position.x = Math.cos(b.angle) * b.radius;
      b.mesh.position.z = Math.sin(b.angle) * b.radius;
      b.mesh.position.y = b.yBase + Math.sin(time * 2.5 + b.angle) * 0.3;
      b.mesh.rotation.y = -b.angle - Math.PI / 2;

      const flap = Math.sin(time * 18) * 0.6;
      b.leftWingsUnit.rotation.z = flap;
      b.rightWingsUnit.rotation.z = -flap;
    });

    this.hummingbirds.forEach((h) => {
      h.angle += h.speed * deltaTime * 0.5;
      h.mesh.position.x = Math.cos(h.angle) * h.radius;
      h.mesh.position.z = Math.sin(h.angle) * h.radius;
      h.mesh.position.y = h.yBase + Math.cos(time * 3 + h.angle) * 0.4;
      h.mesh.rotation.y = -h.angle + Math.PI / 2;

      const flap = Math.sin(time * 40) * 0.4;
      h.leftWing.rotation.z = flap;
      h.rightWing.rotation.z = -flap;
    });

    if (this.fireflyParticles) {
      const pos = this.fireflyParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        y += Math.sin(time * 1.8 + i) * 0.003;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      this.fireflyParticles.rotation.y = time * 0.01;
    }
  }
}