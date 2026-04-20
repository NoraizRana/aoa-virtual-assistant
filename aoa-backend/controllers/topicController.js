const Topic = require("../models/Topic");

// GET /topics
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().select("name category timeComplexity spaceComplexity");
    res.json({ count: topics.length, topics });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /topics/:id
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAllTopics, getTopicById };