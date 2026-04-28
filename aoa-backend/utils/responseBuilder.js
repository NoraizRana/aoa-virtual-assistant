/**
 * responseBuilder.js
 * Builds structured responses for every query type
 */

// ── Conceptual Response ───────────────────────────────────────────
const buildConceptualResponse = (topic) => ({
  type:            "conceptual",
  topic:           topic.name,
  category:        topic.category,
  difficulty:      topic.difficulty,
  definition:      topic.definition       || "",
  intuition:       topic.intuition        || null,
  steps:           topic.steps            || [],
  keyPoints:       buildKeyPoints(topic),
  timeComplexity:  getTime(topic),
  spaceComplexity: topic.complexity?.space || null,
  advantages:      topic.advantages       || [],
  disadvantages:   topic.disadvantages    || [],
  followUp:        buildFollowUp(topic),
});

// ── Procedural Response ───────────────────────────────────────────
const buildProceduralResponse = (topic) => ({
  type:            "procedural",
  topic:           topic.name,
  category:        topic.category,
  difficulty:      topic.difficulty,
  definition:      topic.definition  || "",
  steps:           topic.steps       || [],
  pseudocode:      topic.pseudocode  || null,
  example:         topic.example     || null,
  keyPoints:       (topic.steps || []).slice(0, 4),
  timeComplexity:  getTime(topic),
  spaceComplexity: topic.complexity?.space || null,
  followUp:        buildFollowUp(topic),
});

// ── Comparative Response ──────────────────────────────────────────
const buildComparativeResponse = (t1, t2) => {
  const cmp = t1.comparisons?.[t2.name.toLowerCase().replace(/\s+/g, "_")]
           || t2.comparisons?.[t1.name.toLowerCase().replace(/\s+/g, "_")]
           || `Both ${t1.name} and ${t2.name} are important algorithms with different trade-offs.`;

  return {
    type:    "comparative",
    topic:   `${t1.name} vs ${t2.name}`,
    comparison_text: cmp,
    topic1: {
      name:          t1.name,
      definition:    t1.definition || "",
      timeComplexity: getTime(t1),
      spaceComplexity: t1.complexity?.space || null,
      advantages:    t1.advantages    || [],
      disadvantages: t1.disadvantages || [],
    },
    topic2: {
      name:          t2.name,
      definition:    t2.definition || "",
      timeComplexity: getTime(t2),
      spaceComplexity: t2.complexity?.space || null,
      advantages:    t2.advantages    || [],
      disadvantages: t2.disadvantages || [],
    },
    keyPoints: [
      `${t1.name} time: ${getTime(t1) || "varies"}`,
      `${t2.name} time: ${getTime(t2) || "varies"}`,
      `${t1.name} space: ${t1.complexity?.space || "varies"}`,
      `${t2.name} space: ${t2.complexity?.space || "varies"}`,
    ],
    followUp: [
      `When to use ${t1.name}?`,
      `When to use ${t2.name}?`,
      `What is the space complexity of ${t1.name}?`,
    ],
  };
};

// ── Math Response ─────────────────────────────────────────────────
const buildMathResponse = (result) => ({
  type:  "mathematical",
  topic: "Master Theorem — Recurrence Solution",
  definition: [
    `Recurrence: T(n) = ${result.a}T(n/${result.b}) + n^${result.k}`,
    ``,
    `Step 1: Identify values`,
    `  a = ${result.a} (number of subproblems)`,
    `  b = ${result.b} (size reduction factor)`,
    `  k = ${result.k} (exponent of f(n) = n^k)`,
    ``,
    `Step 2: Compute log_b(a)`,
    `  log_${result.b}(${result.a}) = ${result.log_b_a}`,
    ``,
    `Step 3: Compare f(n) = n^${result.k} with n^log_b(a) = n^${result.log_b_a}`,
    ``,
    `Step 4: ${result.case} applies`,
    `  Condition: ${result.condition}`,
    ``,
    `Step 5: Solution`,
    `  ✅ ${result.solution}`,
    ``,
    `Explanation: ${result.explanation}`,
  ].join("\n"),
  keyPoints: [
    `a = ${result.a}, b = ${result.b}, k = ${result.k}`,
    `log_${result.b}(${result.a}) = ${result.log_b_a}`,
    `${result.case}: ${result.condition}`,
    `✅ Solution: ${result.solution}`,
  ],
  timeComplexity:  result.solution,
  spaceComplexity: null,
  followUp: [
    "Solve T(n) = T(n/2) + 1",
    "What are the 3 cases of Master Theorem?",
    "Solve T(n) = 4T(n/2) + n²",
    "What is the recurrence for Merge Sort?",
  ],
});

// ── Complexity Response ───────────────────────────────────────────
const buildComplexityResponse = (data) => ({
  type:  "complexity",
  topic: `Time & Space Complexity of ${data.algorithm}`,
  definition: [
    `Best Case:    ${data.best}`,
    `Average Case: ${data.average}`,
    `Worst Case:   ${data.worst}`,
    `Space:        ${data.space}`,
    data.stable !== null ? `Stable:       ${data.stable ? "Yes ✅" : "No ❌"}` : "",
  ].filter(Boolean).join("\n"),
  keyPoints: [
    `Best Case: ${data.best}`,
    `Average Case: ${data.average}`,
    `Worst Case: ${data.worst}`,
    `Space Complexity: ${data.space}`,
  ],
  timeComplexity:  data.average,
  spaceComplexity: data.space,
  followUp: [
    `How does ${data.algorithm} work?`,
    `Explain ${data.algorithm} with an example`,
    `Compare ${data.algorithm} with another sorting algorithm`,
  ],
});

// ── Example Response ──────────────────────────────────────────────
const buildExampleResponse = (topic) => ({
  type:      "example",
  topic:     topic.name,
  definition: topic.definition || "",
  example:   topic.example || null,
  steps:     topic.steps || [],
  keyPoints: topic.example
    ? [`Input: ${topic.example.input || ""}`, `Output: ${topic.example.output || ""}`]
    : (topic.steps || []).slice(0, 3),
  timeComplexity:  getTime(topic),
  spaceComplexity: topic.complexity?.space || null,
  followUp:        buildFollowUp(topic),
});

// ── Helpers ───────────────────────────────────────────────────────
const getTime = (topic) =>
  topic.complexity?.time?.average ||
  topic.complexity?.time?.worst   ||
  (typeof topic.complexity?.time === "string" ? topic.complexity.time : null);

const buildKeyPoints = (topic) => {
  const pts = [];
  if (getTime(topic))              pts.push(`Time Complexity: ${getTime(topic)}`);
  if (topic.complexity?.space)     pts.push(`Space Complexity: ${topic.complexity.space}`);
  if (topic.advantages?.length)    pts.push(`Advantage: ${topic.advantages[0]}`);
  if (topic.disadvantages?.length) pts.push(`Disadvantage: ${topic.disadvantages[0]}`);
  return pts.slice(0, 4);
};

const buildFollowUp = (topic) => {
  const name = topic.name;
  const related = topic.related_topics || [];
  return [
    `What is the time complexity of ${name}?`,
    `Explain ${name} with a step-by-step example`,
    related[0] ? `How does ${related[0].replace(/-/g," ")} compare to ${name}?` : null,
    `What are the advantages of ${name}?`,
  ].filter(Boolean).slice(0, 3);
};

module.exports = {
  buildConceptualResponse,
  buildProceduralResponse,
  buildComparativeResponse,
  buildMathResponse,
  buildComplexityResponse,
  buildExampleResponse,
};