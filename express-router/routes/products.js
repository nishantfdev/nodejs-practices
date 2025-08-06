// /routes/products.js

const express = require("express");
const router = express.Router();

// A simple in-memory data store for demonstration
const products = {
  electronics: [
    { id: 1, name: "Laptop", price: 1200 },
    { id: 2, name: "Smartphone", price: 800 },
  ],
  books: [
    { id: 1, name: "The Hitchhiker's Guide to the Galaxy", price: 15 },
    { id: 2, name: "Dune", price: 20 },
  ],
};

// GET /products
// Return a list of all products
router.get("/", (req, res) => {
  // Object.values(products) retuns an array of values from products object
  // flat() method create new array with all sub array elements concatenated into it recursively.
  const allProducts = Object.values(products).flat();
  res.json(allProducts);
});

// GET /products/:category/:id
// Return a specific product from a category
router.get("/:category/:id", (req, res) => {
  const { category, id } = req.params;
  const productCategory = products[category];

  if (!productCategory) {
    return res.status(404).send("Category not found");
  }

  const product = productCategory.find((p) => p.id === parseInt(id));

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.json(product);
});

module.exports = router;
