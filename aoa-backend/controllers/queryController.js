const Query    = require("../models/Query");
const Progress = require("../models/Progress");
const { askSmartEngine } = require("../utils/smartEngine");
const { logUnknownQuery } = require("../utils/selfLearning");

const handleQuery = async (req, res) => {
  try {
    const { query, inputMode = "text" } = req.body;
    if (!query?.trim())
      return res.status(400).json({ message: "Query cannot be empty" });

    const userId = req.user?.id || null;

    console.log("─".repeat(50));
    console.log("📨 Query:", query);

    // Run Smart Engine
    const result = await askSmartEngine(query);

    if (!result.success) {
      await logUnknownQuery(query, userId);
      return res.json({
        success: false,
        message: "❓ Could not process query. Please try again.",
      });
    }

    const data = result.data;

    // Log to DB
    await Query.create({
      userId,
      queryText:     query,
      matchedTopic:  data.topic || null,
      responseGiven: true,
      inputMode,
    });

    // Update progress
    if (userId && data.topic) {
      await Progress.findOneAndUpdate(
        { userId },
        {
          $addToSet: { topicsViewed: data.topic },
          $inc:      { totalQueries: 1 },
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return res.json({
      success: true,
      source:  "rag-clrs",
      structured: {
        type:            data.type,
        topic:           data.topic,
        definition:      data.answer,
        keyPoints:       data.keyPoints  || [],
        timeComplexity:  data.complexity?.time  || null,
        spaceComplexity: data.complexity?.space || null,
        followUp:        data.followUp   || [],
        chapters:        data.chapters   || [],
        steps:           [],
      },
    });

  } catch (err) {
    console.error("💥 Query error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { handleQuery };