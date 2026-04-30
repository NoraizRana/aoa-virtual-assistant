const Query    = require("../models/Query");
const Progress = require("../models/Progress");
const { findAnswer }      = require("../utils/aiEngine");
const { matchTopic }      = require("../utils/matcher");
const Topic               = require("../models/Topic");
const { parseRecurrence, solveMasterTheorem, getComplexity } = require("../utils/mathSolver");
const { buildMathResponse, buildComplexityResponse, buildConceptualResponse } = require("../utils/responseBuilder");
const { logUnknownQuery } = require("../utils/selfLearning");

// AoA domain keywords
const AOA_KEYWORDS = [
  "sort","search","algorithm","graph","tree","heap","queue",
  "complexity","big o","recurrence","merge","quick","bubble",
  "binary","dijkstra","bellman","bfs","dfs","dp","dynamic",
  "greedy","huffman","kruskal","prim","topolog","spanning",
  "insertion","counting","radix","bucket","lcs","knapsack",
  "red-black","strassen","matrix","asymptot","theta","omega",
  "master","recursion","divide","conquer","notation","traversal",
  "inorder","preorder","postorder","median","selection","hashing",
];

const isAoA = (q) => {
  const lower = q.toLowerCase();
  return AOA_KEYWORDS.some(k => lower.includes(k));
};

const handleQuery = async (req, res) => {
  try {
    const { query, inputMode = "text" } = req.body;
    if (!query?.trim())
      return res.status(400).json({ message: "Query cannot be empty" });

    const userId = req.user?.id || null;
    const q = query.trim();

    console.log(`\n${"─".repeat(50)}`);
    console.log(`📨 Query: "${q}"`);

    // ── Domain check ──────────────────────────────────
    if (!isAoA(q)) {
      return res.json({
        success: false,
        message: "🤖 Main sirf Analysis of Algorithms ka expert hoon.\n\nAap mujhse yeh topics ke baare mein pooch sakte hain:\n• Sorting: Merge Sort, Quick Sort, Heap Sort, Counting Sort\n• Searching: Binary Search\n• Graphs: BFS, DFS, Dijkstra, Bellman-Ford\n• Trees: BST, Red-Black Trees\n• DP: Rod Cutting, LCS, Matrix Chain\n• Greedy: Huffman, Activity Selection\n• Complexity: Big-O, Master Theorem, Recurrences",
      });
    }

    // ── Step 1: Recurrence solver ──────────────────────
    const parsed = parseRecurrence(q);
    if (parsed.found) {
      const result = solveMasterTheorem(parsed.a, parsed.b, parsed.k);
      await Query.create({ userId, queryText: q, matchedTopic: "Master Theorem", responseGiven: true, inputMode });
      return res.json({ success: true, source: "math-solver", structured: buildMathResponse(result) });
    }

    // ── Step 2: Complexity lookup ──────────────────────
    const complexity = getComplexity(q);
    if (complexity && /complexity|big.?o|time|space/.test(q.toLowerCase())) {
      await Query.create({ userId, queryText: q, matchedTopic: complexity.algorithm, responseGiven: true, inputMode });
      return res.json({ success: true, source: "complexity-db", structured: buildComplexityResponse(complexity) });
    }

    // ── Step 3: TF-IDF Search (main AI engine) ─────────
    const aiResult = await findAnswer(q);

    if (aiResult.found) {
      const data = aiResult.data;
      await Query.create({ userId, queryText: q, matchedTopic: data.topic, responseGiven: true, inputMode });

      if (userId) {
        await Progress.findOneAndUpdate(
          { userId },
          { $addToSet: { topicsViewed: data.topic }, $inc: { totalQueries: 1 }, lastActive: new Date() },
          { upsert: true, new: true }
        );
      }

      return res.json({
        success: true,
        source: "tfidf-model",
        structured: {
          type:            data.type || "conceptual",
          topic:           data.topic,
          definition:      data.answer,
          matchedQuestion: data.question,
          score:           data.score,
          keyPoints:       [],
          timeComplexity:  null,
          spaceComplexity: null,
          followUp:        aiResult.alternatives?.map(a => a.question) || [],
          steps:           [],
        },
      });
    }

    // ── Step 4: Knowledge Base fallback ───────────────
    const allTopics = await Topic.find();
    const matched   = matchTopic(q, allTopics);

    await Query.create({ userId, queryText: q, matchedTopic: matched?.name || null, responseGiven: !!matched, inputMode });

    if (matched) {
      return res.json({
        success: true,
        source: "knowledge-base",
        structured: buildConceptualResponse(matched),
      });
    }

    // ── Nothing found ──────────────────────────────────
    await logUnknownQuery(q, userId);
    return res.json({
      success: false,
      message: `❓ "${q}" ke baare mein mujhe information nahi mili.\n\nPlease in topics ke baare mein poochein:\nMerge Sort, Quick Sort, Binary Search, Dijkstra, BFS, DFS, Dynamic Programming, Master Theorem, Big-O Notation`,
    });

  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { handleQuery };