// server.js

// 1. Import Express
const express = require("express");
const path = require("path");

// 2. Initialize the Express app
const app = express();
const PORT = 3000;

// The 'extended: true' option allows for rich objects and arrays to be encoded.
app.use(express.urlencoded({ extended: true }));

// This middleware parses incoming requests with JSON payloads.
// Useful if you're also building an API that accepts JSON.
app.use(express.json());

// Middleware to serve static files (like our index.html)
app.use(express.static(path.join(__dirname)));

// Route to serve the HTML form
app.get("/", (req, res) => {
  // We'll send the index.html file when someone visits the root URL
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to handle the form submission
app.post("/submit-form", (req, res) => {
  // The parsed form data is available in the `req.body` object.
  const name = req.body.name;
  const email = req.body.email;

  console.log("Received form data:");
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);

  res.send(`
        <div style="font-family: Inter, sans-serif; text-align: center; padding: 40px;">
            <h1 style="color: #2c3e50;">Thank you, ${name}!</h1>
            <p style="color: #34495e;">We have received your registration with the email: ${email}</p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px;">Go Back</a>
        </div>
    `);
});

// 5. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
