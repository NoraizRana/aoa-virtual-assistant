const Topic = require("../models/Topic");
const Query = require("../models/Query");
const Progress = require("../models/Progress");
const { matchTopic } = require("../utils/matcher");
const { detectIntent } = require("../utils/intentDetector");
const { parseRecurrence, solveMasterTheorem, getComplexity } = require("../utils/mathSolver");
const { logUnknownQuery } = require("../utils/selfLearning");
const {
  buildConceptualResponse,
  buildProceduralResponse,
  buildComparativeResponse,
  buildMathResponse,
  buildComplexityResponse,
} = require("../utils/responseBuilder");

const handleQuery = async (req, res) => {
  try {
    const { query, inputMode = "text" } = req.body;
    if (!query?.trim())
      return res.status(400).json({ message: "Query cannot be empty" });

    const userId = req.user?.id || null;

    // ── 1. Detect Intent ──────────────────────────────────────────
    const intent = detectIntent(query);
    console.log(`🎯 Intent: ${intent} | Query: "${query}"`);

    // ── 2. Handle Mathematical queries first ──────────────────────
    if (intent === "mathematical") {
      // Try to solve recurrence relation
      const parsed = parseRecurrence(query);
      if (parsed.found) {
        const result = solveMasterTheorem(parsed.a, parsed.b, parsed.k);
        await Query.create({ userId, queryText: query,
          matchedTopic: "Master Theorem", responseGiven: true, inputMode });
        return res.json({ success: true,
          structured: buildMathResponse(result) });
      }

      // Try complexity lookup
      const complexity = getComplexity(query);
      if (complexity) {
        await Query.create({ userId, queryText: query,
          matchedTopic: complexity.algorithm, responseGiven: true, inputMode });
        return res.json({ success: true,
          structured: buildComplexityResponse(complexity) });
      }
    }

    // ── 3. Load topics and match ──────────────────────────────────
    const allTopics = await Topic.find();
    const queryLower = query.toLowerCase();

    // ── 4. Handle Comparative queries ─────────────────────────────
    if (intent === "comparative") {
      const vsMatch = queryLower.match(
        /(.+?)\s+(?:vs\.?|versus|compare(?:d)? to|and)\s+(.+)/i
      );
      if (vsMatch) {
        const topic1 = matchTopic(vsMatch[1], allTopics);
        const topic2 = matchTopic(vsMatch[2], allTopics);
        if (topic1 && topic2) {
          await Query.create({ userId, queryText: query,
            matchedTopic: `${topic1.name} vs ${topic2.name}`,
            responseGiven: true, inputMode });
          return res.json({ success: true,
            structured: buildComparativeResponse(topic1, topic2) });
        }
      }
    }

    // ── 5. General topic match ────────────────────────────────────
    const matched = matchTopic(query, allTopics);

    await Query.create({
      userId, queryText: query,
      matchedTopic: matched ? matched.name : null,
      responseGiven: !!matched, inputMode,
    });

    if (userId && matched) {
      await Progress.findOneAndUpdate(
        { userId },
        { $addToSet: { topicsViewed: matched.name },
          $inc: { totalQueries: 1 }, lastActive: new Date() },
        { upsert: true, new: true }
      );
    }

    if (!matched) {
      // Self-learning: log what we couldn't answer
      await logUnknownQuery(query, userId);
      return res.json({
        success: false,
        message: "❓ I couldn't find that topic in my knowledge base. This query has been logged and will help improve the system.\n\nCurrently I can answer questions about:\n• Sorting: Merge Sort, Quick Sort, Bubble Sort\n• Searching: Binary Search\n• Graphs: Dijkstra, BFS, DFS\n• Concepts: Dynamic Programming, Big-O, Master Theorem",
      });
    }

    // ── 6. Build response based on intent ─────────────────────────
    let structured;
    if (intent === "procedural") {
      structured = buildProceduralResponse(matched);
    } else {
      structured = buildConceptualResponse(matched);
    }

    return res.json({ success: true, structured });

  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { handleQuery };