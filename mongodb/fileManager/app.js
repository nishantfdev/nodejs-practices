const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Create upload folders if not exist
const uploadBase = path.join(__dirname, "uploads");
const folders = ["profile_pics", "documents", "others"];
folders.forEach((folder) => {
  const dir = path.join(uploadBase, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.params.userId;
    let folder = "";

    if (file.fieldname === "profilePic") folder = "profile_pics";
    else if (file.fieldname === "docs") folder = "documents";
    else folder = "others";

    const dest = path.join(uploadBase, folder, userId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },

  filename: function (req, file, cb) {
    const userId = req.params.userId;
    const timestamp = Date.now();
    const originalname = file.originalname;
    const newFilename = `${file.fieldname}-${userId}-${timestamp}-${originalname}`;
    cb(null, newFilename);
  },
});

// File validation
function fileFilter(req, file, cb) {
  const allowed = [".jpg", ".png", ".pdf", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Invalid file type"));
  }
  cb(null, true);
}

// Multer limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for docs
  },
}).fields([
  { name: "profilePic", maxCount: 1 },
  { name: "docs", maxCount: 3 },
  { name: "others", maxCount: 5 },
]);

// Upload endpoint
app.post("/upload/:userId", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size too large" });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ message: "Unexpected field" });
      }
      return res.status(400).json({ message: err.message });
    }

    const uploaded = {};
    if (req.files.profilePic) {
      uploaded.profilePic = req.files.profilePic[0].path;
    }
    if (req.files.docs) {
      uploaded.docs = req.files.docs.map((f) => f.path);
    }
    if (req.files.others) {
      uploaded.others = req.files.others.map((f) => f.path);
    }

    res.json({
      message: "Files uploaded successfully!",
      uploaded,
    });
  });
});

// Retrieve uploaded files
app.get("/files/:userId", (req, res) => {
  const userId = req.params.userId;
  let allFiles = [];

  folders.forEach((folder) => {
    const userDir = path.join(uploadBase, folder, userId);
    if (fs.existsSync(userDir)) {
      const files = fs
        .readdirSync(userDir)
        .map((f) => path.join("uploads", folder, userId, f));
      allFiles = allFiles.concat(files);
    }
  });

  res.json({
    userId,
    files: allFiles,
  });
});

// Delete a specific file
app.delete("/delete/:userId/:filename", (req, res) => {
  const { userId, filename } = req.params;
  let fileFound = false;

  // Loop through folders to check each type (profile_pics, documents, others)
  for (const folder of folders) {
    const filePath = path.join(uploadBase, folder, userId, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
      fileFound = true;
      return res.json({ message: "File deleted successfully!" });
    }
  }

  if (!fileFound) {
    return res.status(404).json({ message: "File not found" });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
