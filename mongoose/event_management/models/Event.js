const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value > new Date(),
      message: "Event date must be in the future.",
    },
  },
  venue: {
    type: String,
    required: true,
  },
  participants: {
    type: [String],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one participant must be added.",
    },
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: [0, "Ticket price must be positive."],
    max: [10000, "Ticket price must be less than 10,000."],
  },
});

// 🔁 Pre-save hook: Capitalize event name
eventSchema.pre("save", function (next) {
  this.name = this.name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  next();
});

// ✅ Post-save hook: Log success
eventSchema.post("save", function (doc) {
  console.log("Event added successfully.");
});

module.exports = mongoose.model("Event", eventSchema);
