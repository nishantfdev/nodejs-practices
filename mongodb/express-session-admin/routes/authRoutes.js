// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { showLogin, login } = require("../controllers/authController");

router.get("/login", showLogin);
router.post("/login", login);

module.exports = router;
