const express = require("express");
const methodOverride = require("method-override");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.use("/", productRoutes);

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
