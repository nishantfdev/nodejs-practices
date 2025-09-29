const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;

// MongoDB setup
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "signupDB";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

// 🟢 CREATE: Show signup form
app.get("/", (req, res) => {
  res.render("signup");
});

// 🟢 CREATE: Handle signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const existingUser = await users.findOne({ email });
    if (existingUser) return res.send("User already exists");

    await users.insertOne({ name, email, password });
    res.send("Signup successful!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error signing up");
  } finally {
    await client.close();
  }
});

// 🔵 READ: Show all users
app.get("/users", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const allUsers = await users.find().toArray();
    res.render("users", { users: allUsers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  } finally {
    await client.close();
  }
});

// 🟡 UPDATE: Show update form
app.get("/edit", (req, res) => {
  res.render("edit");
});

// 🟡 UPDATE: Handle update
app.post("/update", async (req, res) => {
  const { email, name, password } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const updateFields = {};
    if (name) updateFields.name = name;
    if (password) updateFields.password = password;

    const result = await users.updateOne({ email }, { $set: updateFields });
    if (result.modifiedCount === 0) return res.send("No user updated");
    res.send("User updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  } finally {
    await client.close();
  }
});

// 🔴 DELETE: Show delete form
app.get("/delete", (req, res) => {
  res.render("delete");
});

// 🔴 DELETE: Handle delete
app.post("/delete", async (req, res) => {
  const { email } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const result = await users.deleteOne({ email });
    if (result.deletedCount === 0) return res.send("No user found to delete");
    res.send("User deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
