/**
 * Self-Learning Engine
 * Logs unanswered queries, tracks weak responses,
 * and allows knowledge base expansion
 */

const Query = require("../models/Query");
const UnknownQuery = require("../models/UnknownQuery");

// Log a query that was NOT answered
const logUnknownQuery = async (queryText, userId = null) => {
  try {
    const existing = await UnknownQuery.findOne({
      queryText: { $regex: new RegExp(queryText, "i") },
    });

    if (existing) {
      // Increment frequency if seen before
      existing.frequency += 1;
      existing.lastAsked = new Date();
      await existing.save();
    } else {
      await UnknownQuery.create({
        queryText,
        userId,
        frequency: 1,
        status: "unanswered",
      });
    }
  } catch (err) {
    console.error("Self-learning log error:", err.message);
  }
};

// Get top unanswered queries (for admin review)
const getTopUnanswered = async (limit = 10) => {
  return await UnknownQuery.find({ status: "unanswered" })
    .sort({ frequency: -1 })
    .limit(limit);
};

module.exports = { logUnknownQuery, getTopUnanswered };