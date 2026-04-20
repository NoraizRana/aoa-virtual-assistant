const { preprocess, tokenize } = require("./preprocessor");
const { expandSynonyms }       = require("./synonyms");
const { rankTopics }           = require("./scorer");

const matchTopic = (queryText, topics) => {
  if (!queryText || !topics?.length) return null;

  const queryLower = queryText.toLowerCase();

  // ── Fast path: check aliases directly ──
  for (const topic of topics) {
    const aliases = topic.aliases || topic.keywords || [];
    for (const alias of aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        console.log(`✅ Alias match: "${alias}" → ${topic.name}`);
        return topic;
      }
    }
  }

  // ── Slow path: TF-IDF scoring ──
  const cleaned  = preprocess(queryText);
  const expanded = expandSynonyms(queryText + " " + cleaned);
  const best     = rankTopics(expanded, topics);

  console.log("✅ Best match:", best ? best.name : "None");
  return best;
};

module.exports = { matchTopic };