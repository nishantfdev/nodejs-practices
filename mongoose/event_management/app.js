const express = require("express");
const mongoose = require("mongoose");
const eventRoutes = require("./eventRoutes");

const app = express();
app.use(express.json());
app.use("/api", eventRoutes);

mongoose
  .connect("mongodb://localhost:27017/eventdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(3000, () => console.log("Server running on port 3000"));
