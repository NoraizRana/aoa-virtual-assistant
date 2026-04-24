const { spawn } = require("child_process");
const path      = require("path");

const RAG_SCRIPT = path.join(__dirname, "../rag/search.py");

// ── Search the CLRS book ──────────────────────────────────────────
const searchBook = (query) => {
  return new Promise((resolve) => {
    const py     = spawn("py", [RAG_SCRIPT, query]);
    let   output = "";

    py.stdout.on("data", (d) => { output += d.toString(); });
    py.on("close", () => {
      try {
        const start   = output.indexOf("[");
        const end     = output.lastIndexOf("]");
        const results = JSON.parse(output.substring(start, end + 1));
        resolve(results);
      } catch {
        resolve([]);
      }
    });

    setTimeout(() => { py.kill(); resolve([]); }, 12000);
  });
};

// ── Detect query type ─────────────────────────────────────────────
const detectQueryType = (query) => {
  const q = query.toLowerCase();

  if (/vs\.?|versus|compare|difference between|better|worse/.test(q))
    return "comparative";

  if (/t\(n\)|recurrence|solve|master theorem|substitut|recursion tree/.test(q))
    return "mathematical";

  if (/complexity|big.?o|big.?omega|big.?theta|little.?o|little.?omega|time.*sort|space.*sort/.test(q))
    return "complexity";

  if (/how (does|do|to|can)|steps|pseudocode|implement|algorithm for|procedure|trace|walkthrough/.test(q))
    return "procedural";

  if (/what is|what are|define|explain|describe|tell me|meaning|overview/.test(q))
    return "conceptual";

  if (/example|show|demonstrate|illustrate|sample/.test(q))
    return "example";

  return "conceptual";
};

// ── Extract topic name ────────────────────────────────────────────
const extractTopic = (query) => {
  const q   = query.toLowerCase();
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
    ["bellman-ford",        "Bellman-Ford Algorithm"],
    ["bellman ford",        "Bellman-Ford Algorithm"],
    ["bfs",                 "Breadth-First Search"],
    ["breadth first",       "Breadth-First Search"],
    ["dfs",                 "Depth-First Search"],
    ["depth first",         "Depth-First Search"],
    ["dynamic programming", "Dynamic Programming"],
    ["rod cutting",         "Rod Cutting"],
    ["matrix chain",        "Matrix Chain Multiplication"],
    ["lcs",                 "Longest Common Subsequence"],
    ["longest common",      "Longest Common Subsequence"],
    ["greedy",              "Greedy Algorithms"],
    ["huffman",             "Huffman Codes"],
    ["activity selection",  "Activity Selection"],
    ["master theorem",      "Master Theorem"],
    ["big-o",               "Asymptotic Notation"],
    ["big o",               "Asymptotic Notation"],
    ["big omega",           "Asymptotic Notation"],
    ["big theta",           "Asymptotic Notation"],
    ["little-o",            "Asymptotic Notation"],
    ["little-omega",        "Asymptotic Notation"],
    ["little omega",        "Asymptotic Notation"],
    ["asymptotic",          "Asymptotic Notation"],
    ["recurrence",          "Recurrences"],
    ["substitution method", "Substitution Method"],
    ["recursion tree",      "Recursion Tree Method"],
    ["red-black",           "Red-Black Trees"],
    ["red black",           "Red-Black Trees"],
    ["minimum spanning",    "Minimum Spanning Tree"],
    ["kruskal",             "Kruskal's Algorithm"],
    ["prim",                "Prim's Algorithm"],
    ["topological",         "Topological Sort"],
    ["divide and conquer",  "Divide and Conquer"],
    ["strassen",            "Strassen's Algorithm"],
    ["heap",                "Heap / Priority Queue"],
    ["priority queue",      "Priority Queue"],
    ["lower bound",         "Lower Bounds for Sorting"],
  ];

  for (const [kw, name] of map) {
    if (q.includes(kw)) return name;
  }
  return null;
};

// ── Check if query is AoA-related ─────────────────────────────────
const isAoAQuery = (query) => {
  const q = query.toLowerCase();
  const keywords = [
    "sort", "search", "algorithm", "graph", "tree", "path",
    "dynamic", "greedy", "complexity", "big o", "big-o",
    "recurrence", "merge", "quick", "bubble", "binary",
    "dijkstra", "bellman", "bfs", "dfs", "dp", "heap",
    "queue", "stack", "asymptot", "notation", "theta",
    "omega", "master", "recursion", "divide", "conquer",
    "huffman", "kruskal", "prim", "topolog", "spanning",
    "insertion", "selection", "counting", "radix", "bucket",
    "lcs", "knapsack", "subsequence", "partition", "pivot",
    "red-black", "avl", "hashing", "strassen", "matrix",
    "lower bound", "upper bound", "tight bound",
  ];
  return keywords.some(k => q.includes(k));
};

// ── Clean RAG text ────────────────────────────────────────────────
const cleanText = (text) => {
  return text
    .replace(/\(cid:\d+\)/g, "")
    .replace(/[^\x20-\x7E\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// ── Build structured response from RAG results ────────────────────
const buildResponse = (query, topic, queryType, ragResults) => {

  // Extract clean content from RAG
  const bookContent = ragResults
    .map(r => cleanText(r.text))
    .join(" ");

  const chapters = [...new Set(ragResults.map(r => r.chapter))];

  // ── Extract definition sentences ──────────────────────────────
  const getDefinition = () => {
    const sentences = bookContent
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.length > 40 && s.length < 300)
      .filter(s => !/^\d+$/.test(s.trim()));

    // Find most relevant sentence
    const topicLower = (topic || query).toLowerCase();
    const relevant   = sentences.find(s =>
      s.toLowerCase().includes(topicLower.split(" ")[0])
    );
    return relevant || sentences[0] || "";
  };

  // ── Extract key sentences for answer ──────────────────────────
  const getKeyContent = (maxSentences = 5) => {
    const sentences = bookContent
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.split(" ").length > 8)
      .filter(s => s.split(" ").length < 60)
      .filter(s => !/^\d+/.test(s.trim()))
      .filter(s => /[a-zA-Z]{3,}/.test(s))
      .slice(0, maxSentences);
    return sentences;
  };

  // ── Build answer based on query type ──────────────────────────
  let answer = "";
  let keyPoints = [];
  let complexity = null;

  const keySentences = getKeyContent(6);
  const definition   = getDefinition();

  switch (queryType) {

    case "conceptual":
      answer = definition
        ? `${definition}\n\n${keySentences.slice(1, 4).join(" ")}`
        : keySentences.join(" ");
      keyPoints = [
        `Found in CLRS: ${chapters.join(", ")}`,
        ...keySentences.slice(0, 3).map(s => s.trim()),
      ].filter(Boolean).slice(0, 4);
      break;

    case "procedural":
      answer = `Here is how ${topic || "this algorithm"} works according to CLRS:\n\n${keySentences.join("\n")}`;
      keyPoints = keySentences.slice(0, 4).map(s => s.trim());
      break;

    case "complexity":
      // Extract complexity info from book content
      const timeMatch  = bookContent.match(/O\([^)]+\)/g) || [];
      const uniqueComp = [...new Set(timeMatch)].slice(0, 4);
      answer = `Based on CLRS analysis:\n\n${keySentences.slice(0, 3).join(" ")}`;
      if (uniqueComp.length > 0) {
        complexity = {
          time:  uniqueComp[0] || null,
          space: uniqueComp[1] || null,
        };
      }
      keyPoints = [
        uniqueComp.length > 0 ? `Complexities mentioned: ${uniqueComp.join(", ")}` : null,
        ...keySentences.slice(0, 3),
      ].filter(Boolean);
      break;

    case "mathematical":
      answer = keySentences.join("\n\n");
      keyPoints = [
        "Use Master Theorem: T(n) = aT(n/b) + f(n)",
        "Case 1: f(n) = O(n^(log_b(a)-ε)) → T(n) = Θ(n^log_b(a))",
        "Case 2: f(n) = Θ(n^log_b(a)) → T(n) = Θ(n^log_b(a) · log n)",
        "Case 3: f(n) = Ω(n^(log_b(a)+ε)) → T(n) = Θ(f(n))",
      ];
      break;

    case "comparative":
      answer = keySentences.join(" ");
      keyPoints = keySentences.slice(0, 4).map(s => s.trim());
      break;

    default:
      answer = keySentences.join(" ");
      keyPoints = keySentences.slice(0, 3).map(s => s.trim());
  }

  // Add source reference
  if (chapters.length > 0) {
    answer += `\n\n📖 Source: CLRS — ${chapters.join(", ")}`;
  }

  return {
    type:           queryType,
    topic:          topic || extractTopic(query) || "Analysis of Algorithms",
    answer:         answer.trim(),
    keyPoints:      keyPoints.filter(Boolean).slice(0, 4),
    complexity:     complexity,
    followUp:       generateFollowUp(topic, queryType),
    source:         "CLRS Textbook",
    chapters:       chapters,
  };
};

// ── Generate follow-up questions ──────────────────────────────────
const generateFollowUp = (topic, queryType) => {
  if (!topic) return [];
  const t = topic.toLowerCase();

  const suggestions = {
    "merge sort":    ["What is the recurrence of Merge Sort?", "Compare Merge Sort vs Quick Sort", "What is the space complexity of Merge Sort?"],
    "quick sort":    ["What is the worst case of Quick Sort?", "How does partitioning work?", "Compare Quick Sort vs Merge Sort"],
    "dijkstra":      ["Why doesn't Dijkstra work with negative weights?", "Compare Dijkstra vs Bellman-Ford", "What is the time complexity of Dijkstra?"],
    "dynamic programming": ["What is optimal substructure?", "Explain the Rod Cutting problem", "What is the difference between DP and Greedy?"],
    "master theorem": ["Solve T(n) = 2T(n/2) + n", "What are the 3 cases of Master Theorem?", "Solve T(n) = T(n/2) + 1"],
    "bfs":           ["Compare BFS vs DFS", "What is BFS used for?", "What is the time complexity of BFS?"],
    "dfs":           ["What are the edge types in DFS?", "How is DFS used for topological sort?", "Compare DFS vs BFS"],
    "asymptotic notation": ["What is Big-Theta notation?", "What is little-o notation?", "What is the difference between O and Theta?"],
  };

  for (const [key, questions] of Object.entries(suggestions)) {
    if (t.includes(key)) return questions;
  }

  return [
    `What is the time complexity of ${topic}?`,
    `Explain ${topic} with an example`,
    `Compare ${topic} with a related algorithm`,
  ];
};

// ── Main function ─────────────────────────────────────────────────
const askSmartEngine = async (userQuery) => {
  try {
    console.log(`\n🔍 Smart Engine: "${userQuery}"`);

    // Check if AoA related
    if (!isAoAQuery(userQuery)) {
      return {
        success: true,
        data: {
          type:      "restriction",
          topic:     "Out of Domain",
          answer:    "I am AoA-Tutor, specialized only in Analysis of Algorithms. I cannot answer questions outside this domain.\n\nPlease ask me about:\n• Sorting algorithms (Merge Sort, Quick Sort, Heap Sort)\n• Graph algorithms (BFS, DFS, Dijkstra)\n• Dynamic Programming\n• Asymptotic Notation (Big-O, Omega, Theta)\n• Master Theorem and Recurrences\n• Trees (BST, Red-Black Trees)\n• Greedy Algorithms",
          keyPoints: [],
          complexity: null,
          followUp:  ["What is Merge Sort?", "Explain Dijkstra algorithm", "What is Big-O notation?"],
          source:    "domain-restriction",
        },
      };
    }

    // Detect intent and topic
    const queryType = detectQueryType(userQuery);
    const topic     = extractTopic(userQuery);
    console.log(`🎯 Type: ${queryType} | Topic: ${topic}`);

    // Search the CLRS book
    const ragResults = await searchBook(topic || userQuery);
    console.log(`📚 Found ${ragResults.length} book passages`);

    // Build structured response
    const response = buildResponse(userQuery, topic, queryType, ragResults);
    console.log(`✅ Response built for: ${response.topic}`);

    return { success: true, data: response };

  } catch (err) {
    console.error("❌ Smart Engine error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { askSmartEngine, isAoAQuery, extractTopic };