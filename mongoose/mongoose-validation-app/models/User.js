const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required. Oops."],
    minlength: [4, "Username must be at least 4 characters long."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    validate: {
      validator: function (value) {
        return /\S+@\S+\.\S+/.test(value);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  tags: {
    type: [String],
    validate: {
      validator: (val) => val.length <= 3,
      message: "You can specify up to 3 tags.",
    },
  },
});

// Async validator for unique username
// userSchema.path("username").validate({
//   validator: async function (value) {
//     const existing = await mongoose.models.User.findOne({ username: value });
//     return !existing;
//   },
//   message: "Username is already taken.",
// });

// Middleware for duplicate key errors
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("There is a duplicate key error."));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
