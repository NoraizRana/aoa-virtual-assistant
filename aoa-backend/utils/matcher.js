const matchTopic = (queryText, topics) => {
  if (!queryText || !topics?.length) return null;

  const q = queryText.toLowerCase().trim();

  // ── Priority 1: Exact alias match ────────────────────────────
  for (const topic of topics) {
    const aliases = (topic.aliases || []).map(a => a.toLowerCase());
    if (aliases.includes(q)) {
      console.log(`✅ Exact alias: "${topic.name}"`);
      return topic;
    }
  }

  // ── Priority 2: Exact name match ──────────────────────────────
  for (const topic of topics) {
    if (topic.name.toLowerCase() === q) {
      console.log(`✅ Exact name: "${topic.name}"`);
      return topic;
    }
  }

  // ── Priority 3: Score every topic — pick highest ──────────────
  let best  = null;
  let bestScore = 0;

  for (const topic of topics) {
    let score = 0;
    const name    = topic.name.toLowerCase();
    const aliases = (topic.aliases  || []).map(a => a.toLowerCase());
    const keywords= (topic.keywords || []).map(k => k.toLowerCase());

    // Alias contains query exactly
    for (const alias of aliases) {
      if (alias === q) { score += 100; break; }
      if (alias.includes(q)) { score += 50; break; }
      if (q.includes(alias) && alias.length > 4) { score += 40; break; }
    }

    // Keyword exact match
    for (const kw of keywords) {
      if (kw === q) { score += 80; break; }
      if (q.includes(kw) && kw.length > 4) { score += kw.length * 3; }
      if (kw.includes(q) && q.length > 4)  { score += q.length * 2; }
    }

    // Name match (lower priority — avoid broad matches)
    if (name === q) {
      score += 90;
    } else if (q.split(" ").every(word => name.includes(word)) && q.length > 4) {
      score += 30;
    }

    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (bestScore >= 30) {
    console.log(`✅ Best match: "${best.name}" (score: ${bestScore})`);
    return best;
  }

  console.log(`❌ No match for: "${q}"`);
  return null;
};

module.exports = { matchTopic };