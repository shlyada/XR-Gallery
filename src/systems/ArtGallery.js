import * as THREE from "three";

export default class ArtGallery {
  constructor({
    scene,
    camera = null,
    renderer = null,
    galleryCenter = new THREE.Vector3(25, 0, -8),
  }) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.galleryCenter = galleryCenter;

    // ============================================================
    // GALLERY SETTINGS
    // ============================================================

    this.pageSize = 30;
    this.slotCapacity = 30;
    this.currentPage = 0;
    this.totalArtworks = 0;
    this.hasMore = false;
    this.loading = false;
    this.artworks = [];

    // ============================================================
    // API
    // ============================================================

    const configuredApi =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_BLOOMXR_API_URL;

    this.apiBase =
      configuredApi ||
      (typeof window !== "undefined"
        ? `http://${window.location.hostname}:3001`
        : "http://localhost:3001");

    this.apiBase = this.apiBase.replace(/\/+$/, "");

    // ============================================================
    // LOCAL DELETION TRACKING
    // ============================================================

    this.deletedArtworkStorageKey =
      "bloomxr_deleted_artworks";

    this.deletedArtworkIds = new Set();

    try {
      const savedDeleted = localStorage.getItem(
        this.deletedArtworkStorageKey
      );

      if (savedDeleted) {
        const parsed = JSON.parse(savedDeleted);

        if (Array.isArray(parsed)) {
          parsed.forEach((id) =>
            this.deletedArtworkIds.add(String(id))
          );
        }
      }
    } catch (error) {
      console.warn(
        "Could not load deleted artwork IDs:",
        error
      );
    }

    // ============================================================
    // ROOT GROUPS
    // ============================================================

    this.group = new THREE.Group();
    this.group.position.copy(this.galleryCenter);

    this.architectureGroup = new THREE.Group();
    this.artworkGroup = new THREE.Group();
    this.signGroup = new THREE.Group();
    this.lightGroup = new THREE.Group();

    this.group.add(this.architectureGroup);
    this.group.add(this.artworkGroup);
    this.group.add(this.signGroup);
    this.group.add(this.lightGroup);

    this.scene.add(this.group);

    // ============================================================
    // DEFAULT ART
    // ============================================================

    this.defaultArt = [
      {
        id: "default-1",
        title: "Bloom",
        artist: "BloomXR",
        imageUrl: "/art/artwork1.jpg",
        description:
          "A peaceful exploration of nature and possibility.",
      },
      {
        id: "default-2",
        title: "Connection",
        artist: "BloomXR",
        imageUrl: "/art/artwork2.jpg",
        description:
          "A reflection on connection, creativity, and independence.",
      },
      {
        id: "default-3",
        title: "Sanctuary",
        artist: "BloomXR",
        imageUrl: "/art/artwork3.jpg",
        description:
          "A visual representation of the Lotus Sanctuary.",
      },
    ];

    // ============================================================
    // BUILD GALLERY
    // ============================================================

    this.createArchitecture();
    this.createSign();
    this.createLighting();
    this.createHUD();
    this.setupDesktopSelection();

    this.loadPage(0);
  }

  // ============================================================
  // ARCHITECTURE
  // ============================================================

  createArchitecture() {
    const platformMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x18252b,
        roughness: 0.78,
        metalness: 0.12,
      });

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(
        20.5,
        20.5,
        0.35,
        96
      ),
      platformMaterial
    );

    platform.position.y = -0.18;
    this.architectureGroup.add(platform);

    const floorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x26383d,
        roughness: 0.72,
        metalness: 0.08,
      });

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(
        19.85,
        19.85,
        0.08,
        96
      ),
      floorMaterial
    );

    floor.position.y = 0.03;
    this.architectureGroup.add(floor);

    const ringMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x6f9b8e,
        roughness: 0.55,
        metalness: 0.25,
        emissive: 0x1b302a,
        emissiveIntensity: 0.25,
      });

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(
        19.7,
        0.12,
        16,
        96
      ),
      ringMaterial
    );

    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.08;
    this.architectureGroup.add(outerRing);

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x30464a,
        roughness: 0.82,
        metalness: 0.05,
      });

    const rearWall = new THREE.Mesh(
      new THREE.BoxGeometry(
        28.5,
        5.4,
        0.34
      ),
      wallMaterial
    );

    rearWall.position.set(0, 3.2, -9.5);
    this.architectureGroup.add(rearWall);

    const sideWallLength = 16.6;
    const sideWallZ = -0.9;

    [-1, 1].forEach((direction) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.34,
          5.15,
          sideWallLength
        ),
        wallMaterial
      );

      wall.position.set(
        direction * 14.25,
        3.05,
        sideWallZ
      );

      this.architectureGroup.add(wall);
    });

    const pillarMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x40585a,
        roughness: 0.72,
        metalness: 0.08,
      });

    const entrancePillarPositions = [-4.75, 4.75];

    entrancePillarPositions.forEach((x) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.55,
          5.6,
          0.65
        ),
        pillarMaterial
      );

      pillar.position.set(x, 2.8, 9.0);
      this.architectureGroup.add(pillar);
    });

    const entranceHeader = new THREE.Mesh(
      new THREE.BoxGeometry(
        10.05,
        0.55,
        0.65
      ),
      pillarMaterial
    );

    entranceHeader.position.set(
      0,
      5.35,
      9.0
    );

    this.architectureGroup.add(
      entranceHeader
    );

    const floorLightMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xa7d8c8,
        emissive: 0x6da894,
        emissiveIntensity: 1.4,
        roughness: 0.35,
        metalness: 0.2,
      });

    const floorLightGeometry =
      new THREE.CylinderGeometry(
        0.055,
        0.055,
        0.025,
        16
      );

    for (let i = 0; i < 24; i++) {
      const angle =
        (i / 24) * Math.PI * 2;

      const lightMarker = new THREE.Mesh(
        floorLightGeometry,
        floorLightMaterial
      );

      lightMarker.position.set(
        Math.cos(angle) * 18.7,
        0.11,
        Math.sin(angle) * 18.7
      );

      this.architectureGroup.add(
        lightMarker
      );
    }
  }

  // ============================================================
  // SIGN
  // ============================================================

  createSign() {
    const signMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x172629,
        roughness: 0.65,
        metalness: 0.15,
      });

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(
        7.8,
        1.45,
        0.16
      ),
      signMaterial
    );

    sign.position.set(
      0,
      5.85,
      -9.25
    );

    this.signGroup.add(sign);

    const canvas =
      document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#172629";
      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#d5eee4";
      ctx.font = "bold 72px Arial";

      ctx.fillText(
        "BLOOMXR",
        canvas.width / 2,
        88
      );

      ctx.fillStyle = "#9ecbb9";
      ctx.font = "32px Arial";

      ctx.fillText(
        "The Lotus Sanctuary Gallery",
        canvas.width / 2,
        160
      );
    }

    const texture =
      new THREE.CanvasTexture(canvas);

    texture.colorSpace =
      THREE.SRGBColorSpace;

    const textMaterial =
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });

    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(
        7.45,
        1.15
      ),
      textMaterial
    );

    textPlane.position.set(
      0,
      5.85,
      -9.14
    );

    this.signGroup.add(textPlane);
  }

  // ============================================================
  // LIGHTING
  // ============================================================

  createLighting() {
    const hemisphere =
      new THREE.HemisphereLight(
        0xc9f0e3,
        0x162226,
        1.7
      );

    hemisphere.position.set(0, 10, 0);
    this.lightGroup.add(hemisphere);

    const directional =
      new THREE.DirectionalLight(
        0xffffff,
        2.0
      );

    directional.position.set(
      0,
      10,
      7
    );

    directional.target.position.set(
      0,
      0,
      -2
    );

    this.lightGroup.add(directional);
    this.lightGroup.add(
      directional.target
    );

    const rearSpot =
      new THREE.SpotLight(
        0xd8fff2,
        4.5,
        30,
        Math.PI / 5,
        0.5,
        1.2
      );

    rearSpot.position.set(
      0,
      8,
      -2
    );

    rearSpot.target.position.set(
      0,
      1.5,
      -9
    );

    this.lightGroup.add(rearSpot);
    this.lightGroup.add(
      rearSpot.target
    );

    const leftSpot =
      new THREE.SpotLight(
        0xc9eee2,
        3.8,
        28,
        Math.PI / 5,
        0.5,
        1.2
      );

    leftSpot.position.set(
      -8,
      8,
      0
    );

    leftSpot.target.position.set(
      -13.5,
      1.7,
      -1
    );

    this.lightGroup.add(leftSpot);
    this.lightGroup.add(
      leftSpot.target
    );

    const rightSpot =
      new THREE.SpotLight(
        0xc9eee2,
        3.8,
        28,
        Math.PI / 5,
        0.5,
        1.2
      );

    rightSpot.position.set(
      8,
      8,
      0
    );

    rightSpot.target.position.set(
      13.5,
      1.7,
      -1
    );

    this.lightGroup.add(rightSpot);
    this.lightGroup.add(
      rightSpot.target
    );
  }

  // ============================================================
  // 30 ARTWORK SLOTS
  // ============================================================

  createArtworkSlots() {
    const slots = [];

    const rowHeights = [
      2.0,
      4.25,
    ];

    const rearXPositions = [
      -10.0,
      -5.0,
      0,
      5.0,
      10.0,
    ];

    rearXPositions.forEach((x) => {
      rowHeights.forEach((y) => {
        slots.push({
          x,
          y,
          z: -9.28,
          rotationY: 0,
        });
      });
    });

    const sideZPositions = [
      -7.3,
      -3.65,
      0,
      3.65,
      7.3,
    ];

    sideZPositions.forEach((z) => {
      rowHeights.forEach((y) => {
        slots.push({
          x: -14.07,
          y,
          z,
          rotationY: Math.PI / 2,
        });
      });
    });

    sideZPositions.forEach((z) => {
      rowHeights.forEach((y) => {
        slots.push({
          x: 14.07,
          y,
          z,
          rotationY: -Math.PI / 2,
        });
      });
    });

    return slots;
  }

  // ============================================================
  // RESOLVE ARTWORK URL
  // ============================================================

  resolveArtworkUrl(url) {
    if (!url) {
      return null;
    }

    const value = String(url).trim();

    if (!value) {
      return null;
    }

    // Already a complete URL.
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("blob:") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    // Backend-relative URL.
    if (value.startsWith("/")) {
      return `${this.apiBase}${value}`;
    }

    // Relative API path without a leading slash.
    if (
      value.startsWith("api/") ||
      value.startsWith("api?")
    ) {
      return `${this.apiBase}/${value}`;
    }

    // Local frontend assets such as /art/artwork1.jpg
    // are served by the frontend, not the backend.
    if (
      value.startsWith("art/") ||
      value.startsWith("./") ||
      value.startsWith("../")
    ) {
      return value;
    }

    return value;
  }

  // ============================================================
  // LOAD ARTWORK PAGE
  // ============================================================

  async loadPage(page = 0) {
    if (this.loading) return;

    this.loading = true;
    this.currentPage = page;

    try {
      const offset =
        page * this.pageSize;

      const url =
        `${this.apiBase}/api/artworks` +
        `?limit=${this.pageSize}` +
        `&offset=${offset}` +
        `&sort=newest`;

      console.log(
        "[BloomXR Gallery] Loading artwork API:",
        url
      );

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Artwork API returned ${response.status}`
        );
      }

      const data =
        await response.json();

      const rawItems =
        Array.isArray(data.artworks)
          ? data.artworks
          : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];

      console.log(
        "[BloomXR Gallery] Backend returned:",
        rawItems.length,
        "artworks"
      );

      const filteredItems =
        rawItems.filter((item) => {
          if (!item || item.id == null) {
            return true;
          }

          return !this.deletedArtworkIds.has(
            String(item.id)
          );
        });

      this.totalArtworks =
        Math.max(
          0,
          Number(
            data.total ||
              rawItems.length
          ) -
            this.deletedArtworkIds.size
        );

      this.hasMore =
        Boolean(data.hasMore);

      if (filteredItems.length > 0) {
        this.artworks = filteredItems;

        await this.renderArtwork(
          filteredItems
        );
      } else if (page === 0) {
        this.artworks =
          this.defaultArt;

        await this.renderFallback();
      } else {
        this.artworks = [];

        this.clearArtwork();
      }

      this.updateHUD();
    } catch (error) {
      console.warn(
        "Could not load gallery artwork from backend:",
        error
      );

      if (page === 0) {
        this.artworks =
          this.defaultArt;

        await this.renderFallback();
      }

      this.updateHUD();
    } finally {
      this.loading = false;
    }
  }

  // ============================================================
  // RENDER ARTWORK
  // ============================================================

  async renderArtwork(items) {
    this.clearArtwork();

    const slots =
      this.createArtworkSlots();

    const visibleItems =
      items.slice(
        0,
        Math.min(
          items.length,
          slots.length
        )
      );

    console.log(
      "[BloomXR Gallery] Rendering",
      visibleItems.length,
      "artworks"
    );

    for (
      let i = 0;
      i < visibleItems.length;
      i++
    ) {
      const item =
        visibleItems[i];

      const slot =
        slots[i];

      try {
        await this.createArtwork(
          item,
          slot
        );
      } catch (error) {
        console.warn(
          `Could not create artwork ${
            item?.id || i
          }:`,
          error
        );
      }
    }

    this.updateHUD();
  }

  // ============================================================
  // FALLBACK ARTWORK
  // ============================================================

  async renderFallback() {
    this.clearArtwork();

    const slots =
      this.createArtworkSlots();

    const visibleItems =
      this.defaultArt.slice(
        0,
        slots.length
      );

    for (
      let i = 0;
      i < visibleItems.length;
      i++
    ) {
      try {
        await this.createArtwork(
          visibleItems[i],
          slots[i]
        );
      } catch (error) {
        console.warn(
          `Could not create fallback artwork ${i}:`,
          error
        );
      }
    }

    this.updateHUD();
  }

  // ============================================================
  // CREATE INDIVIDUAL ARTWORK
  // ============================================================

  async createArtwork(item, slot) {
    if (!item || !slot) {
      return null;
    }

    const rawImageUrl =
      item.imageUrl ||
      item.image ||
      item.url ||
      item.src;

    if (!rawImageUrl) {
      throw new Error(
        "Artwork does not contain an image URL."
      );
    }

    const imageUrl =
      this.resolveArtworkUrl(
        rawImageUrl
      );

    console.log(
      "[BloomXR Gallery] Loading image:",
      imageUrl
    );

    if (!imageUrl) {
      throw new Error(
        "Could not resolve artwork image URL."
      );
    }

    const texture =
      await this.loadTexture(
        imageUrl
      );

    const imageAspect =
      texture.image &&
      texture.image.height
        ? texture.image.width /
          texture.image.height
        : 1;

    const maxWidth = 2.0;
    const maxHeight = 1.45;

    let width = maxWidth;
    let height =
      width / imageAspect;

    if (height > maxHeight) {
      height = maxHeight;
      width =
        height * imageAspect;
    }

    // ------------------------------------------------------------
    // Artwork group
    // ------------------------------------------------------------

    const artworkGroup =
      new THREE.Group();

    artworkGroup.position.set(
      slot.x,
      slot.y,
      slot.z
    );

    artworkGroup.rotation.y =
      slot.rotationY;

    artworkGroup.userData = {
      artwork: item,
      artworkId:
        item.id != null
          ? String(item.id)
          : null,
      selectable: true,
    };

    // ------------------------------------------------------------
    // Frame
    // ------------------------------------------------------------

    const frameThickness = 0.09;
    const frameDepth = 0.11;

    const frameMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xc3d7cd,
        roughness: 0.4,
        metalness: 0.45,
      });

    const frameOuterWidth =
      width +
      frameThickness * 2;

    const frameOuterHeight =
      height +
      frameThickness * 2;

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(
        frameOuterWidth,
        frameOuterHeight,
        frameDepth
      ),
      frameMaterial
    );

    artworkGroup.add(frame);

    // ------------------------------------------------------------
    // Artwork image
    // ------------------------------------------------------------

    const imageMaterial =
      new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });

    const imagePlane =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          width,
          height
        ),
        imageMaterial
      );

    imagePlane.position.z =
      frameDepth / 2 + 0.012;

    imagePlane.userData = {
      artworkGroup,
      artwork: item,
    };

    artworkGroup.add(
      imagePlane
    );

    // ------------------------------------------------------------
    // Backing
    // ------------------------------------------------------------

    const backingMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x10191b,
        roughness: 0.82,
        metalness: 0.05,
      });

    const backing = new THREE.Mesh(
      new THREE.BoxGeometry(
        frameOuterWidth + 0.03,
        frameOuterHeight + 0.03,
        0.06
      ),
      backingMaterial
    );

    backing.position.z = -0.07;

    artworkGroup.add(
      backing
    );

    // ------------------------------------------------------------
    // Label
    // ------------------------------------------------------------

    const title =
      item.title ||
      item.name ||
      "Untitled";

    const artist =
      item.artist ||
      item.author ||
      item.creator ||
      "Unknown Artist";

    const label =
      this.createArtworkLabel(
        title,
        artist,
        item
      );

    label.position.set(
      0,
      -(height / 2) - 0.38,
      0.13
    );

    artworkGroup.add(label);

    // ------------------------------------------------------------
    // Selection ring
    // ------------------------------------------------------------

    const ringGeometry =
      new THREE.RingGeometry(
        1.04,
        1.08,
        48
      );

    const ringMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x8fd8bd,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });

    const selectionRing =
      new THREE.Mesh(
        ringGeometry,
        ringMaterial
      );

    selectionRing.scale.set(
      Math.max(width, height),
      Math.max(width, height),
      1
    );

    selectionRing.position.z =
      0.16;

    artworkGroup.add(
      selectionRing
    );

    artworkGroup.userData.selectionRing =
      selectionRing;

    artworkGroup.userData.width =
      width;

    artworkGroup.userData.height =
      height;

    // ------------------------------------------------------------
    // Add to gallery
    // ------------------------------------------------------------

    this.artworkGroup.add(
      artworkGroup
    );

    this.artworks.push({
      ...item,
      _group: artworkGroup,
    });

    this.setupArtworkInteraction(
      artworkGroup
    );

    return artworkGroup;
  }

  // ============================================================
  // LOAD TEXTURE
  // ============================================================

  loadTexture(url) {
    return new Promise(
      (resolve, reject) => {
        const loader =
          new THREE.TextureLoader();

        loader.load(
          url,
          (texture) => {
            texture.colorSpace =
              THREE.SRGBColorSpace;

            texture.anisotropy =
              this.renderer?.capabilities?.getMaxAnisotropy?.() ||
              1;

            resolve(texture);
          },
          undefined,
          (error) => {
            console.error(
              "[BloomXR Gallery] Failed to load image:",
              url,
              error
            );

            reject(error);
          }
        );
      }
    );
  }

  // ============================================================
  // ARTWORK FRAME
  // ============================================================

  createFrame(width, height) {
    const group =
      new THREE.Group();

    const material =
      new THREE.MeshStandardMaterial({
        color: 0xc3d7cd,
        roughness: 0.4,
        metalness: 0.45,
      });

    const thickness = 0.09;
    const depth = 0.11;

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(
        width + thickness * 2,
        thickness,
        depth
      ),
      material
    );

    top.position.y =
      height / 2 +
      thickness / 2;

    const bottom =
      top.clone();

    bottom.position.y =
      -height / 2 -
      thickness / 2;

    const left = new THREE.Mesh(
      new THREE.BoxGeometry(
        thickness,
        height,
        depth
      ),
      material
    );

    left.position.x =
      -width / 2 -
      thickness / 2;

    const right =
      left.clone();

    right.position.x =
      width / 2 +
      thickness / 2;

    group.add(
      top,
      bottom,
      left,
      right
    );

    return group;
  }

  // ============================================================
  // LABEL
  // ============================================================

  createArtworkLabel(
    title,
    artist,
    item = {}
  ) {
    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = 512;
    canvas.height = 128;

    const ctx =
      canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.fillStyle =
        "rgba(10, 20, 22, 0.88)";

      this.roundRect(
        ctx,
        4,
        4,
        canvas.width - 8,
        canvas.height - 8,
        16
      );

      ctx.fill();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle =
        "#e0f2eb";

      ctx.font =
        "bold 28px Arial";

      ctx.fillText(
        this.truncateText(
          title,
          28
        ),
        canvas.width / 2,
        43
      );

      ctx.fillStyle =
        "#9fc9ba";

      ctx.font =
        "20px Arial";

      ctx.fillText(
        this.truncateText(
          artist,
          35
        ),
        canvas.width / 2,
        82
      );
    }

    const texture =
      new THREE.CanvasTexture(
        canvas
      );

    texture.colorSpace =
      THREE.SRGBColorSpace;

    const material =
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

    const label =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          2.65,
          0.62
        ),
        material
      );

    label.userData = {
      artwork: item,
    };

    return label;
  }

  // ============================================================
  // ROUND RECT HELPER
  // ============================================================

  roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {
    ctx.beginPath();

    ctx.moveTo(
      x + radius,
      y
    );

    ctx.lineTo(
      x + width - radius,
      y
    );

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + radius
    );

    ctx.lineTo(
      x + width,
      y + height - radius
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );

    ctx.lineTo(
      x + radius,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - radius
    );

    ctx.lineTo(
      x,
      y + radius
    );

    ctx.quadraticCurveTo(
      x,
      y,
      x + radius,
      y
    );

    ctx.closePath();
  }

  // ============================================================
  // TEXT TRUNCATION
  // ============================================================

  truncateText(
    text,
    maxLength
  ) {
    const value =
      String(text || "");

    if (
      value.length <=
      maxLength
    ) {
      return value;
    }

    return (
      value.slice(
        0,
        maxLength - 3
      ) + "..."
    );
  }

  // ============================================================
  // CLEAR ARTWORK
  // ============================================================

  clearArtwork() {
    while (
      this.artworkGroup.children
        .length > 0
    ) {
      const child =
        this.artworkGroup.children.pop();

      this.disposeObject(child);
    }

    this.artworks = [];
  }

  // ============================================================
  // DISPOSE OBJECT
  // ============================================================

  disposeObject(object) {
    if (!object) return;

    object.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }

      if (child.material) {
        const materials =
          Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach(
          (material) => {
            if (material.map) {
              material.map.dispose();
            }

            if (material.alphaMap) {
              material.alphaMap.dispose();
            }

            material.dispose();
          }
        );
      }
    });
  }

  // ============================================================
  // DESKTOP SELECTION
  // ============================================================

  setupDesktopSelection() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    this.raycaster =
      new THREE.Raycaster();

    this.mouse =
      new THREE.Vector2();

    window.addEventListener(
      "pointerdown",
      (event) => {
        if (!this.camera) return;

        if (
          event.target &&
          event.target.closest &&
          event.target.closest(
            "button, input, textarea, select, a"
          )
        ) {
          return;
        }

        const rect =
          this.renderer?.domElement?.getBoundingClientRect?.();

        if (!rect) return;

        this.mouse.x =
          ((event.clientX -
            rect.left) /
            rect.width) *
            2 -
          1;

        this.mouse.y =
          -(
            ((event.clientY -
              rect.top) /
              rect.height) *
            2 -
            1
          );

        this.raycaster.setFromCamera(
          this.mouse,
          this.camera
        );

        const intersections =
          this.raycaster.intersectObjects(
            this.artworkGroup.children,
            true
          );

        if (!intersections.length) {
          return;
        }

        let selected =
          intersections[0].object;

        while (
          selected &&
          selected.parent &&
          selected.parent !==
            this.artworkGroup
        ) {
          selected =
            selected.parent;
        }

        if (
          selected &&
          selected.parent ===
            this.artworkGroup
        ) {
          this.selectArtwork(
            selected
          );
        }
      }
    );
  }

  // ============================================================
  // ARTWORK INTERACTION
  // ============================================================

  setupArtworkInteraction(
    group
  ) {
    group.userData.onSelect =
      () => {
        this.selectArtwork(
          group
        );
      };
  }

  // ============================================================
  // SELECT ARTWORK
  // ============================================================

  selectArtwork(group) {
    if (!group) return;

    if (
      this.selectedArtwork &&
      this.selectedArtwork !== group
    ) {
      this.setArtworkSelected(
        this.selectedArtwork,
        false
      );
    }

    this.selectedArtwork =
      group;

    this.setArtworkSelected(
      group,
      true
    );

    const artwork =
      group.userData.artwork;

    if (artwork) {
      this.showArtworkDetails(
        artwork
      );
    }
  }

  // ============================================================
  // SELECTION VISUAL
  // ============================================================

  setArtworkSelected(
    group,
    selected
  ) {
    if (!group) return;

    const ring =
      group.userData.selectionRing;

    if (!ring) return;

    ring.material.opacity =
      selected ? 0.8 : 0;

    ring.scale.multiplyScalar(
      selected
        ? 1.03
        : 1 / 1.03
    );
  }

  // ============================================================
  // ARTWORK DETAILS
  // ============================================================

  showArtworkDetails(
    artwork
  ) {
    const title =
      artwork.title ||
      artwork.name ||
      "Untitled";

    const artist =
      artwork.artist ||
      artwork.author ||
      artwork.creator ||
      "Unknown Artist";

    const description =
      artwork.description ||
      "";

    this.showToast(
      `${title} — ${artist}${
        description
          ? `\n${description}`
          : ""
      }`
    );
  }

  // ============================================================
  // XR SELECTION
  // ============================================================

  handleXRSelection(group) {
    if (!group) return;

    this.selectArtwork(group);
  }

  // ============================================================
  // DELETE SELECTED ARTWORK
  // ============================================================

  async deleteSelectedArtwork() {
    if (!this.selectedArtwork) {
      this.showToast(
        "Select an artwork first."
      );

      return;
    }

    const artwork =
      this.selectedArtwork.userData
        .artwork;

    if (!artwork) {
      this.showToast(
        "Could not identify this artwork."
      );

      return;
    }

    await this.deleteArtworkWithFeedback(
      artwork
    );
  }

  // ============================================================
  // DELETE ARTWORK
  // ============================================================

  async deleteArtworkWithFeedback(
    artwork
  ) {
    if (!artwork) return;

    const artworkId =
      artwork.id != null
        ? String(artwork.id)
        : null;

    if (
      !artworkId ||
      artworkId.startsWith(
        "default-"
      )
    ) {
      if (
        this.selectedArtwork
      ) {
        this.artworkGroup.remove(
          this.selectedArtwork
        );

        this.disposeObject(
          this.selectedArtwork
        );

        this.selectedArtwork =
          null;
      }

      this.showToast(
        "Artwork removed from the gallery."
      );

      return;
    }

    try {
      const response =
        await fetch(
          `${this.apiBase}/api/artworks/${encodeURIComponent(
            artworkId
          )}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        throw new Error(
          `Delete request returned ${response.status}`
        );
      }
    } catch (error) {
      console.warn(
        "Backend artwork deletion failed:",
        error
      );
    }

    this.deletedArtworkIds.add(
      artworkId
    );

    this.saveDeletedArtworkIds();

    if (
      this.selectedArtwork
    ) {
      this.artworkGroup.remove(
        this.selectedArtwork
      );

      this.disposeObject(
        this.selectedArtwork
      );

      this.selectedArtwork =
        null;
    }

    this.showToast(
      "Artwork deleted."
    );

    await this.loadPage(
      this.currentPage
    );
  }

  // ============================================================
  // SAVE DELETED IDS
  // ============================================================

  saveDeletedArtworkIds() {
    try {
      localStorage.setItem(
        this.deletedArtworkStorageKey,
        JSON.stringify(
          Array.from(
            this.deletedArtworkIds
          )
        )
      );
    } catch (error) {
      console.warn(
        "Could not save deleted artwork IDs:",
        error
      );
    }
  }

  // ============================================================
  // UPLOAD ARTWORK FROM CANVAS
  // ============================================================

  async uploadArtworkFromCanvas(
    canvas,
    metadata = {}
  ) {
    if (!canvas) {
      throw new Error(
        "Canvas is required."
      );
    }

    const blob =
      await new Promise(
        (resolve) => {
          canvas.toBlob(
            resolve,
            "image/png",
            0.95
          );
        }
      );

    if (!blob) {
      throw new Error(
        "Could not create artwork image."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "image",
      blob,
      "artwork.png"
    );

    if (metadata.title) {
      formData.append(
        "title",
        metadata.title
      );
    }

    if (metadata.artist) {
      formData.append(
        "artist",
        metadata.artist
      );
    }

    if (metadata.description) {
      formData.append(
        "description",
        metadata.description
      );
    }

    const response =
      await fetch(
        `${this.apiBase}/api/artworks`,
        {
          method: "POST",
          body: formData,
        }
      );

    if (!response.ok) {
      throw new Error(
        `Upload failed with status ${response.status}`
      );
    }

    const result =
      await response.json();

    await this.loadPage(0);

    return result;
  }

  // ============================================================
  // HUD
  // ============================================================

  createHUD() {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const existing =
      document.getElementById(
        "bloomxr-gallery-hud"
      );

    if (existing) {
      existing.remove();
    }

    const hud =
      document.createElement(
        "div"
      );

    hud.id =
      "bloomxr-gallery-hud";

    hud.style.position =
      "fixed";

    hud.style.top =
      "20px";

    hud.style.left =
      "20px";

    hud.style.padding =
      "12px 16px";

    hud.style.borderRadius =
      "12px";

    hud.style.background =
      "rgba(10, 20, 22, 0.72)";

    hud.style.border =
      "1px solid rgba(180, 225, 210, 0.25)";

    hud.style.color =
      "#dff4ec";

    hud.style.fontFamily =
      "Arial, sans-serif";

    hud.style.fontSize =
      "14px";

    hud.style.lineHeight =
      "1.45";

    hud.style.zIndex =
      "9999";

    hud.style.backdropFilter =
      "blur(8px)";

    hud.innerHTML = `
      <div
        id="bloomxr-gallery-status"
        style="font-weight:600;"
      >
        Loading gallery...
      </div>

      <div
        style="
          margin-top:4px;
          opacity:0.75;
          font-size:12px;
        "
      >
        30 display spots
      </div>
    `;

    document.body.appendChild(
      hud
    );

    this.hud = hud;

    this.updateHUD();
  }

  // ============================================================
  // UPDATE HUD
  // ============================================================

  updateHUD() {
    if (!this.hud) return;

    const status =
      document.getElementById(
        "bloomxr-gallery-status"
      );

    if (!status) return;

    const displayed =
      this.artworkGroup
        ? this.artworkGroup
            .children.length
        : 0;

    const total =
      this.totalArtworks ||
      displayed;

    status.textContent =
      `${displayed} displayed • ${total} artwork${
        total === 1
          ? ""
          : "s"
      }`;
  }

  // ============================================================
  // TOAST
  // ============================================================

  showToast(message) {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    const existing =
      document.getElementById(
        "bloomxr-gallery-toast"
      );

    if (existing) {
      existing.remove();
    }

    const toast =
      document.createElement(
        "div"
      );

    toast.id =
      "bloomxr-gallery-toast";

    toast.textContent =
      message;

    toast.style.position =
      "fixed";

    toast.style.left =
      "50%";

    toast.style.bottom =
      "32px";

    toast.style.transform =
      "translateX(-50%)";

    toast.style.padding =
      "12px 18px";

    toast.style.borderRadius =
      "12px";

    toast.style.background =
      "rgba(10, 20, 22, 0.9)";

    toast.style.border =
      "1px solid rgba(180, 225, 210, 0.25)";

    toast.style.color =
      "#e4f6ef";

    toast.style.fontFamily =
      "Arial, sans-serif";

    toast.style.fontSize =
      "14px";

    toast.style.whiteSpace =
      "pre-line";

    toast.style.zIndex =
      "10000";

    toast.style.maxWidth =
      "min(600px, 90vw)";

    toast.style.textAlign =
      "center";

    document.body.appendChild(
      toast
    );

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  // ============================================================
  // REFRESH
  // ============================================================

  async refresh() {
    await this.loadPage(
      this.currentPage
    );
  }

  // ============================================================
  // ATTACH TO WORLD
  // ============================================================

  attachToWorld(world) {
    if (!world) return;

    if (
      world.add &&
      this.group.parent !== world
    ) {
      if (this.group.parent) {
        this.group.parent.remove(
          this.group
        );
      }

      world.add(this.group);
    }
  }

  // ============================================================
  // CAMERA HELPERS
  // ============================================================

  getGalleryCenter() {
    return this.group.position.clone();
  }

  getArtworkGroups() {
    return this.artworkGroup
      ? this.artworkGroup.children
      : [];
  }

  // ============================================================
  // UPDATE
  // ============================================================

  update(delta = 0) {
    if (
      this.selectedArtwork &&
      this.selectedArtwork.userData
        .selectionRing
    ) {
      const ring =
        this.selectedArtwork
          .userData
          .selectionRing;

      ring.rotation.z +=
        delta * 0.5;
    }
  }
}