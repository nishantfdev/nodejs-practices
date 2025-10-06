require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("./config/session");

const app = express();
app.use(express.json());
app.use(session);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");
  res.send(
    `Welcome ${req.session.user.username}, you are logged in as ${req.session.user.role}`
  );
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
