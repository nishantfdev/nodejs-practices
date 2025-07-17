//Serve the JSON data

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Utility: Load and parse product data
function getProductsData() {
  const filePath = path.join(__dirname, "products.json");
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

// app.use((req, res, next) => {
//   console.log("from middleware", req.url);
//   // return res.json({ msg: "middleware called" });
//   // res.json({ msg: "response sent from middleware." });
//   // console.log("middleware called.");
//   next();
// });
// app.use((req, res, next) => {
//   console.log("from middleware 2");
//   // return res.json({ msg: "middleware called" });
//   // res.json({ msg: "response sent from middleware." });
//   // console.log("middleware called.");
//   next();
// });

// // Get all products
// app.get("/products", (req, res) => {
//   const products = getProductsData();
//   res.json(products);
// });

// Get Single product by Id
// app.get("/products/:id", (req, res) => {
//   const products = getProductsData();
//   console.log(req.params);
//   const id = parseInt(req.params.id);
//   res.json(products.filter((product) => product.id === id));
//   // res.json(products);
// });

// // Use query strings with limits
// app.get("/products", (req, res) => {
//   const products = getProductsData();
//   console.log(req.query);
//   const limit = parseInt(req.query.limit);
//   if (!isNaN(limit) && limit > 0) {
//     res.json(products.slice(0, limit));
//   } else {
//     res.json(products);
//   }
// });

// app.get("/products/category/:categoryName", (req, res) => {
//   const products = getProductsData();
//   const { categoryName } = req.params;
//   console.log(categoryName);
//   const filtedCategory = products.filter(
//     (product) => product.category.toLowerCase() == categoryName.toLowerCase()
//   );
//   res.json(filtedCategory);
// });

// Route: Filter by category and maxPrice
// http://localhost:3000/products/category/clothing
// http://localhost:3000/products/category/clothing?maxPrice=2000

app.get("/products/category/:categoryName", (req, res) => {
  const { categoryName } = req.params;
  const maxPrice = parseFloat(req.query.maxPrice);

  try {
    const products = getProductsData();

    let filtered = products.filter(
      (product) => product.category.toLowerCase() === categoryName.toLowerCase()
    );

    if (!isNaN(maxPrice)) {
      filtered = filtered.filter((product) => product.price <= maxPrice);
    }

    res.json(filtered);
  } catch (err) {
    console.error("Error reading products:", err);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

// Server listener
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
