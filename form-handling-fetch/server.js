// server.js
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public")); // Serve static files
app.use(express.json()); // Parse JSON body

app.post("/submit", (req, res) => {
  const { username, email } = req.body;
  console.log("Received:", username, email);
  res.send(`Hello ${username}, your email ${email} was received.`);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
