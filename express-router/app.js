// app.js

const express = require("express");
const app = express();
const port = 3000;

// Import the products router
const productsRouter = require("./routes/products");

// Use the products router at the /api/products endpoint
app.use("/api/products", productsRouter);

// Basic home route for testing
app.get("/", (req, res) => {
  res.send(
    "Welcome to the API! Try visiting /api/products or /api/products/electronics/1"
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
