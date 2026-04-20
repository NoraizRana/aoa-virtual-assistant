/**
 * scorer.js
 * Scores topics against a query using:
 * - Keyword overlap (weighted by keyword length)
 * - Token frequency (TF-IDF inspired)
 * - Exact phrase bonus
 * - Title match bonus
 */

const { tokenize } = require("./preprocessor");

/**
 * Calculate term frequency of tokens in a document
 */
const termFrequency = (tokens) => {
  const tf = {};
  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
};

/**
 * Score a single topic against query tokens
 */
const scoreTopic = (queryTokens, queryRaw, topic) => {
  let score = 0;
  const queryLower = queryRaw.toLowerCase();

  // --- 1. Exact topic name match (highest priority) ---
  if (queryLower.includes(topic.name.toLowerCase())) {
    score += 100;
  }

  // --- 2. Keyword matching with length weighting ---
  topic.keywords.forEach((keyword) => {
    const kw = keyword.toLowerCase();
    if (queryLower.includes(kw)) {
      // Longer keywords = more specific = higher score
      score += kw.length * 3;
    }
  });

  // --- 3. Token-level TF matching ---
  const topicText = [
    topic.name,
    ...(topic.keywords || []),
    topic.definition || "",
    topic.category || "",
  ]
    .join(" ")
    .toLowerCase();

  const topicTokens = tokenize(topicText);
  const topicTF = termFrequency(topicTokens);
  const queryTF = termFrequency(queryTokens);

  // For each query token, check if it appears in topic
  Object.entries(queryTF).forEach(([token, qFreq]) => {
    if (topicTF[token]) {
      // TF-IDF inspired: reward rare but matching tokens
      score += qFreq * topicTF[token] * 2;
    }
  });

  // --- 4. Category match bonus ---
  if (queryLower.includes(topic.category)) {
    score += 10;
  }

  return score;
};

/**
 * Rank all topics and return best match
 */
const rankTopics = (queryRaw, topics) => {
  const queryTokens = tokenize(queryRaw);

  if (queryTokens.length === 0) return null;

  const scored = topics.map((topic) => ({
    topic,
    score: scoreTopic(queryTokens, queryRaw, topic),
  }));

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Debug log (remove in production)
  console.log(
    "📊 Topic scores:",
    scored.map((s) => `${s.topic.name}: ${s.score}`)
  );

  // Only return if score is meaningful
  const best = scored[0];
  return best.score >= 5 ? best.topic : null;
};

module.exports = { rankTopics };