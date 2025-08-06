const http = require("http");
const fs = require("fs");
const querystring = require("querystring");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Serve the form
    fs.readFile("form.html", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "POST" && req.url === "/submit") {
    // Handle form submission
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const parsedData = querystring.parse(body);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        `<h1>Form Submitted</h1><p>Name: ${parsedData.username}</p><p>Email: ${parsedData.email}</p>`
      );
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
