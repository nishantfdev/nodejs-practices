const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
const users = [
  // A demo admin and user
  {
    id: 1,
    username: "alice",
    password: bcrypt.hashSync("pass123", 10),
    role: "admin",
  },
  {
    id: 2,
    username: "bob",
    password: bcrypt.hashSync("pass123", 10),
    role: "user",
  },
];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    name: "sid",
    secret: "yourSessionSecret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 30 }, // 30 minutes
  })
);

// Middleware: ensure user is logged in
function ensureAuthenticated(req, res, next) {
  console.log(req.session.userId);
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// Middleware: ensure user has admin role
function ensureAdmin(req, res, next) {
  const user = users.find((u) => u.id === req.session.userId);
  if (user && user.role === "admin") {
    return next();
  }
  res.status(403).send("Access denied: Admins only");
}

// Render login form
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Handle login form submission
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Invalid credentials" });
  }

  req.session.userId = user.id;
  res.redirect("/dashboard");
});

// User dashboard (authenticated)
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  const user = users.find((u) => u.id === req.session.userId);
  res.render("dashboard", { user });
});

// Admin-only endpoint
app.get("/admin", ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render("admin");
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Error logging out");
    res.clearCookie("sid");
    res.redirect("/login");
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
