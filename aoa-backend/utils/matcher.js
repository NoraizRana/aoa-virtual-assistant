const { preprocess, tokenize } = require("./preprocessor");
const { expandSynonyms }       = require("./synonyms");

const matchTopic = (queryText, topics) => {
  if (!queryText || !topics?.length) return null;

  const queryLower = queryText.toLowerCase().trim();

  // ── STEP 1: Exact name match (highest priority) ──────────────
  for (const topic of topics) {
    if (topic.name.toLowerCase() === queryLower) {
      console.log(`✅ Exact match: ${topic.name}`);
      return topic;
    }
  }

  // ── STEP 2: Alias exact match ────────────────────────────────
  for (const topic of topics) {
    const aliases = topic.aliases || [];
    for (const alias of aliases) {
      if (alias.toLowerCase() === queryLower) {
        console.log(`✅ Alias exact: ${topic.name}`);
        return topic;
      }
    }
  }

  // ── STEP 3: Name contains query OR query contains name ───────
  for (const topic of topics) {
    const name = topic.name.toLowerCase();
    if (name.includes(queryLower) || queryLower.includes(name)) {
      console.log(`✅ Name contains: ${topic.name}`);
      return topic;
    }
  }

  // ── STEP 4: Alias contains query ────────────────────────────
  for (const topic of topics) {
    const aliases = topic.aliases || [];
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (queryLower.includes(a) || a.includes(queryLower)) {
        console.log(`✅ Alias contains: ${topic.name}`);
        return topic;
      }
    }
  }

  // ── STEP 5: Keyword scoring (last resort) ───────────────────
  let bestMatch  = null;
  let bestScore  = 0;

  for (const topic of topics) {
    let score = 0;
    const keywords = [
      ...( topic.aliases  || []),
      ...( topic.keywords || []),
      topic.name,
    ];

    for (const kw of keywords) {
      const k = kw.toLowerCase();
      if (queryLower.includes(k)) {
        score += k.length * 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  if (bestScore >= 6) {
    console.log(`✅ Keyword match: ${bestMatch.name} (score: ${bestScore})`);
    return bestMatch;
  }

  console.log("❌ No match found");
  return null;
};

module.exports = { matchTopic };