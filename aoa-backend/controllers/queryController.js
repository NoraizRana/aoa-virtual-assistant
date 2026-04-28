const Topic    = require("../models/Topic");
const Query    = require("../models/Query");
const Progress = require("../models/Progress");
const { matchTopic }           = require("../utils/matcher");
const { logUnknownQuery }      = require("../utils/selfLearning");
const { parseRecurrence, solveMasterTheorem, getComplexity, isMathQuery } = require("../utils/mathSolver");
const {
  buildConceptualResponse,
  buildProceduralResponse,
  buildComparativeResponse,
  buildMathResponse,
  buildComplexityResponse,
  buildExampleResponse,
} = require("../utils/responseBuilder");

// ── Domain keywords ───────────────────────────────────────────────
const AOA_KEYWORDS = [
  "sort","search","algorithm","graph","tree","path","dynamic","greedy",
  "complexity","big o","big-o","recurrence","merge","quick","bubble",
  "binary","dijkstra","bellman","bfs","dfs","dp","heap","queue",
  "asymptot","theta","omega","master","recursion","divide","conquer",
  "huffman","kruskal","prim","topolog","spanning","insertion","selection",
  "counting","radix","bucket","lcs","knapsack","subsequence","partition",
  "pivot","red-black","strassen","matrix","notation","lower bound",
  "loop invariant","pseudocode","time complexity","space complexity",
  "best case","worst case","average case","hashing","median","order statistic",
  "bellman ford","bellman-ford","traversal","traversing","inorder",
  "preorder","postorder","avl","balanced","rotation","mst",
];

const isAoAQuery = (q) => {
  const lower = q.toLowerCase();
  return AOA_KEYWORDS.some(k => lower.includes(k));
};

// ── Detect intent ─────────────────────────────────────────────────
const detectIntent = (q) => {
  const lower = q.toLowerCase();
  if (/vs\.?|versus|compare|differ|better|worse|between/.test(lower))
    return "comparative";
  if (/t\s*\(n\)|recurrence|master theorem|substitut|recursion.?tree/.test(lower))
    return "mathematical";
  if (/complex|big.?o|big.?omega|big.?theta|little.?o|little.?omega|asymptot|notation/.test(lower))
    return "complexity";
  if (/how (does|do|to|can)|steps|pseudocode|implement|procedure|trace|walkthrough/.test(lower))
    return "procedural";
  if (/example|show me|demonstrate|illustrate|trace/.test(lower))
    return "example";
  return "conceptual";
};

// ── Extract topic from query ──────────────────────────────────────
const extractTopic = (q) => {
  q = q.toLowerCase();
  const map = [
    ["merge sort","Merge Sort"],["mergesort","Merge Sort"],
    ["quick sort","Quick Sort"],["quicksort","Quick Sort"],
    ["heap sort","Heap Sort"],["heapsort","Heap Sort"],
    ["bubble sort","Bubble Sort"],["insertion sort","Insertion Sort"],
    ["selection sort","Selection Sort"],["counting sort","Counting Sort"],
    ["radix sort","Radix Sort"],["bucket sort","Bucket Sort"],
    ["binary search tree","Binary Search Trees"],["binary search","Binary Search"],
    ["dijkstra","Dijkstra's Algorithm"],["bellman-ford","Bellman-Ford Algorithm"],
    ["bellman ford","Bellman-Ford Algorithm"],
    ["bfs","BFS (Breadth-First Search)"],["breadth first","BFS (Breadth-First Search)"],
    ["dfs","DFS (Depth-First Search)"],["depth first","DFS (Depth-First Search)"],
    ["topological sort","Topological Sort"],["topological","Topological Sort"],
    ["dynamic programming","Dynamic Programming"],["rod cutting","Dynamic Programming"],
    ["lcs","Dynamic Programming"],["longest common","Dynamic Programming"],
    ["greedy","Greedy Algorithms"],["huffman","Huffman Codes"],
    ["activity selection","Greedy Algorithms"],
    ["master theorem","Master Theorem"],["recurrence","Master Theorem"],
    ["big-o","Asymptotic Notation"],["big o","Asymptotic Notation"],
    ["big omega","Asymptotic Notation"],["big theta","Asymptotic Notation"],
    ["little-o","Asymptotic Notation"],["little-omega","Asymptotic Notation"],
    ["little o","Asymptotic Notation"],["little omega","Asymptotic Notation"],
    ["asymptotic","Asymptotic Notation"],
    ["red-black","Red-Black Trees"],["red black","Red-Black Trees"],
    ["minimum spanning","Minimum Spanning Tree"],
    ["kruskal","Minimum Spanning Tree"],["prim","Minimum Spanning Tree"],
    ["divide and conquer","Divide and Conquer"],["strassen","Strassen's Algorithm"],
    ["priority queue","Priority Queue"],["max heap","Priority Queue"],
    ["min heap","Priority Queue"],["heapify","Heap Sort"],
    ["lower bound","Lower Bounds for Sorting"],
    ["traversal","Binary Search Trees"],["traversing","Binary Search Trees"],
    ["inorder","Binary Search Trees"],["preorder","Binary Search Trees"],
    ["postorder","Binary Search Trees"],
    ["median","Medians and Order Statistics"],["order statistic","Medians and Order Statistics"],
  ];
  for (const [kw, name] of map) {
    if (q.includes(kw)) return name;
  }
  return null;
};

// ── Main handler ──────────────────────────────────────────────────
const handleQuery = async (req, res) => {
  try {
    const { query, inputMode = "text" } = req.body;
    if (!query?.trim())
      return res.status(400).json({ message: "Query cannot be empty" });

    const userId = req.user?.id || null;
    const q      = query.trim();

    console.log(`\n${"─".repeat(50)}`);
    console.log(`📨 Query: "${q}"`);

    // ── Domain check ──────────────────────────────────────────────
    if (!isAoAQuery(q)) {
      console.log("🚫 Out of domain");
      await Query.create({ userId, queryText: q, matchedTopic: null, responseGiven: false, inputMode });
      await logUnknownQuery(q, userId);
      return res.json({
        success: false,
        message: "🤖 I am specialized in Analysis of Algorithms only.\n\nI can answer questions about:\n• Sorting: Merge Sort, Quick Sort, Heap Sort, Bubble Sort, Insertion Sort, Counting Sort, Radix Sort, Bucket Sort\n• Searching: Binary Search\n• Graphs: BFS, DFS, Dijkstra, Bellman-Ford, Topological Sort\n• Trees: BST, Red-Black Trees\n• Algorithm Design: Divide & Conquer, Dynamic Programming, Greedy\n• Complexity: Big-O, Omega, Theta, Master Theorem, Recurrences\n• Data Structures: Priority Queue, Heaps\n• MST: Kruskal, Prim",
      });
    }

    const intent = detectIntent(q);
    const topicName = extractTopic(q);
    console.log(`🎯 Intent: ${intent} | Topic: ${topicName}`);

    // ── MATH: Solve recurrence directly ──────────────────────────
    if (intent === "mathematical" || isMathQuery(q)) {
      const parsed = parseRecurrence(q);
      if (parsed.found) {
        const result = solveMasterTheorem(parsed.a, parsed.b, parsed.k);
        console.log(`🧮 Solved: ${result.solution}`);
        await Query.create({ userId, queryText: q, matchedTopic: "Master Theorem", responseGiven: true, inputMode });
        return res.json({ success: true, source: "math-solver", structured: buildMathResponse(result) });
      }

      const complexity = getComplexity(q);
      if (complexity) {
        console.log(`📊 Complexity: ${complexity.algorithm}`);
        await Query.create({ userId, queryText: q, matchedTopic: complexity.algorithm, responseGiven: true, inputMode });
        return res.json({ success: true, source: "complexity-db", structured: buildComplexityResponse(complexity) });
      }
    }

    // ── COMPARATIVE: two topics ───────────────────────────────────
    // ── COMPARATIVE: two topics ───────────────────────────────────────
if (intent === "comparative") {
  // Strip leading action words before splitting
  const stripped = q
    .replace(/^(compare|contrast|difference between|differences between|distinguish between)\s+/i, "")
    .trim();

  // Now split on vs / and / versus
  const vsMatch = stripped.match(
    /^(.+?)\s+(?:vs\.?|versus|and)\s+(.+)$/i
  );

  if (vsMatch) {
    const allTopics = await Topic.find();
    const t1 = matchTopic(vsMatch[1].trim(), allTopics);
    const t2 = matchTopic(vsMatch[2].trim(), allTopics);

    if (t1 && t2) {
      console.log(`⚖️  Comparing: ${t1.name} vs ${t2.name}`);
      await Query.create({
        userId, queryText: q,
        matchedTopic: `${t1.name} vs ${t2.name}`,
        responseGiven: true, inputMode,
      });
      return res.json({
        success: true,
        source: "knowledge-base",
        structured: buildComparativeResponse(t1, t2),
      });
    }
  }
}

    // ── GENERAL: Match topic from KB ──────────────────────────────
    const allTopics = await Topic.find();
    let matched = null;

    // Try extracted topic name first (precise)
    if (topicName) {
      matched = matchTopic(topicName, allTopics);
    }
    // Fallback to raw query
    if (!matched) {
      matched = matchTopic(q, allTopics);
    }

    // Log query
    await Query.create({
      userId,
      queryText:     q,
      matchedTopic:  matched ? matched.name : null,
      responseGiven: !!matched,
      inputMode,
    });

    // Update progress
    if (userId && matched) {
      await Progress.findOneAndUpdate(
        { userId },
        { $addToSet: { topicsViewed: matched.name }, $inc: { totalQueries: 1 }, lastActive: new Date() },
        { upsert: true, new: true }
      );
    }

    // No match found
    if (!matched) {
      console.log("❌ No topic matched");
      await logUnknownQuery(q, userId);
      return res.json({
        success: false,
        message: `❓ I couldn't find information on "${q}".\n\nTry asking about:\n• Merge Sort, Quick Sort, Heap Sort, Bubble Sort\n• Binary Search, BFS, DFS\n• Dijkstra, Bellman-Ford, Topological Sort\n• Dynamic Programming, Greedy Algorithms\n• Master Theorem, Big-O Notation\n• Red-Black Trees, BST, Priority Queue\n• Kruskal, Prim (MST)`,
      });
    }

    console.log(`✅ Matched: "${matched.name}" | Intent: ${intent}`);

    // Build response based on intent
    let structured;
    switch (intent) {
      case "procedural": structured = buildProceduralResponse(matched); break;
      case "example":    structured = buildExampleResponse(matched);    break;
      case "complexity": {
        const c = getComplexity(matched.name.toLowerCase());
        structured = c ? buildComplexityResponse(c) : buildConceptualResponse(matched);
        break;
      }
      default: structured = buildConceptualResponse(matched);
    }

    return res.json({ success: true, source: "knowledge-base", structured });

  } catch (err) {
    console.error("💥 Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { handleQuery };