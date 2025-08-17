// server.js - Main server file
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// Configuration
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const PORT = process.env.PORT || 3000;

// In-memory user database (replace with real database in production)
let users = [];

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      res.clearCookie("token");
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

// Redirect authenticated users away from auth pages
// preventing logged-in users from accessing the login/signup form.
const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect("/dashboard");
    } catch (error) {
      res.clearCookie("token");
    }
  }
  next();
};

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("login", { error: null, success: null });
});

app.get("/signup", redirectIfAuthenticated, (req, res) => {
  res.render("signup", { error: null, success: null });
});

app.get("/dashboard", authenticateToken, (req, res) => {
  const user = req.user;

  // Calculate days active
  const createdDate = new Date(user.createdAt);
  const today = new Date();
  const daysActive = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));

  const userData = {
    name: user.name,
    email: user.email,
    memberSince: user.createdAt.toLocaleDateString(),
    lastLogin: user.lastLogin ? user.lastLogin.toLocaleString() : "Never",
    loginCount: user.loginCount,
    daysActive: daysActive,
  };

  res.render("dashboard", { user: userData });
});

// POST routes
app.post("/signup", redirectIfAuthenticated, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.render("signup", {
        error: "All fields are required!",
        success: null,
      });
    }

    if (password.length < 6) {
      return res.render("signup", {
        error: "Password must be at least 6 characters long!",
        success: null,
      });
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.render("signup", {
        error: "User with this email already exists!",
        success: null,
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
      name: name,
      email: email,
      password: hashedPassword,
      createdAt: new Date(),
      loginCount: 0,
      lastLogin: null,
    };

    users.push(newUser);

    res.render("login", {
      error: null,
      success: "Account created successfully! Please sign in.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.render("signup", {
      error: "Internal server error. Please try again.",
      success: null,
    });
  }
});

app.post("/login", redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.render("login", {
        error: "Email and password are required!",
        success: null,
      });
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.render("login", {
        error: "Invalid email or password!",
        success: null,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render("login", {
        error: "Invalid email or password!",
        success: null,
      });
    }

    // Update user login info
    user.loginCount++;
    user.lastLogin = new Date();

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", {
      error: "Internal server error. Please try again.",
      success: null,
    });
  }
});

app.post("/logout", authenticateToken, (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// API endpoints for AJAX requests
app.get("/api/user", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    name: user.name,
    email: user.email,
    loginCount: user.loginCount,
    memberSince: user.createdAt,
    lastLogin: user.lastLogin,
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).render("error", {
    error: "Page not found",
    message: "The page you are looking for does not exist.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
