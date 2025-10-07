require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

let db, usersCollection, sessionsCollection;

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
client.connect().then(() => {
  db = client.db();
  usersCollection = db.collection("users");
  sessionsCollection = db.collection("sessions");
  console.log("✅ MongoDB connected");

  // Create TTL index for auto-expiring sessions (optional but recommended)
  sessionsCollection.createIndex({ expires: 1 }, { expireAfterSeconds: 0 });

  // Setup session middleware after DB is ready
  const store = new MongoNativeStore(sessionsCollection);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: { maxAge: 3600000 }, // 1 hour
    })
  );

  // Routes
  app.get("/login", (req, res) => {
    res.render("login", { error: null });
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });

    if (!user || user.password !== password) {
      return res.render("login", { error: "Invalid credentials" });
    }

    req.session.user = { username: user.username, role: user.role };
    res.redirect(user.role === "admin" ? "/admin" : "/");
  });

  app.get("/admin", async (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
      return res.status(403).send("Access denied");
    }
    //*********session store ---MangoNativeStore Custom class execution starts -----
    const sessions = await sessionsCollection.find({}).toArray();
    const formatted = sessions.map((s) => ({
      id: s._id,
      username: s.session?.user?.username || "Unknown",
      expires: s.expires,
    }));

    res.render("admin", { sessions: formatted });
  });

  app.get("/", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.send(
      `Welcome ${req.session.user.username}, you are logged in as ${req.session.user.role}`
    );
  });

  app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.send("Error logging out");
      }
      res.redirect("/login");
    });
  });

  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
});

// MongoDB connection monitoring
client.on("close", () => console.log("⚠️ MongoDB connection closed"));
client.on("error", (err) => console.error("❌ MongoDB error:", err));

// Custom session store class
class MongoNativeStore extends session.Store {
  constructor(collection) {
    super();
    this.collection = collection;
  }

  async get(sid, cb) {
    try {
      const doc = await this.collection.findOne({ _id: sid });
      cb(null, doc?.session);
    } catch (err) {
      cb(err);
    }
  }

  async set(sid, sessionData, cb) {
    try {
      await this.collection.updateOne(
        { _id: sid },
        {
          $set: {
            session: sessionData,
            expires: new Date(Date.now() + 3600000),
          },
        },
        { upsert: true }
      );
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  async destroy(sid, cb) {
    try {
      await this.collection.deleteOne({ _id: sid });
      cb(null);
    } catch (err) {
      cb(err);
    }
  }
}
