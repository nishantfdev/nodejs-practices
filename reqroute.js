const http = require("http");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write(`
        <html>
        <head><title>Nodejs Tutorial</title>
        <body>
        <h1>Welcome to Nodejs Totorial</h1>
        </body>
        </html>\n`);
    res.end();
  } else if (req.url === "/about") {
    res.setHeader("Content-Type", "text/plain");
    res.write("About Page\n");
    res.end();
  } else {
    //   this status code used for redirection
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end("Page not found.\n");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
