// controllers/authController.js
const User = require("../models/User");

exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || user.password !== password) {
    return res.render("login", { error: "Invalid credentials" });
  }

  req.session.user = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  res.redirect(user.role === "admin" ? "/admin/sessions" : "/");
};
