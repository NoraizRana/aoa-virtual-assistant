const mongoose = require("mongoose");

const unknownQuerySchema = new mongoose.Schema(
  {
    queryText: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    frequency: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["unanswered", "reviewed", "added"],
      default: "unanswered",
    },
    lastAsked: { type: Date, default: Date.now },
    suggestedTopic: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UnknownQuery", unknownQuerySchema);