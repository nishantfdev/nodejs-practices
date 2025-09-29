const express = require("express");
const connectDB = require("../db/connect");
const router = express.Router();

let products;

// immediately executes an asynchronous function using an Immediately Invoked Function Expression (IIFE)
(async () => {
  const db = await connectDB();
  products = db.collection("products");
})();

// Home - Display all products
router.get("/", async (req, res) => {
  const allProducts = await products.find().toArray();
  res.render("index", { products: allProducts });
});

// Add product form
router.get("/add", (req, res) => {
  res.render("add");
});

// Create product
router.post("/add", async (req, res) => {
  await products.insertOne(req.body);
  res.redirect("/");
});

// Edit product form
router.get("/edit/:id", async (req, res) => {
  const { ObjectId } = require("mongodb");
  const product = await products.findOne({ _id: new ObjectId(req.params.id) });
  res.render("edit", { product });
});

// Update product
router.put("/edit/:id", async (req, res) => {
  const { ObjectId } = require("mongodb");
  await products.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body }
  );
  res.redirect("/");
});

// Delete product
router.delete("/delete/:id", async (req, res) => {
  const { ObjectId } = require("mongodb");
  await products.deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/");
});

// View product details
router.get("/product/:id", async (req, res) => {
  const { ObjectId } = require("mongodb");
  const product = await products.findOne({ _id: new ObjectId(req.params.id) });
  res.render("detail", { product });
});

module.exports = router;
