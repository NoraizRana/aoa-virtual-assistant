/**
 * Builds different response formats based on detected intent
 */

const buildConceptualResponse = (topic) => ({
  type: "conceptual",
  topic: topic.name,
  definition: topic.definition,
  intuition: topic.intuition,
  steps: topic.steps,
  example: topic.example,
  timeComplexity: topic.complexity?.time?.average || topic.complexity?.time,
  spaceComplexity: topic.complexity?.space,
  category: topic.category,
});

const buildProceduralResponse = (topic) => ({
  type: "procedural",
  topic: topic.name,
  definition: topic.definition,
  steps: topic.steps,
  pseudocode: topic.pseudocode,
  example: topic.example,
  timeComplexity: topic.complexity?.time?.average || topic.complexity?.time,
  spaceComplexity: topic.complexity?.space,
});

const buildComparativeResponse = (topic1, topic2) => {
  const comparison = topic1.comparisons?.[
    topic2.name.toLowerCase().replace(/\s+/g, "_")
  ] || topic2.comparisons?.[
    topic1.name.toLowerCase().replace(/\s+/g, "_")
  ];

  return {
    type: "comparative",
    topic: `${topic1.name} vs ${topic2.name}`,
    comparison_text: comparison || `Comparing ${topic1.name} and ${topic2.name}:`,
    topic1: {
      name: topic1.name,
      complexity: topic1.complexity,
      advantages: topic1.advantages,
      disadvantages: topic1.disadvantages,
    },
    topic2: {
      name: topic2.name,
      complexity: topic2.complexity,
      advantages: topic2.advantages,
      disadvantages: topic2.disadvantages,
    },
  };
};

const buildMathResponse = (mathResult) => ({
  type: "mathematical",
  topic: "Recurrence Solution — Master Theorem",
  ...mathResult,
});

const buildComplexityResponse = (data) => ({
  type: "complexity",
  topic: `Complexity of ${data.algorithm}`,
  timeComplexity: data.average,
  bestCase: data.best,
  worstCase: data.worst,
  spaceComplexity: data.space,
});

module.exports = {
  buildConceptualResponse,
  buildProceduralResponse,
  buildComparativeResponse,
  buildMathResponse,
  buildComplexityResponse,
};