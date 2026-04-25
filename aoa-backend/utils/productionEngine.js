const { spawn }    = require("child_process");
const path         = require("path");
const Topic        = require("../models/Topic");
const { matchTopic } = require("./matcher");
const {
  parseRecurrence,
  solveMasterTheorem,
  getComplexity,
} = require("./mathSolver");

const RAG_SCRIPT = path.join(__dirname, "../rag/search.py");

// ── 1. RAG Search ─────────────────────────────────────────────────
const ragSearch = (query) => {
  return new Promise((resolve) => {
    const py  = spawn("py", [RAG_SCRIPT, query]);
    let   out = "";

    py.stdout.on("data", d => { out += d.toString(); });
    py.on("close", () => {
      try {
        const s = out.indexOf("[");
        const e = out.lastIndexOf("]");
        if (s !== -1 && e !== -1) {
          resolve(JSON.parse(out.substring(s, e + 1)));
        } else {
          resolve([]);
        }
      } catch { resolve([]); }
    });

    setTimeout(() => { py.kill(); resolve([]); }, 10000);
  });
};

// ── 2. Intent Detection ───────────────────────────────────────────
const detectIntent = (q) => {
  q = q.toLowerCase();
  if (/vs\.?|versus|compare|differ|better|worse|between/.test(q))
    return "comparative";
  if (/t\(n\)|recurrence|master theorem|substitut|recursion.?tree/.test(q))
    return "mathematical";
  if (/complex|big.?o|big.?omega|big.?theta|little.?o|little.?omega|asymptot|notati/.test(q))
    return "complexity";
  if (/how (does|do|to|can)|steps|pseudocode|implement|procedure|trace|walkthrough/.test(q))
    return "procedural";
  if (/example|show|demonstrate|illustrate|sample/.test(q))
    return "example";
  return "conceptual";
};

// ── 3. Topic Extraction ───────────────────────────────────────────
const extractTopic = (q) => {
  q = q.toLowerCase();
  const map = [
    ["merge sort",          "Merge Sort"],
    ["mergesort",           "Merge Sort"],
    ["quick sort",          "Quick Sort"],
    ["quicksort",           "Quick Sort"],
    ["heap sort",           "Heap Sort"],
    ["heapsort",            "Heap Sort"],
    ["bubble sort",         "Bubble Sort"],
    ["insertion sort",      "Insertion Sort"],
    ["selection sort",      "Selection Sort"],
    ["counting sort",       "Counting Sort"],
    ["radix sort",          "Radix Sort"],
    ["bucket sort",         "Bucket Sort"],
    ["binary search tree",  "Binary Search Trees"],
    ["binary search",       "Binary Search"],
    ["dijkstra",            "Dijkstra's Algorithm"],
    ["bellman-ford",        "Bellman-Ford"],
    ["bellman ford",        "Bellman-Ford"],
    ["bfs",                 "BFS"],
    ["breadth first",       "BFS"],
    ["dfs",                 "DFS"],
    ["depth first",         "DFS"],
    ["topological sort",    "Topological Sort"],
    ["topological",         "Topological Sort"],
    ["dynamic programming", "Dynamic Programming"],
    ["rod cutting",         "Rod Cutting"],
    ["matrix chain",        "Matrix Chain Multiplication"],
    ["longest common",      "LCS"],
    ["lcs",                 "LCS"],
    ["knapsack",            "Knapsack Problem"],
    ["greedy",              "Greedy Algorithms"],
    ["huffman",             "Huffman Codes"],
    ["activity selection",  "Activity Selection"],
    ["master theorem",      "Master Theorem"],
    ["big-o",               "Big-O Notation"],
    ["big o",               "Big-O Notation"],
    ["big omega",           "Big-Omega Notation"],
    ["big theta",           "Big-Theta Notation"],
    ["little-o",            "Little-o Notation"],
    ["little-omega",        "Little-omega Notation"],
    ["little omega",        "Little-omega Notation"],
    ["asymptotic",          "Asymptotic Notation"],
    ["recurrence",          "Recurrences"],
    ["substitution method", "Substitution Method"],
    ["recursion tree",      "Recursion Tree Method"],
    ["red-black",           "Red-Black Trees"],
    ["red black",           "Red-Black Trees"],
    ["minimum spanning",    "Minimum Spanning Tree"],
    ["kruskal",             "Kruskal's Algorithm"],
    ["prim",                "Prim's Algorithm"],
    ["divide and conquer",  "Divide and Conquer"],
    ["strassen",            "Strassen's Algorithm"],
    ["priority queue",      "Priority Queue"],
    ["lower bound",         "Lower Bounds for Sorting"],
    ["loop invariant",      "Loop Invariants"],
    ["heapify",             "Heapify"],
    ["max heap",            "Max-Heap"],
    ["min heap",            "Min-Heap"],
  ];
  for (const [kw, name] of map) {
    if (q.includes(kw)) return name;
  }
  return null;
};

// ── 4. Domain Guard ───────────────────────────────────────────────
const isAoAQuery = (q) => {
  q = q.toLowerCase();
  const keywords = [
    "sort", "search", "algorithm", "graph", "tree",
    "path", "dynamic", "greedy", "complex", "big o",
    "big-o", "recurrence", "merge", "quick", "bubble",
    "binary", "dijkstra", "bellman", "bfs", "dfs", "dp",
    "heap", "queue", "asymptot", "theta", "omega",
    "master", "recursion", "divide", "conquer", "huffman",
    "kruskal", "prim", "topolog", "spanning", "insertion",
    "selection", "counting", "radix", "bucket", "lcs",
    "knapsack", "subsequence", "partition", "pivot",
    "red-black", "strassen", "matrix", "notation",
    "lower bound", "upper bound", "tight bound",
    "loop invariant", "pseudocode", "time complexity",
    "space complexity", "best case", "worst case",
    "average case", "amortized", "hashing", "aoa",
    "analysis", "complexity class",
  ];
  return keywords.some(k => q.includes(k));
};

// ── 5. Build response from Knowledge Base ─────────────────────────
const buildKBResponse = (query, topic, intent, kb, chapters) => {
  const followUp = generateFollowUp(topic);

  if (intent === "procedural") {
    return {
      type:           "procedural",
      topic:          kb.name,
      answer:         kb.definition || "",
      steps:          kb.steps      || [],
      pseudocode:     kb.pseudocode || null,
      example:        kb.example    || null,
      keyPoints:      (kb.steps || []).slice(0, 4),
      timeComplexity: kb.complexity?.time?.average
                   || kb.complexity?.time || null,
      spaceComplexity: kb.complexity?.space || null,
      followUp,
      chapters,
      source: "CLRS Knowledge Base",
    };
  }

  if (intent === "complexity") {
    return {
      type:  "complexity",
      topic: `Complexity of ${kb.name}`,
      answer: [
        kb.complexity?.time?.best    ? `Best Case:    ${kb.complexity.time.best}`    : null,
        kb.complexity?.time?.average ? `Average Case: ${kb.complexity.time.average}` : null,
        kb.complexity?.time?.worst   ? `Worst Case:   ${kb.complexity.time.worst}`   : null,
        kb.complexity?.space         ? `Space:        ${kb.complexity.space}`         : null,
      ].filter(Boolean).join("\n"),
      keyPoints: [
        kb.complexity?.time?.best    ? `Best Case: ${kb.complexity.time.best}`    : null,
        kb.complexity?.time?.average ? `Average: ${kb.complexity.time.average}`   : null,
        kb.complexity?.time?.worst   ? `Worst Case: ${kb.complexity.time.worst}`  : null,
        kb.complexity?.space         ? `Space: ${kb.complexity.space}`            : null,
      ].filter(Boolean),
      timeComplexity:  kb.complexity?.time?.average || null,
      spaceComplexity: kb.complexity?.space         || null,
      followUp,
      chapters,
      source: "CLRS Knowledge Base",
    };
  }

  if (intent === "comparative") {
    return {
      type:    "comparative",
      topic:   kb.name,
      answer:  kb.definition || "",
      keyPoints: [
        ...(kb.advantages    || []).slice(0, 2).map(a => `✅ ${a}`),
        ...(kb.disadvantages || []).slice(0, 2).map(d => `❌ ${d}`),
      ],
      timeComplexity:  kb.complexity?.time?.average || null,
      spaceComplexity: kb.complexity?.space         || null,
      followUp,
      chapters,
      source: "CLRS Knowledge Base",
    };
  }

  // Default — conceptual
  return {
    type:    "conceptual",
    topic:   kb.name,
    answer:  kb.definition || "",
    steps:   kb.steps      || [],
    keyPoints: [
      kb.complexity?.time?.average ? `Time: ${kb.complexity.time.average}` : null,
      kb.complexity?.space         ? `Space: ${kb.complexity.space}`        : null,
      ...(kb.advantages || []).slice(0, 2),
    ].filter(Boolean),
    timeComplexity:  kb.complexity?.time?.average || null,
    spaceComplexity: kb.complexity?.space         || null,
    followUp,
    chapters,
    source: "CLRS Knowledge Base",
  };
};

// ── 6. Build response from RAG results ───────────────────────────
const buildRAGResponse = (query, topic, intent, sentences, chapters) => {
  const followUp = generateFollowUp(topic);

  if (sentences.length === 0) {
    return {
      type:      "not-found",
      topic:     topic || "AoA Query",
      answer:    "I could not find a clear answer for this query. Please try rephrasing or ask about a specific algorithm.",
      keyPoints: [],
      followUp:  ["What is Merge Sort?", "Explain Dijkstra", "What is Big-O notation?"],
      chapters,
      source:    "CLRS",
    };
  }

  return {
    type:      intent,
    topic:     topic || "Analysis of Algorithms",
    answer:    sentences.slice(0, 4).join(" "),
    keyPoints: sentences.slice(0, 4),
    followUp,
    chapters,
    source:    chapters.length > 0 ? `CLRS — ${chapters.join(", ")}` : "CLRS",
  };
};

// ── 7. Follow-up generator ────────────────────────────────────────
const generateFollowUp = (topic) => {
  if (!topic) return [];
  const t = topic.toLowerCase();
  const map = {
    "merge sort":          ["Recurrence of Merge Sort?", "Compare Merge Sort vs Quick Sort", "Space complexity of Merge Sort?"],
    "quick sort":          ["Quick Sort worst case?", "How does partitioning work?", "Compare Quick Sort vs Merge Sort"],
    "heap sort":           ["What is a max-heap?", "How does BUILD-MAX-HEAP work?", "Compare Heap Sort vs Merge Sort"],
    "dijkstra":            ["Why no negative weights in Dijkstra?", "Compare Dijkstra vs Bellman-Ford", "Time complexity of Dijkstra?"],
    "bellman-ford":        ["When to use Bellman-Ford?", "How Bellman-Ford detects negative cycles?", "Time complexity of Bellman-Ford?"],
    "bfs":                 ["Compare BFS vs DFS", "What is BFS used for?", "Time complexity of BFS?"],
    "dfs":                 ["4 edge types in DFS?", "DFS for topological sort?", "Compare DFS vs BFS"],
    "dynamic programming": ["What is optimal substructure?", "Explain Rod Cutting", "DP vs Greedy?"],
    "greedy algorithms":   ["What is greedy choice property?", "Explain Huffman Coding", "When does Greedy fail?"],
    "master theorem":      ["Solve T(n) = 2T(n/2) + n", "3 cases of Master Theorem?", "Solve T(n) = T(n/2) + 1"],
    "asymptotic notation": ["What is Big-Theta?", "Difference between O and Theta?", "What is little-o?"],
    "red-black trees":     ["5 Red-Black Tree properties?", "How RB-INSERT-FIXUP works?", "RB Trees vs AVL Trees?"],
    "binary search trees": ["What is BST property?", "How to delete from BST?", "What is inorder traversal?"],
    "minimum spanning tree": ["Compare Kruskal vs Prim", "What is the cut property?", "Time complexity of Kruskal?"],
    "big-o notation":      ["What is Big-Theta notation?", "What is Big-Omega?", "What is little-o notation?"],
    "recurrences":         ["What is the substitution method?", "Explain recursion tree method", "When to use Master Theorem?"],
  };
  for (const [key, questions] of Object.entries(map)) {
    if (t.includes(key)) return questions;
  }
  return [
    `Time complexity of ${topic}?`,
    `Explain ${topic} with an example`,
    `How does ${topic} work step by step?`,
  ];
};

// ── MAIN ENTRY POINT ──────────────────────────────────────────────
const processQuery = async (userQuery) => {
  try {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`📨 Query: "${userQuery}"`);

    // Domain check
    if (!isAoAQuery(userQuery)) {
      console.log("🚫 Out of domain");
      return {
        success: true,
        data: {
          type:      "restriction",
          topic:     "Out of Domain",
          answer:    "I am AoA-Tutor, specialized only in Analysis of Algorithms.\n\nI can answer questions about:\n• Sorting: Merge Sort, Quick Sort, Heap Sort, Counting Sort, Radix Sort, Bubble Sort\n• Searching: Binary Search\n• Graphs: BFS, DFS, Dijkstra, Bellman-Ford, Topological Sort\n• Trees: BST, Red-Black Trees\n• Dynamic Programming: Rod Cutting, LCS, Matrix Chain Multiplication\n• Greedy Algorithms: Huffman Codes, Activity Selection, MST (Kruskal, Prim)\n• Complexity Analysis: Big-O, Big-Omega, Big-Theta, little-o, little-omega\n• Recurrences: Master Theorem, Substitution Method, Recursion Tree",
          keyPoints: [],
          followUp:  ["What is Merge Sort?", "Explain Dijkstra", "What is Big-O notation?"],
          source:    "domain-guard",
        },
      };
    }

    const intent = detectIntent(userQuery);
    const topic  = extractTopic(userQuery);
    console.log(`🎯 Intent: ${intent} | Topic: ${topic}`);

    // ── Handle Math directly (no RAG needed) ─────────────────────
    if (intent === "mathematical") {
      const parsed = parseRecurrence(userQuery);
      if (parsed.found) {
        const result = solveMasterTheorem(parsed.a, parsed.b, parsed.k);
        console.log("🧮 Solved:", result.solution);
        return {
          success: true,
          data: {
            type:  "mathematical",
            topic: "Master Theorem Solution",
            answer: `Recurrence: T(n) = ${parsed.a}T(n/${parsed.b}) + n^${parsed.k}\n\nStep 1: Identify values\n  a = ${parsed.a}, b = ${parsed.b}, k = ${parsed.k}\n\nStep 2: Compute log_b(a)\n  log_${parsed.b}(${parsed.a}) = ${result.log_b_a}\n\nStep 3: Apply ${result.case}\n  Condition: ${result.condition}\n\nStep 4: Solution\n  ${result.solution}\n\n${result.explanation}`,
            keyPoints: [
              `a = ${parsed.a} (subproblems)`,
              `b = ${parsed.b} (size reduction)`,
              `${result.case}: ${result.condition}`,
              `✅ Solution: ${result.solution}`,
            ],
            timeComplexity:  result.solution,
            spaceComplexity: null,
            followUp: [
              "Solve T(n) = T(n/2) + 1",
              "What are the 3 cases of Master Theorem?",
              "Solve T(n) = 4T(n/2) + n",
            ],
            source: "Math Solver",
          },
        };
      }

      const complexity = getComplexity(userQuery);
      if (complexity) {
        console.log(`📊 Complexity found: ${complexity.algorithm}`);
        return {
          success: true,
          data: {
            type:  "complexity",
            topic: `Complexity of ${complexity.algorithm}`,
            answer: `Best Case:    ${complexity.best}\nAverage Case: ${complexity.average}\nWorst Case:   ${complexity.worst}\nSpace:        ${complexity.space}`,
            keyPoints: [
              `Best Case: ${complexity.best}`,
              `Average Case: ${complexity.average}`,
              `Worst Case: ${complexity.worst}`,
              `Space: ${complexity.space}`,
            ],
            timeComplexity:  complexity.average,
            spaceComplexity: complexity.space,
            followUp: [`How does ${complexity.algorithm} work?`, `Compare ${complexity.algorithm} with another algorithm`],
            source:   "Complexity Database",
          },
        };
      }
    }

    // ── Search Knowledge Base ─────────────────────────────────────
    // ── Search Knowledge Base ─────────────────────────────────────
let kbTopic = null;
try {
  const allTopics = await Topic.find();

  // Try with extracted topic first (more precise)
  if (topic) {
    kbTopic = matchTopic(topic, allTopics);
  }

  // Fallback to raw query
  if (!kbTopic) {
    kbTopic = matchTopic(userQuery, allTopics);
  }

  if (kbTopic) {
    console.log(`📗 KB match: ${kbTopic.name}`);
  } else {
    console.log("📗 No KB match");
  }
} catch (e) {
  console.log("⚠️  KB search failed:", e.message);
}

    // ── Search CLRS Book via RAG ──────────────────────────────────
    const ragQuery   = topic || userQuery;
    const ragResults = await ragSearch(ragQuery);
    const chapters   = [...new Set(ragResults.map(r => r.chapter))];
    console.log(`📚 RAG: ${ragResults.length} passages from [${chapters.join(", ")}]`);

    // ── Build final response ──────────────────────────────────────
    // Priority: KB > RAG
    if (kbTopic) {
      const response = buildKBResponse(userQuery, topic, intent, kbTopic, chapters);
      return { success: true, data: response };
    }

    const sentences = ragResults.flatMap(r => r.sentences || []);
    const unique    = [...new Set(sentences)].filter(Boolean);
    const response  = buildRAGResponse(userQuery, topic, intent, unique, chapters);
    return { success: true, data: response };

  } catch (err) {
    console.error("❌ Engine error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { processQuery };