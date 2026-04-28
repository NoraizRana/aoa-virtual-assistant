/**
 * matcher.js — Smart Topic Matcher
 * Finds the most relevant topic for any AoA query
 */

const matchTopic = (queryText, topics) => {
  if (!queryText || !topics?.length) return null;

  const q = queryText.toLowerCase().trim();

  // ── Pass 1: Exact alias match ─────────────────────────────────
  for (const topic of topics) {
    const aliases = (topic.aliases || []).map(a => a.toLowerCase());
    if (aliases.some(a => a === q)) {
      console.log(`✅ [Exact alias] "${topic.name}"`);
      return topic;
    }
  }

  // ── Pass 2: Exact name match ──────────────────────────────────
  for (const topic of topics) {
    if (topic.name.toLowerCase() === q) {
      console.log(`✅ [Exact name] "${topic.name}"`);
      return topic;
    }
  }

  // ── Pass 3: Score every topic ─────────────────────────────────
  const scored = topics.map(topic => {
    let score = 0;
    const name     = topic.name.toLowerCase();
    const aliases  = (topic.aliases  || []).map(a => a.toLowerCase());
    const keywords = (topic.keywords || []).map(k => k.toLowerCase());

    // Alias scoring
    for (const alias of aliases) {
      if (alias === q)                              { score += 200; break; }
      if (alias.includes(q) && q.length >= 4)      { score += 80;  }
      if (q.includes(alias) && alias.length >= 4)  { score += 60;  }
    }

    // Keyword scoring
    for (const kw of keywords) {
      if (kw === q)                             { score += 150; }
      if (q.includes(kw) && kw.length >= 4)    { score += kw.length * 5; }
      if (kw.includes(q) && q.length >= 4)     { score += q.length * 3;  }
    }

    // Name scoring
    if (name === q)                               { score += 180; }
    else if (q.includes(name) && name.length > 4) { score += 70;  }
    else if (name.includes(q) && q.length > 4)    { score += 50;  }

    // Word-level matching
    const qWords = q.split(/\s+/).filter(w => w.length > 2);
    const nameWords = name.split(/\s+/);
    const matchedWords = qWords.filter(w => nameWords.some(nw => nw.includes(w) || w.includes(nw)));
    score += matchedWords.length * 15;

    return { topic, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (best && best.score >= 30) {
    console.log(`✅ [Scored ${best.score}] "${best.topic.name}"`);
    return best.topic;
  }

  console.log(`❌ No match found for: "${q}"`);
  return null;
};

module.exports = { matchTopic };