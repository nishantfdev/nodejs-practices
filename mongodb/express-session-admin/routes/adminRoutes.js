const express = require("express");
const router = express.Router();
const { getSessions } = require("../controllers/adminController");
const authorizeRole = require("../middleware/authorizeRole");

router.get("/sessions", authorizeRole("admin"), getSessions);

module.exports = router;
