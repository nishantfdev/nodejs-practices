const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  //  /greet?name=Rahul&age=25
  const parsedUrl = url.parse(req.url, true); // true to get query as object

  /* {
  pathname: '/greet',
  query: {
    name: 'Rahul',
    age: '25'
  } */

  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === "/greet") {
    const name = query.name || "Guest";
    console.log(parsedUrl);
    console.log(parsedUrl.query);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Hello, ${name}!`);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Route not found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
