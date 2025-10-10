// index.js
const express = require("express");
const multer = require("multer");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

// Config
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "file_manager";
const uploadBase = path.join(__dirname, "uploads");
const folders = ["profile_pics", "documents", "others"];

// Ensure base folders exist
async function ensureFolders() {
  for (const f of folders) {
    const p = path.join(uploadBase, f);
    if (!fsSync.existsSync(p)) {
      await fs.mkdir(p, { recursive: true });
    }
  }
}
ensureFolders().catch(console.error);

// Mongo client
const client = new MongoClient(MONGO_URI);
let filesCollection;

async function startDb() {
  await client.connect();
  const db = client.db(DB_NAME);
  filesCollection = db.collection("files"); // store metadata here
  // index for faster lookups by userId
  await filesCollection.createIndex({ userId: 1 });
}
startDb().catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

// Multer storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const userId = req.params.userId;
      let folder = "others";
      if (file.fieldname === "profilePic") folder = "profile_pics";
      else if (file.fieldname === "docs") folder = "documents";

      const dest = path.join(uploadBase, folder, String(userId));
      await fs.mkdir(dest, { recursive: true });
      cb(null, dest);
    } catch (e) {
      cb(e);
    }
  },
  filename: function (req, file, cb) {
    const userId = req.params.userId;
    const timestamp = Date.now();
    // sanitize original name to avoid path injection (basic)
    const original = path.basename(file.originalname).replace(/\s+/g, "_");
    const newFilename = `${file.fieldname}-${userId}-${timestamp}-${original}`;
    cb(null, newFilename);
  },
});

// Allow only specific extensions
function extensionAllowed(originalname) {
  const allowed = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
  const ext = path.extname(originalname).toLowerCase();
  return allowed.includes(ext);
}

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file (global cap)
  fileFilter: function (req, file, cb) {
    if (!extensionAllowed(file.originalname)) {
      return cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type")
      );
    }
    cb(null, true);
  },
}).fields([
  { name: "profilePic", maxCount: 1 },
  { name: "docs", maxCount: 3 },
  { name: "others", maxCount: 5 },
]);

// helper: delete array of disk files (paths)
async function deleteFiles(paths) {
  for (const p of paths) {
    try {
      if (fsSync.existsSync(p)) {
        await fs.unlink(p);
      }
    } catch (e) {
      // ignore individual delete errors but log
      console.warn("Failed to delete", p, e.message);
    }
  }
}

// Upload route
app.post("/upload/:userId", (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      // multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size too large" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json({ message: "Invalid file type or unexpected field" });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    // No multer error — now post-validate per-field size rules:
    // profilePic and others must be <= 2MB, docs <= 5MB (we already have global cap 5MB)
    const uploadedPaths = [];
    try {
      const files = req.files || {};
      // collect any invalid files to remove & error out
      const toRemove = [];

      // validate sizes
      if (files.profilePic) {
        for (const f of files.profilePic) {
          if (f.size > 2 * 1024 * 1024) {
            // 2MB
            toRemove.push(f.path);
            return res
              .status(400)
              .json({ message: "profilePic exceeds 2MB limit" });
          }
        }
      }
      if (files.others) {
        for (const f of files.others) {
          if (f.size > 2 * 1024 * 1024) {
            toRemove.push(f.path);
            await deleteFiles(toRemove);
            return res
              .status(400)
              .json({ message: "one of others exceeds 2MB limit" });
          }
        }
      }
      // docs are allowed up to 5MB which multer already enforces.

      // Save metadata to MongoDB
      const metadataDocs = [];
      const now = new Date();
      for (const field of Object.keys(files)) {
        for (const f of files[field]) {
          const relPath = path
            .join("uploads", path.relative(uploadBase, f.path))
            .replace(/\\/g, "/"); // cross-platform
          uploadedPaths.push({ field, path: relPath, fileSystemPath: f.path });

          metadataDocs.push({
            userId: String(req.params.userId),
            fieldname: field,
            originalname: f.originalname,
            filename: f.filename,
            path: relPath, // relative path stored
            absolutePath: f.path, // absolute path for disk ops
            size: f.size,
            mimetype: f.mimetype,
            uploadedAt: now,
          });
        }
      }

      if (metadataDocs.length > 0) {
        const result = await filesCollection.insertMany(metadataDocs);
        // build response uploaded object grouped by field
        const uploaded = {};
        for (const doc of metadataDocs) {
          uploaded[doc.fieldname] = uploaded[doc.fieldname] || [];
          uploaded[doc.fieldname].push(doc.path);
        }

        return res.json({
          message: "Files uploaded successfully!",
          uploaded,
        });
      } else {
        return res.status(400).json({ message: "No files provided" });
      }
    } catch (e) {
      // If something fails, remove uploaded files (cleanup)
      if (uploadedPaths.length) {
        await deleteFiles(uploadedPaths.map((p) => p.fileSystemPath));
      }
      console.error("Upload handler error:", e);
      return res.status(500).json({ message: "Server error during upload" });
    }
  });
});

// GET all files for user (reads from MongoDB)
app.get("/files/:userId", async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const docs = await filesCollection.find({ userId }).toArray();
    const files = docs.map((d) => d.filename);
    res.json({ userId, files });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE specific file by filename (file stored filename), for the user
// URL: /delete/:userId/:filename
app.delete("/delete/:userId/:filename", async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const filename = req.params.filename;

    // find metadata entry
    const doc = await filesCollection.findOne({ userId, filename });
    if (!doc) {
      return res.status(404).json({ message: "File not found" });
    }

    const absolute = doc.absolutePath || path.join(__dirname, doc.path); // fallback
    // check file exists and delete
    if (fsSync.existsSync(absolute)) {
      await fs.unlink(absolute);
    } // if not exist, still remove metadata

    // remove metadata
    await filesCollection.deleteOne({ _id: doc._id });

    return res.json({ message: "File deleted successfully!" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// Optional: DELETE all files for a user (helpful)
app.delete("/delete/:userId", async (req, res) => {
  try {
    const userId = String(req.params.userId);
    const docs = await filesCollection.find({ userId }).toArray();

    // delete files from disk
    const toDelete = docs.map(
      (d) => d.absolutePath || path.join(__dirname, d.path)
    );
    await deleteFiles(toDelete);

    // delete metadata
    await filesCollection.deleteMany({ userId });

    return res.json({ message: "All files for user deleted successfully!" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// global error handler for unexpected errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mongo connected to: ${MONGO_URI}/${DB_NAME} (if started)`);
});
