const mongoose = require("mongoose");
exports.getSessions = async (req, res) => {
  const Session = mongoose.connection.collection("sessions");
  const sessions = await Session.find({}).toArray();

  const formatted = sessions.map((s) => {
    const sessionData = JSON.parse(s.session);
    return {
      username: sessionData.user?.username || "Unknown",
      loginTime: new Date(s.lastModified),
      expiresAt: new Date(s.expires),
    };
  });

  res.render("adminPanel", { sessions: formatted });
};
