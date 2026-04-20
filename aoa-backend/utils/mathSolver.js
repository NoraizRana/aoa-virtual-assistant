/**
 * Solves recurrence relations and complexity questions
 * using the Master Theorem and pattern matching
 */

// Master Theorem solver
const solveMasterTheorem = (a, b, k) => {
  const log_b_a = Math.log(a) / Math.log(b);
  const result = { a, b, k, log_b_a: log_b_a.toFixed(2) };

  if (log_b_a > k) {
    result.case = "Case 1";
    result.condition = `log_${b}(${a}) = ${log_b_a.toFixed(2)} > ${k}`;
    result.solution = `T(n) = Θ(n^${log_b_a.toFixed(2)})`;
    result.explanation = "The recursive work dominates. Solution grows as n^(log_b a).";
  } else if (Math.abs(log_b_a - k) < 0.001) {
    result.case = "Case 2";
    result.condition = `log_${b}(${a}) = ${log_b_a.toFixed(2)} == ${k}`;
    result.solution = k === 0
      ? `T(n) = Θ(log n)`
      : `T(n) = Θ(n^${k} log n)`;
    result.explanation = "Work is balanced between recursive and non-recursive parts.";
  } else {
    result.case = "Case 3";
    result.condition = `log_${b}(${a}) = ${log_b_a.toFixed(2)} < ${k}`;
    result.solution = `T(n) = Θ(n^${k})`;
    result.explanation = "The non-recursive work dominates. Solution grows as n^k.";
  }

  return result;
};

// Parse recurrence from query like "T(n) = 2T(n/2) + n"
const parseRecurrence = (query) => {
  // Match: T(n) = aT(n/b) + n^k
  const pattern = /T\(n\)\s*=\s*(\d+)T\(n\/(\d+)\)\s*\+\s*(?:O\()?n\^?(\d*)/i;
  const match = query.match(pattern);

  if (match) {
    const a = parseInt(match[1]);
    const b = parseInt(match[2]);
    const k = match[3] ? parseInt(match[3]) : 1;
    return { a, b, k, found: true };
  }

  // Match: T(n) = aT(n/b) + 1  (constant)
  const constPattern = /T\(n\)\s*=\s*(\d+)T\(n\/(\d+)\)\s*\+\s*(?:O\()?1/i;
  const constMatch = query.match(constPattern);

  if (constMatch) {
    return {
      a: parseInt(constMatch[1]),
      b: parseInt(constMatch[2]),
      k: 0,
      found: true,
    };
  }

  return { found: false };
};

// Known complexity facts
const COMPLEXITY_FACTS = {
  "merge sort":    { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  "quick sort":    { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  "bubble sort":   { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)" },
  "binary search": { best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)" },
  "dijkstra":      { best: "O((V+E) log V)", average: "O((V+E) log V)", worst: "O(V²)", space: "O(V)" },
  "bfs":           { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)", space: "O(V)" },
  "dfs":           { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)", space: "O(V)" },
};

const getComplexity = (query) => {
  const q = query.toLowerCase();
  for (const [algo, complexity] of Object.entries(COMPLEXITY_FACTS)) {
    if (q.includes(algo)) return { algorithm: algo, ...complexity };
  }
  return null;
};

module.exports = { solveMasterTheorem, parseRecurrence, getComplexity };