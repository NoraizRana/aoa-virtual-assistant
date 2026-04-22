const Topic    = require("../models/Topic");
const Query    = require("../models/Query");
const Progress = require("../models/Progress");
const { askAI, checkOllama }  = require("../utils/aiEngine");
const { matchTopic }          = require("../utils/matcher");
const { detectIntent }        = require("../utils/intentDetector");
const { parseRecurrence, solveMasterTheorem, getComplexity } = require("../utils/mathSolver");
const { logUnknownQuery }     = require("../utils/selfLearning");
const {
  buildConceptualResponse,
  buildProceduralResponse,
  buildComparativeResponse,
  buildMathResponse,
  buildComplexityResponse,
} = require("../utils/responseBuilder");

// ── Check Ollama once on server startup ──────────────────────────
let ollamaAvailable = false;
checkOllama().then((status) => {
  ollamaAvailable = status;
  console.log("🔌 Ollama available:", ollamaAvailable);
});

const handleQuery = async (req, res) => {
  try {
    const { query, inputMode = "text" } = req.body;
    if (!query?.trim())
      return res.status(400).json({ message: "Query cannot be empty" });

    const userId = req.user?.id || null;

    console.log("─".repeat(50));
    console.log("📨 Query:", query);
    console.log("🔌 Ollama available:", ollamaAvailable);

    // ── Re-check Ollama if it was not available at startup ────────
    if (!ollamaAvailable) {
      ollamaAvailable = await checkOllama();
      console.log("🔄 Re-checked Ollama:", ollamaAvailable);
    }

    // ════════════════════════════════════════════════════════════
    // PATH A — Use Llama3 AI (when Ollama is running)
    // ════════════════════════════════════════════════════════════
    if (ollamaAvailable) {
      console.log("🤖 Routing to Llama3 AI...");

      const aiResult = await askAI(query);

      if (aiResult.success) {
        const data = aiResult.data;
        console.log("✅ AI responded — Topic:", data.topic);

        // Save to DB
        await Query.create({
          userId,
          queryText:     query,
          matchedTopic:  data.topic || null,
          responseGiven: true,
          inputMode,
        });

        // Update progress if logged in
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
          source:  "llama3",
          structured: {
            type:            data.type       || "conceptual",
            topic:           data.topic      || "AoA",
            definition:      data.answer     || "",
            keyPoints:       data.keyPoints  || [],
            timeComplexity:  data.complexity?.time  || null,
            spaceComplexity: data.complexity?.space || null,
            followUp:        data.followUp   || [],
            steps:           [],
          },
        });
      }

      // AI call failed — fall through to knowledge base
      console.log("⚠️  AI call failed:", aiResult.error);
      console.log("📚 Falling back to knowledge base...");
    }

    // ════════════════════════════════════════════════════════════
    // PATH B — Knowledge Base Fallback (when Ollama is off)
    // ════════════════════════════════════════════════════════════
    console.log("📚 Using knowledge base");

    const intent     = detectIntent(query);
    const queryLower = query.toLowerCase();
    console.log(`🎯 Intent: ${intent}`);

    // ── Handle Mathematical queries ───────────────────────────────
    if (intent === "mathematical") {
      const parsed = parseRecurrence(query);
      if (parsed.found) {
        const result = solveMasterTheorem(parsed.a, parsed.b, parsed.k);
        await Query.create({
          userId, queryText: query,
          matchedTopic: "Master Theorem", responseGiven: true, inputMode,
        });
        return res.json({
          success: true,
          source:  "math-solver",
          structured: buildMathResponse(result),
        });
      }

      const complexity = getComplexity(query);
      if (complexity) {
        await Query.create({
          userId, queryText: query,
          matchedTopic: complexity.algorithm, responseGiven: true, inputMode,
        });
        return res.json({
          success: true,
          source:  "math-solver",
          structured: buildComplexityResponse(complexity),
        });
      }
    }

    // ── Load all topics ───────────────────────────────────────────
    const allTopics = await Topic.find();

    // ── Handle Comparative queries ────────────────────────────────
    if (intent === "comparative") {
      const vsMatch = queryLower.match(
        /(.+?)\s+(?:vs\.?|versus|compare(?:d)? to|and)\s+(.+)/i
      );
      if (vsMatch) {
        const topic1 = matchTopic(vsMatch[1], allTopics);
        const topic2 = matchTopic(vsMatch[2], allTopics);
        if (topic1 && topic2) {
          await Query.create({
            userId, queryText: query,
            matchedTopic: `${topic1.name} vs ${topic2.name}`,
            responseGiven: true, inputMode,
          });
          return res.json({
            success: true,
            source:  "knowledge-base",
            structured: buildComparativeResponse(topic1, topic2),
          });
        }
      }
    }

    // ── General topic match ───────────────────────────────────────
    const matched = matchTopic(query, allTopics);

    await Query.create({
      userId,
      queryText:     query,
      matchedTopic:  matched ? matched.name : null,
      responseGiven: !!matched,
      inputMode,
    });

    if (userId && matched) {
      await Progress.findOneAndUpdate(
        { userId },
        {
          $addToSet: { topicsViewed: matched.name },
          $inc:      { totalQueries: 1 },
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // ── No match found ────────────────────────────────────────────
    if (!matched) {
      await logUnknownQuery(query, userId);
      return res.json({
        success: false,
        message:
          "❓ I couldn't find that topic.\n\n" +
          "💡 Tip: Start Ollama for full AI responses:\n" +
          "   ollama serve\n\n" +
          "Currently I can answer:\n" +
          "• Sorting: Merge Sort, Quick Sort, Bubble Sort, Heap Sort\n" +
          "• Searching: Binary Search\n" +
          "• Graphs: Dijkstra, BFS, DFS\n" +
          "• Concepts: Dynamic Programming, Big-O, Master Theorem",
      });
    }

    // ── Build response based on intent ────────────────────────────
    const structured = intent === "procedural"
      ? buildProceduralResponse(matched)
      : buildConceptualResponse(matched);

    return res.json({
      success: true,
      source:  "knowledge-base",
      structured,
    });

  } catch (err) {
    console.error("💥 Query error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { handleQuery };