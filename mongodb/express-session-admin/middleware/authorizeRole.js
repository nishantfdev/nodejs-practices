module.exports = function authorizeRole(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  };
};
