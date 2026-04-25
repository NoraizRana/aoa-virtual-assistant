const Query    = require("../models/Query");
const Progress = require("../models/Progress");
const { processQuery } = require("../utils/productionEngine");
const { logUnknownQuery } = require("../utils/selfLearning");

const handleQuery = async (req, res) => {
  try {
    const { query, inputMode = "text" } = req.body;
    if (!query?.trim())
      return res.status(400).json({ message: "Query cannot be empty" });

    const userId = req.user?.id || null;
    const result = await processQuery(query);

    if (!result.success) {
      await logUnknownQuery(query, userId);
      return res.json({
        success: false,
        message: "❓ Could not process your query. Please rephrase and try again.",
      });
    }

    const data = result.data;

    await Query.create({
      userId,
      queryText:     query,
      matchedTopic:  data.topic || null,
      responseGiven: true,
      inputMode,
    });

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
      source:  "production-engine",
      structured: {
        type:            data.type,
        topic:           data.topic,
        definition:      data.answer,
        steps:           data.steps           || [],
        pseudocode:      data.pseudocode       || null,
        example:         data.example         || null,
        keyPoints:       data.keyPoints        || [],
        timeComplexity:  data.timeComplexity   || null,
        spaceComplexity: data.spaceComplexity  || null,
        followUp:        data.followUp         || [],
        chapters:        data.chapters         || [],
        source:          data.source           || "CLRS",
      },
    });

  } catch (err) {
    console.error("💥 Controller error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { handleQuery };