const express = require("express");
const router = express.Router();
const Event = require("./models/Event");

// Create
router.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
router.get("/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Read one
router.get("/events/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

// Update
router.put("/events/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
router.delete("/events/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event deleted" });
});

// 🎁 Bonus: Events by venue
router.get("/events/venue/:venueName", async (req, res) => {
  const events = await Event.find({ venue: req.params.venueName });
  res.json(events);
});

module.exports = router;
