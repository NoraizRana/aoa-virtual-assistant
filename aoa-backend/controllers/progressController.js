const Progress = require("../models/Progress");
const Query = require("../models/Query");

// GET /progress
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await Progress.findOne({ userId });
    const recentQueries = await Query.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("queryText matchedTopic createdAt inputMode");

    res.json({
      topicsViewed: progress ? progress.topicsViewed : [],
      totalQueries: progress ? progress.totalQueries : 0,
      lastActive: progress ? progress.lastActive : null,
      recentQueries,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getProgress };