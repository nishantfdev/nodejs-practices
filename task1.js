const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const server = http.createServer((req, res) => {
  //  commonly used in Node.js HTTP server code to check the details of an incoming HTTP request. The req object represents the request sent by a client (such as a web browser) to the server.
  if (req.method === "GET" && req.url === "/") {
    //    function is asynchronous, meaning it does not block the rest of the program while it reads the file.

    // used to construct an absolute path to index.html in the same directory as the current script. __dirname is a special variable in Node.js that contains the directory name of the current module, and path.join safely combines it with 'index.html' to avoid issues with different operating systems' path separators.

    // The second argument is a callback function that will be called once the file has been read. This function receives two parameters: err and data. If an error occurs (for example, if the file does not exist), err will contain error information; otherwise, data will contain the contents of the file as a Buffer object.

    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        //   Sets response headers and status code
        res.writeHead(500, { "Content-Type": "text/plain" });

        //    Sends the response and closes the connection.
        return res.end("Error loading HTML");
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "POST") {
    let body = "";
    // This line listens for the "data" event on the req (request) object, which is triggered whenever a new chunk of data is received from the client. In Node.js, incoming POST request data is sent in small pieces called "chunks," especially for larger payloads.
    req.on("data", (chunk) => (body += chunk));

    // Once all data has been received, the "end" event will fire, signaling that the request body is complete and ready to be processed.
    req.on("end", () => {
      const { num1, num2 } = querystring.parse(body);
      //  num1=5&num2=10
      const a = parseFloat(num1);
      const b = parseFloat(num2);
      let result;

      switch (req.url) {
        case "/add":
          result = a + b;
          break;
        case "/sub":
          result = a - b;
          break;
        case "/mul":
          result = a * b;
          break;
        case "/div":
          result = b !== 0 ? a / b : "Division by zero not allowed";
          break;
        default:
          result = "Invalid operation";
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h2>Result: ${result}</h2><a href="/">Back</a>`);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
