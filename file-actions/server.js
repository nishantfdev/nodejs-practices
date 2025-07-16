const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const FILE_DIR = path.join(__dirname, "files");

// Create the 'files' directory if it doesn't exist
if (!fs.existsSync(FILE_DIR)) {
  fs.mkdirSync(FILE_DIR);
}

const server = http.createServer((req, res) => {
  const method = req.method;
  const fileName = "test.txt";
  const filePath = path.join(FILE_DIR, fileName);
  console.log(filePath);
  const defaultContent = "This is the default content written by the server.";

  // 📝 Create test.txt with default content
  if (req.url.startsWith("/create") && method === "GET") {
    fs.writeFile(filePath, defaultContent, (err) => {
      if (err) {
        res.writeHead(500);
        return res.end("Failed to create the file");
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`"${fileName}" created with default content`);
    });

    // 📖 Read test.txt content
  } else if (req.url.startsWith("/read") && method === "GET") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("File not found");
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(data);
    });

    // 🗑️ Delete test.txt
  } else if (req.url.startsWith("/delete") && method === "GET") {
    fs.unlink(filePath, (err) => {
      if (err) {
        res.writeHead(404);
        return res.end("File not found or already deleted");
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`"${fileName}" deleted successfully`);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Endpoint not found");
  }
});

server.listen(PORT, () => {
  console.log(`📡 Server is running at http://localhost:${PORT}`);
});
