const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    platform: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      default: "Uncategorized",
    },

    difficulty: {
      type: String,
      default: "Unknown",
    },

    companies: {
      type: [String],
      default: [],
    },

    revision: {
      type: Boolean,
      default: false,
    },

    solvedAt: {
      type: Date,
      required: true,
    },

    problemUrl: {
      type: String,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);



const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;