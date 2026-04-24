const { spawn } = require("child_process");
const path      = require("path");
const { Ollama } = require("ollama");

const ollama   = new Ollama({ host: "http://localhost:11434" });
const MODEL    = "aoa-tutor";
const RAG_DIR  = path.join(__dirname, "../rag");

/**
 * Search the CLRS book for relevant passages
 */
const searchBook = (query) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", [
      path.join(RAG_DIR, "search.py"),
      query,
    ]);

    let output = "";
    let errors = "";

    py.stdout.on("data", (d) => { output += d.toString(); });
    py.stderr.on("data", (d) => { errors += d.toString(); });

    py.on("close", (code) => {
      if (code !== 0) {
        console.error("RAG search error:", errors);
        resolve([]); // return empty — fall back to Ollama only
        return;
      }
      try {
        const results = JSON.parse(output);
        resolve(results);
      } catch {
        resolve([]);
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      py.kill();
      resolve([]);
    }, 10000);
  });
};

/**
 * Main RAG function:
 * 1. Search book for relevant passages
 * 2. Send passages + query to Llama
 * 3. Llama answers FROM the book content
 */
const askWithRAG = async (userQuery) => {
  try {
    console.log(`\n📚 RAG Query: "${userQuery}"`);

    // Step 1: Search the book
    const bookPassages = await searchBook(userQuery);
    console.log(`🔍 Found ${bookPassages.length} relevant passages`);

    // Step 2: Build context from book passages
    let bookContext = "";
    if (bookPassages.length > 0) {
      bookContext = bookPassages
        .map((p, i) =>
          `[Source ${i + 1} — ${p.chapter}]:\n${p.text}`
        )
        .join("\n\n");
    }

    // Step 3: Build prompt
    const prompt = bookContext
      ? `You are an AoA teaching assistant. Answer the student's question 
ONLY using the textbook passages provided below. 
If the answer is not in the passages, say so clearly.

=== TEXTBOOK PASSAGES (CLRS) ===
${bookContext}

=== STUDENT QUESTION ===
${userQuery}

=== YOUR ANSWER ===
Respond in this JSON format only:
{
  "topic": "topic name",
  "type": "conceptual|procedural|mathematical|comparative",
  "answer": "detailed answer based on the textbook passages above",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "complexity": {"time": "O(...)", "space": "O(...)"},
  "followUp": ["related question 1", "related question 2"],
  "source": "CLRS textbook"
}`
      : `You are an AoA teaching assistant specialized in Analysis of 
Algorithms (CLRS textbook). Answer this question:
${userQuery}

Respond in JSON format:
{
  "topic": "topic name",
  "type": "conceptual|procedural|mathematical|comparative", 
  "answer": "detailed answer",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "complexity": {"time": "O(...)", "space": "O(...)"},
  "followUp": ["related question 1", "related question 2"],
  "source": "general knowledge"
}`;

    // Step 4: Ask Llama with book context
    let fullResponse = "";
    const stream = await ollama.chat({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      options: {
        temperature: 0.1,
        num_predict: 800,
        num_ctx:     4096,
      },
    });

    for await (const chunk of stream) {
      fullResponse += chunk.message.content;
    }

    console.log("📤 Response (first 200):", fullResponse.substring(0, 200));

    // Step 5: Parse response until we get valid JSON
    let parsed;
    try {
      const start = fullResponse.indexOf("{");
      const end   = fullResponse.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        parsed = JSON.parse(fullResponse.substring(start, end + 1));
      } else throw new Error("No JSON");
    } catch {
      parsed = {
        topic:      extractTopic(userQuery),
        type:       "conceptual",
        answer:     fullResponse,
        keyPoints:  [],
        complexity: null,
        followUp:   [],
        source:     bookPassages.length > 0 ? "CLRS textbook" : "general",
      };
    }

    // Add source chapters
    if (bookPassages.length > 0) {
      parsed.chapters = [...new Set(bookPassages.map(p => p.chapter))];
    }

    if (!parsed.topic)     parsed.topic     = extractTopic(userQuery);
    if (!parsed.keyPoints) parsed.keyPoints = [];
    if (!parsed.followUp)  parsed.followUp  = [];

    console.log(`✅ RAG complete — Topic: "${parsed.topic}"`);
    return { success: true, data: parsed };

  } catch (err) {
    console.error("❌ RAG error:", err.message);
    return { success: false, error: err.message };
  }
};

const extractTopic = (query) => {
  const q = query.toLowerCase();
  const map = [
    ["merge sort",          "Merge Sort"],
    ["quick sort",          "Quick Sort"],
    ["quicksort",           "Quick Sort"],
    ["heap sort",           "Heap Sort"],
    ["bubble sort",         "Bubble Sort"],
    ["insertion sort",      "Insertion Sort"],
    ["counting sort",       "Counting Sort"],
    ["radix sort",          "Radix Sort"],
    ["bucket sort",         "Bucket Sort"],
    ["binary search tree",  "Binary Search Trees"],
    ["binary search",       "Binary Search"],
    ["dijkstra",            "Dijkstra's Algorithm"],
    ["bellman",             "Bellman-Ford"],
    ["bfs",                 "BFS"],
    ["dfs",                 "DFS"],
    ["dynamic programming", "Dynamic Programming"],
    ["greedy",              "Greedy Algorithms"],
    ["master theorem",      "Master Theorem"],
    ["big-o",               "Asymptotic Notation"],
    ["asymptotic",          "Asymptotic Notation"],
    ["little-o",            "Asymptotic Notation"],
    ["little-omega",        "Asymptotic Notation"],
    ["recurrence",          "Recurrences"],
    ["red-black",           "Red-Black Trees"],
    ["minimum spanning",    "Minimum Spanning Tree"],
    ["kruskal",             "Kruskal's Algorithm"],
    ["prim",                "Prim's Algorithm"],
    ["huffman",             "Huffman Codes"],
    ["topological",         "Topological Sort"],
    ["divide",              "Divide and Conquer"],
    ["strassen",            "Strassen's Algorithm"],
    ["lcs",                 "Longest Common Subsequence"],
  ];
  for (const [kw, name] of map) {
    if (q.includes(kw)) return name;
  }
  return "Analysis of Algorithms";
};

module.exports = { askWithRAG };