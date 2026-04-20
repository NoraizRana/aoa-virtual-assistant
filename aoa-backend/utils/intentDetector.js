/**
 * Detects the TYPE of query so we can respond appropriately
 * Intents: conceptual | comparative | mathematical | procedural | complexity
 */

const INTENT_PATTERNS = {
  comparative: [
    /vs\.?|versus|compare|difference|better|worse|prefer|which is|between|contrast/i
  ],
  mathematical: [
    /recurrence|master theorem|big.?o|complexity of|time complexity|space complexity|asymptot|notation|omega|theta/i,
    /T\(n\)|O\(|t\(n\)/i
  ],
  procedural: [
    /how does|how do|how to|how can|steps|process|work|implement|write|code|algorithm for|procedure/i
  ],
  conceptual: [
    /what is|what are|define|explain|describe|tell me about|meaning|definition|overview/i
  ],
  example: [
    /example|show me|demonstrate|trace|walkthrough|illustrate|sample|instance/i
  ],
};

const detectIntent = (query) => {
  const q = query.toLowerCase();

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some((p) => p.test(q))) {
      return intent;
    }
  }

  return "conceptual";
};

module.exports = { detectIntent };