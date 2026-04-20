const express = require("express");
const router = express.Router();
const { getAllTopics, getTopicById } = require("../controllers/topicController");

router.get("/", getAllTopics);
router.get("/:id", getTopicById);

module.exports = router;