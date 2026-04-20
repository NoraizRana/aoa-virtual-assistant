const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  id:          String,
  name:        { type: String, required: true },
  aliases:     [String],
  keywords:    [String],
  category:    String,
  difficulty:  String,
  definition:  String,
  intuition:   String,
  steps:       [String],
  pseudocode:  String,
  example:     mongoose.Schema.Types.Mixed,
  complexity:  mongoose.Schema.Types.Mixed,
  recurrence_solution: mongoose.Schema.Types.Mixed,
  advantages:  [String],
  disadvantages: [String],
  comparisons: mongoose.Schema.Types.Mixed,
  approaches:  mongoose.Schema.Types.Mixed,
  classic_problems: [String],
  notations:   mongoose.Schema.Types.Mixed,
  common_complexities: [mongoose.Schema.Types.Mixed],
  cases:       [mongoose.Schema.Types.Mixed],
  examples:    [mongoose.Schema.Types.Mixed],
  use_cases:   [String],
  limitations: [String],
  clo_mapping: [String],
  related_topics: [String],
}, { timestamps: true });

module.exports = mongoose.model("Topic", topicSchema);