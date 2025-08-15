// app.js - Main Express application
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sample data
const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
];

const siteInfo = {
  title: "My App",
  description: "A sample Node.js app with EJS partials",
  author: "John Doe",
};

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home Page",
    users: users,
    site: siteInfo,
    currentPage: "home",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us",
    site: siteInfo,
    currentPage: "about",
  });
});

app.get("/user/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).render("404", {
      title: "User Not Found",
      site: siteInfo,
    });
  }

  res.render("user-profile", {
    title: `${user.name} - Profile`,
    user: user,
    site: siteInfo,
    currentPage: "profile",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
