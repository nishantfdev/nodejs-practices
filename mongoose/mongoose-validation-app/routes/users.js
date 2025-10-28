const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/", async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
