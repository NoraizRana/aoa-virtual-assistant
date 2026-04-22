const { Ollama } = require("ollama");

const ollama = new Ollama({ host: "http://localhost:11434" });
const MODEL  = "aoa-tutor";

const askAI = async (userQuery) => {
  try {
    console.log(`\n🤖 Sending to aoa-tutor: "${userQuery}"`);
    const startTime = Date.now();

    // Use streaming to get faster first response
    let fullResponse = "";
    const stream = await ollama.chat({
      model: MODEL,
      messages: [{ role: "user", content: userQuery }],
      stream: true,
      options: {
        temperature:    0.1,
        num_predict:    600,
        repeat_penalty: 1.1,
        num_ctx:        2048,
      },
    });

    for await (const chunk of stream) {
      fullResponse += chunk.message.content;
      // Stop early if we have complete JSON
      if (fullResponse.includes("}") &&
          fullResponse.trim().startsWith("{") &&
          fullResponse.split("{").length > 1) {
        const lastBrace = fullResponse.lastIndexOf("}");
        const candidate = fullResponse.substring(0, lastBrace + 1);
        try {
          JSON.parse(candidate);
          fullResponse = candidate;
          console.log("⚡ Early stop — complete JSON received");
          break;
        } catch { /* keep collecting */ }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱  Response time: ${elapsed}s`);
    console.log("📤 Raw (first 300):", fullResponse.substring(0, 300));

    // Parse response
    let parsed;
    try {
      const start = fullResponse.indexOf("{");
      const end   = fullResponse.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        parsed = JSON.parse(fullResponse.substring(start, end + 1));
        console.log("✅ Valid JSON");
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.log("⚠️  Plain text — building structured response");
      parsed = {
        topic:      extractTopic(userQuery),
        type:       "conceptual",
        answer:     fullResponse,
        keyPoints:  extractKeyPoints(fullResponse),
        complexity: extractComplexity(fullResponse),
        followUp:   [],
      };
    }

    if (!parsed.topic)     parsed.topic     = extractTopic(userQuery);
    if (!parsed.type)      parsed.type      = "conceptual";
    if (!parsed.answer)    parsed.answer    = fullResponse;
    if (!parsed.keyPoints) parsed.keyPoints = [];
    if (!parsed.followUp)  parsed.followUp  = [];

    console.log(`✅ Done — Topic: "${parsed.topic}" | Type: "${parsed.type}"`);
    return { success: true, data: parsed };

  } catch (err) {
    console.error("❌ Ollama error:", err.message);
    return { success: false, error: err.message };
  }
};

const extractTopic = (query) => {
  const q = query.toLowerCase();
  const map = [
    ["merge sort",         "Merge Sort"],
    ["quick sort",         "Quick Sort"],
    ["quicksort",          "Quick Sort"],
    ["heap sort",          "Heap Sort"],
    ["bubble sort",        "Bubble Sort"],
    ["insertion sort",     "Insertion Sort"],
    ["counting sort",      "Counting Sort"],
    ["radix sort",         "Radix Sort"],
    ["bucket sort",        "Bucket Sort"],
    ["binary search tree", "Binary Search Trees"],
    ["binary search",      "Binary Search"],
    ["dijkstra",           "Dijkstra's Algorithm"],
    ["bellman",            "Bellman-Ford"],
    ["bfs",                "BFS"],
    ["dfs",                "DFS"],
    ["dynamic programming","Dynamic Programming"],
    ["greedy",             "Greedy Algorithms"],
    ["master theorem",     "Master Theorem"],
    ["big-o",              "Asymptotic Notation"],
    ["big o",              "Asymptotic Notation"],
    ["asymptotic",         "Asymptotic Notation"],
    ["little-o",           "Asymptotic Notation"],
    ["little-omega",       "Asymptotic Notation"],
    ["recurrence",         "Recurrences"],
    ["red-black",          "Red-Black Trees"],
    ["minimum spanning",   "Minimum Spanning Tree"],
    ["kruskal",            "Kruskal's Algorithm"],
    ["prim",               "Prim's Algorithm"],
    ["huffman",            "Huffman Codes"],
    ["topological",        "Topological Sort"],
    ["divide",             "Divide and Conquer"],
    ["strassen",           "Strassen's Algorithm"],
    ["lcs",                "Longest Common Subsequence"],
    ["rod cutting",        "Rod Cutting"],
  ];
  for (const [keyword, name] of map) {
    if (q.includes(keyword)) return name;
  }
  return "Analysis of Algorithms";
};

const extractKeyPoints = (text) => {
  const points = [];
  const lines  = text.split("\n").filter(l => l.trim().length > 20);
  for (const line of lines) {
    if (/^[\d\-\*•]/.test(line.trim())) {
      points.push(line.replace(/^[\d\.\-\*•]\s*/, "").trim());
    }
    if (points.length >= 4) break;
  }
  return points;
};

const extractComplexity = (text) => {
  const timeMatch  = text.match(/[Tt]ime.{0,20}O\(([^)]+)\)/);
  const spaceMatch = text.match(/[Ss]pace.{0,20}O\(([^)]+)\)/);
  if (timeMatch || spaceMatch) {
    return {
      time:  timeMatch  ? `O(${timeMatch[1]})`  : null,
      space: spaceMatch ? `O(${spaceMatch[1]})` : null,
    };
  }
  return null;
};

const checkOllama = async () => {
  try {
    const models = await ollama.list();
    const names  = models.models.map((m) => m.name);
    console.log("📋 Ollama models:", names.join(", ") || "none");
    const hasModel = names.some((n) => n.includes("aoa-tutor"));
    if (hasModel) {
      console.log("✅ aoa-tutor ready");
    } else {
      console.log("⚠️  aoa-tutor not found — run: ollama create aoa-tutor -f Modelfile");
    }
    return true;
  } catch (err) {
    console.log("⚠️  Ollama not reachable:", err.message);
    return false;
  }
};

module.exports = { askAI, checkOllama };