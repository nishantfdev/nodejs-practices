// Static Server Creation for serving static html files

const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// About route
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

// Contact route
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Express Static Middleware Code
// app.use(express.static(path.join(__dirname, "public")));
