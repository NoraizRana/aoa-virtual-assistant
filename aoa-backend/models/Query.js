const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,   // allow guest queries
    },
    queryText: {
      type: String,
      required: true,
    },
    matchedTopic: {
      type: String,
      default: null,
    },
    responseGiven: {
      type: Boolean,
      default: false,
    },
    inputMode: {
      type: String,
      enum: ["text", "voice"],
      default: "text",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Query", querySchema);