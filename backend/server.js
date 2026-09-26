import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";

const __dirname = path.resolve();

// ---------------------------------------------------------
// DIRECTORIES
// ---------------------------------------------------------

const uploadsDirectory = path.resolve(
  __dirname,
  process.env.ART_UPLOADS_DIR || "./uploads"
);

const uploadDirectory = path.resolve(
  __dirname,
  process.env.ART_UPLOAD_DIR || "./user-art"
);

const configuredLibraryDirs =
  process.env.ART_LIBRARY_DIRS ||
  process.env.ART_LIBRARY_DIR ||
  "./library";

const configuredLibraryDirectories = configuredLibraryDirs
  .split(path.delimiter)
  .map((dir) => dir.trim())
  .filter(Boolean)
  .map((dir) => path.resolve(__dirname, dir));

const libraryDirectories = [
  uploadsDirectory,
  uploadDirectory,
  ...configuredLibraryDirectories,
].filter(
  (directory, index, array) =>
    array.indexOf(directory) === index
);

// ---------------------------------------------------------
// DATA / CACHE
// ---------------------------------------------------------

const dataDirectory = path.resolve(__dirname, "./data");
const cacheDirectory = path.resolve(__dirname, "./cache");
const thumbnailDirectory = path.join(cacheDirectory, "thumbnails");

const catalogFile = path.join(dataDirectory, "catalog.json");

// ---------------------------------------------------------
// FILE SETTINGS
// ---------------------------------------------------------

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// ---------------------------------------------------------
// EXPRESS
// ---------------------------------------------------------

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------
// UPLOAD CONFIG
// ---------------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

// ---------------------------------------------------------
// CATALOG
// ---------------------------------------------------------

let catalog = [];

function ensureDirectories() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.mkdirSync(cacheDirectory, { recursive: true });
  fs.mkdirSync(thumbnailDirectory, { recursive: true });

  for (const directory of libraryDirectories) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function saveCatalog() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  fs.writeFileSync(
    catalogFile,
    JSON.stringify(catalog, null, 2),
    "utf8"
  );
}

function loadCatalog() {
  try {
    if (!fs.existsSync(catalogFile)) {
      catalog = [];
      return;
    }

    const raw = fs.readFileSync(catalogFile, "utf8");

    if (!raw.trim()) {
      catalog = [];
      return;
    }

    const parsed = JSON.parse(raw);

    catalog = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[BloomXR] Could not load catalog:", error);
    catalog = [];
  }
}

// ---------------------------------------------------------
// FILE HELPERS
// ---------------------------------------------------------

function isImageFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return allowedExtensions.has(extension);
}

function walkDirectory(directory) {
  const results = [];

  if (!fs.existsSync(directory)) {
    return results;
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkDirectory(fullPath));
      continue;
    }

    if (entry.isFile() && isImageFile(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function getArtworkSource(directory) {
  if (directory === uploadDirectory) {
    return "user";
  }

  return "library";
}

function makeArtworkId(filePath) {
  const relative = path.relative(__dirname, filePath);

  return crypto
    .createHash("sha1")
    .update(relative)
    .digest("hex")
    .slice(0, 16);
}

function makeArtworkRecord(filePath, source) {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(__dirname, filePath);

  return {
    id: makeArtworkId(filePath),
    filename: path.basename(filePath),
    path: filePath,
    relativePath,
    source,
    size: stats.size,
    modifiedAt: stats.mtimeMs,
    createdAt: stats.birthtimeMs || stats.mtimeMs,
  };
}

// ---------------------------------------------------------
// SCAN ARTWORK
// ---------------------------------------------------------

function scanLibrary() {
  console.log("");
  console.log("[BloomXR] ----------------------------------------");
  console.log("[BloomXR] Scanning artwork directories...");
  console.log("[BloomXR] ----------------------------------------");

  const discovered = [];

  for (const directory of libraryDirectories) {
    const source = getArtworkSource(directory);
    const files = walkDirectory(directory);

    console.log(
      `[BloomXR] ${directory} -> ${files.length} image file(s)`
    );

    for (const filePath of files) {
      discovered.push(
        makeArtworkRecord(filePath, source)
      );
    }
  }

  // Remove duplicates by actual file path.
  const unique = new Map();

  for (const artwork of discovered) {
    unique.set(path.resolve(artwork.path), artwork);
  }

  catalog = Array.from(unique.values()).sort(
    (a, b) => b.modifiedAt - a.modifiedAt
  );

  saveCatalog();

  const uploadCount = catalog.filter(
    (artwork) =>
      path.resolve(artwork.path) ===
        path.resolve(uploadsDirectory) ||
      artwork.path.startsWith(
        path.resolve(uploadsDirectory) + path.sep
      )
  ).length;

  const userArtCount = catalog.filter(
    (artwork) =>
      path.resolve(artwork.path) ===
        path.resolve(uploadDirectory) ||
      artwork.path.startsWith(
        path.resolve(uploadDirectory) + path.sep
      )
  ).length;

  console.log(
    `[BloomXR] Indexed ${catalog.length} total artwork file(s).`
  );

  console.log(
    `[BloomXR] uploads: ${uploadCount}`
  );

  console.log(
    `[BloomXR] user-art: ${userArtCount}`
  );

  console.log("[BloomXR] ----------------------------------------");
  console.log("");

  return catalog;
}

// ---------------------------------------------------------
// PUBLIC ARTWORK OBJECT
// ---------------------------------------------------------

function artworkToPublic(artwork) {
  return {
    id: artwork.id,
    filename: artwork.filename,
    source: artwork.source,
    size: artwork.size,
    modifiedAt: artwork.modifiedAt,
    createdAt: artwork.createdAt,

    url: `/api/artworks/${encodeURIComponent(
      artwork.id
    )}/image`,

    thumbnailUrl: `/api/artworks/${encodeURIComponent(
      artwork.id
    )}/thumbnail`,
  };
}

// ---------------------------------------------------------
// FIND ARTWORK
// ---------------------------------------------------------

function findArtworkById(id) {
  return catalog.find(
    (artwork) => String(artwork.id) === String(id)
  );
}

function isSafeArtworkPath(filePath) {
  const resolvedFile = path.resolve(filePath);

  return libraryDirectories.some((directory) => {
    const resolvedDirectory = path.resolve(directory);

    return (
      resolvedFile === resolvedDirectory ||
      resolvedFile.startsWith(
        resolvedDirectory + path.sep
      )
    );
  });
}

// ---------------------------------------------------------
// API: LIST ARTWORK
// ---------------------------------------------------------

app.get("/api/artworks", (req, res) => {
  try {
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 30, 1),
      40
    );

    const offset = Math.max(
      Number(req.query.offset) || 0,
      0
    );

    const sort = String(
      req.query.sort || "newest"
    ).toLowerCase();

    let items = [...catalog];

    if (sort === "oldest") {
      items.sort(
        (a, b) => a.modifiedAt - b.modifiedAt
      );
    } else {
      items.sort(
        (a, b) => b.modifiedAt - a.modifiedAt
      );
    }

    const paged = items.slice(
      offset,
      offset + limit
    );

    res.json({
      items: paged.map(artworkToPublic),
      total: items.length,
      offset,
      limit,
      hasMore: offset + limit < items.length,
    });
  } catch (error) {
    console.error(
      "[BloomXR] GET /api/artworks failed:",
      error
    );

    res.status(500).json({
      error: "Failed to retrieve artworks.",
    });
  }
});

// ---------------------------------------------------------
// API: GET ONE ARTWORK
// ---------------------------------------------------------

app.get("/api/artworks/:id", (req, res) => {
  const artwork = findArtworkById(req.params.id);

  if (!artwork) {
    return res.status(404).json({
      error: "Artwork not found.",
    });
  }

  return res.json(artworkToPublic(artwork));
});

// ---------------------------------------------------------
// API: SERVE ORIGINAL IMAGE
// ---------------------------------------------------------

app.get("/api/artworks/:id/image", (req, res) => {
  try {
    const artwork = findArtworkById(req.params.id);

    if (!artwork) {
      console.error(
        `[BloomXR] Image request: artwork ID not found: ${req.params.id}`
      );

      return res.status(404).json({
        error: "Artwork not found.",
      });
    }

    const filePath = path.resolve(artwork.path);

    console.log(
      `[BloomXR] Serving image: ${artwork.filename}`
    );

    console.log(
      `[BloomXR] Image path: ${filePath}`
    );

    // Make sure the file belongs to one of our approved
    // artwork directories.
    if (!isSafeArtworkPath(filePath)) {
      console.error(
        `[BloomXR] BLOCKED unsafe artwork path: ${filePath}`
      );

      return res.status(403).json({
        error: "Artwork path is not allowed.",
      });
    }

    if (!fs.existsSync(filePath)) {
      console.error(
        `[BloomXR] Artwork file does not exist: ${filePath}`
      );

      return res.status(404).json({
        error: "Artwork file no longer exists.",
      });
    }

    const extension = path.extname(filePath).toLowerCase();

    const mimeType =
      mimeTypes[extension] || "application/octet-stream";

    res.setHeader(
      "Content-Type",
      mimeType
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=3600"
    );

    return res.sendFile(filePath);
  } catch (error) {
    console.error(
      "[BloomXR] Failed to serve artwork image:",
      error
    );

    return res.status(500).json({
      error: "Failed to serve artwork image.",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------
// API: SERVE THUMBNAIL
// ---------------------------------------------------------

app.get("/api/artworks/:id/thumbnail", async (req, res) => {
  try {
    const artwork = findArtworkById(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        error: "Artwork not found.",
      });
    }

    const filePath = path.resolve(artwork.path);

    if (!isSafeArtworkPath(filePath)) {
      return res.status(403).json({
        error: "Artwork path is not allowed.",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "Artwork file no longer exists.",
      });
    }

    const thumbnailPath = path.join(
      thumbnailDirectory,
      `${artwork.id}.jpg`
    );

    if (!fs.existsSync(thumbnailPath)) {
      await sharp(filePath)
        .resize({
          width: 800,
          height: 800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
        })
        .toFile(thumbnailPath);
    }

    res.setHeader(
      "Content-Type",
      "image/jpeg"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=3600"
    );

    return res.sendFile(thumbnailPath);
  } catch (error) {
    console.error(
      "[BloomXR] Failed to generate thumbnail:",
      error
    );

    return res.status(500).json({
      error: "Failed to generate thumbnail.",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------
// API: UPLOAD ARTWORK
// ---------------------------------------------------------

app.post(
  "/api/artworks/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded.",
        });
      }

      const originalName =
        req.file.originalname || "artwork";

      const extension =
        path.extname(originalName).toLowerCase() ||
        ".jpg";

      if (!allowedExtensions.has(extension)) {
        return res.status(400).json({
          error: "Unsupported image format.",
        });
      }

      const safeName =
        `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;

      const destination =
        path.join(uploadDirectory, safeName);

      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });

      fs.writeFileSync(
        destination,
        req.file.buffer
      );

      scanLibrary();

      const artwork = catalog.find(
        (item) =>
          path.resolve(item.path) ===
          path.resolve(destination)
      );

      return res.status(201).json({
        artwork: artwork
          ? artworkToPublic(artwork)
          : null,
      });
    } catch (error) {
      console.error(
        "[BloomXR] Upload failed:",
        error
      );

      return res.status(500).json({
        error: "Upload failed.",
        details: error.message,
      });
    }
  }
);

// ---------------------------------------------------------
// API: UPLOAD ARTWORK USING "image" FIELD
// ---------------------------------------------------------

app.post(
  "/api/artworks",
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "file",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const file =
        req.files?.image?.[0] ||
        req.files?.file?.[0];

      if (!file) {
        return res.status(400).json({
          error: "No image uploaded.",
        });
      }

      const originalName =
        file.originalname || "artwork";

      const extension =
        path.extname(originalName).toLowerCase() ||
        ".jpg";

      if (!allowedExtensions.has(extension)) {
        return res.status(400).json({
          error: "Unsupported image format.",
        });
      }

      const safeName =
        `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;

      const destination =
        path.join(uploadDirectory, safeName);

      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });

      fs.writeFileSync(
        destination,
        file.buffer
      );

      scanLibrary();

      const artwork = catalog.find(
        (item) =>
          path.resolve(item.path) ===
          path.resolve(destination)
      );

      return res.status(201).json({
        artwork: artwork
          ? artworkToPublic(artwork)
          : null,
      });
    } catch (error) {
      console.error(
        "[BloomXR] Upload failed:",
        error
      );

      return res.status(500).json({
        error: "Upload failed.",
        details: error.message,
      });
    }
  }
);

// ---------------------------------------------------------
// API: DELETE USER ARTWORK
// ---------------------------------------------------------

app.delete("/api/artworks/:id", (req, res) => {
  try {
    const artwork = findArtworkById(req.params.id);

    if (!artwork) {
      return res.status(404).json({
        error: "Artwork not found.",
      });
    }

    if (artwork.source !== "user") {
      return res.status(403).json({
        error: "Only user-uploaded artwork can be deleted.",
      });
    }

    const filePath = path.resolve(artwork.path);

    if (!isSafeArtworkPath(filePath)) {
      return res.status(403).json({
        error: "Artwork path is not allowed.",
      });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const thumbnailPath = path.join(
      thumbnailDirectory,
      `${artwork.id}.jpg`
    );

    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    scanLibrary();

    return res.json({
      success: true,
      id: artwork.id,
    });
  } catch (error) {
    console.error(
      "[BloomXR] Delete failed:",
      error
    );

    return res.status(500).json({
      error: "Delete failed.",
      details: error.message,
    });
  }
});

// ---------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    artworks: catalog.length,
    directories: libraryDirectories,
  });
});

// ---------------------------------------------------------
// SWAGGER
// ---------------------------------------------------------

try {
  const swaggerPath = path.join(
    __dirname,
    "swagger.yaml"
  );

  if (fs.existsSync(swaggerPath)) {
    const swaggerDocument = yaml.load(
      fs.readFileSync(swaggerPath, "utf8")
    );

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }
} catch (error) {
  console.warn(
    "[BloomXR] Swagger setup skipped:",
    error.message
  );
}

// ---------------------------------------------------------
// AUTO RESCAN
// ---------------------------------------------------------

setInterval(() => {
  try {
    scanLibrary();
  } catch (error) {
    console.error(
      "[BloomXR] Automatic artwork rescan failed:",
      error
    );
  }
}, 30000);

// ---------------------------------------------------------
// START SERVER
// ---------------------------------------------------------

ensureDirectories();
loadCatalog();
scanLibrary();

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("[BloomXR] ========================================");
  console.log(`[BloomXR] Server running on port ${PORT}`);
  console.log(`[BloomXR] API: http://localhost:${PORT}`);
  console.log("[BloomXR] Artwork directories:");

  for (const directory of libraryDirectories) {
    console.log(`[BloomXR]   ${directory}`);
  }

  console.log(
    `[BloomXR] Total indexed artwork: ${catalog.length}`
  );

  console.log("[BloomXR] ========================================");
  console.log("");
});