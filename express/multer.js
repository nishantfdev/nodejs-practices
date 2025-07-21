const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Files will be saved in the 'uploads/' directory
  },
  filename: function (req, file, cb) {
    const uniqueName =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Multer middleware
const upload = multer({ storage: storage });

// 📝 POST route for article + image
app.post("/submit", upload.single("image"), (req, res) => {
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.path : "No image uploaded";

  const article = {
    title,
    content,
    imagePath,
  };

  // Save article as JSON file (demo purpose)
  fs.writeFileSync("article.json", JSON.stringify(article, null, 2));

  res.json({ message: "Article created!", article });
});

// // Route for handling single file upload
// app.post("/upload-single", upload.single("myFile"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }
//   console.log("File uploaded:", req.file);
//   console.log("Text fields:", req.body);
//   res.send("File uploaded successfully!");
// });

// // Route for handling multiple file uploads (e.g., up to 5 files named 'myFiles')
// app.post("/upload-multiple", upload.array("myFiles", 5), (req, res) => {
//   if (!req.files || req.files.length === 0) {
//     return res.status(400).send("No files uploaded.");
//   }
//   console.log("Files uploaded:", req.files);
//   console.log("Text fields:", req.body);
//   res.send("Files uploaded successfully!");
// });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Make sure the 'uploads' directory exists
const fs = require("fs");
const dir = "./uploads";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// // Here’s a code snippet that allows JPEG, PNG, and GIF formats:
// const fileFilter = (req, file, cb) => {
//   // Accept only specific mime types
//   const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
// //  const allowedTypes = [
// //     "application/pdf",
// //     "application/msword",                      // .doc
// //     "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
// //   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true); // Accept the file
//   } else {
//     cb(new Error("Unsupported file format"), false); // Reject the file
//   }
// };

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
//   }),
// // limits: { fileSize: 2 * 1024 * 1024 } // 2MB
//   fileFilter: fileFilter
// });
