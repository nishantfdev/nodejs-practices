const express = require("express");
const app = express();
const port = 3000;

// In-memory storage
const notes = [];

// Middleware to parse JSON
app.use(express.json());

// POST /notes - Add a new note
app.post("/notes", (req, res) => {
  const { note } = req.body;

  // { "note": "Buy milk" }
  if (typeof note !== "string") {
    return res
      .status(400)
      .json({ error: 'Invalid JSON: "note" must be a string' });
  }

  notes.push(note);
  res.status(201).json({ message: "Note added", note });
});

// GET /notes - Return all notes
app.get("/notes", (req, res) => {
  res.json({ notes });
});

// Error handler for malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Malformed JSON" });
  }
  next();
});

// Start server
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
