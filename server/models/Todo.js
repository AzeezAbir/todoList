const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Todo", TodoSchema);
