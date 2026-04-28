/**
 * mathSolver.js
 * Solves recurrences and complexity queries
 */

// ── Master Theorem Solver ─────────────────────────────────────────
const solveMasterTheorem = (a, b, k) => {
  const log_b_a = Math.log(a) / Math.log(b);
  const result  = { a, b, k, log_b_a: log_b_a.toFixed(3) };

  if (log_b_a > k + 0.001) {
    result.case        = "Case 1";
    result.condition   = `log_${b}(${a}) = ${log_b_a.toFixed(3)} > k = ${k}`;
    result.solution    = `T(n) = Θ(n^${log_b_a.toFixed(2)})`;
    result.explanation = "The recursive work dominates. Solution grows polynomially faster than f(n).";
  } else if (Math.abs(log_b_a - k) <= 0.001) {
    result.case        = "Case 2";
    result.condition   = `log_${b}(${a}) = ${log_b_a.toFixed(3)} == k = ${k}`;
    result.solution    = k === 0 ? `T(n) = Θ(log n)` : `T(n) = Θ(n^${k} log n)`;
    result.explanation = "Work is evenly distributed across all levels of recursion.";
  } else {
    result.case        = "Case 3";
    result.condition   = `log_${b}(${a}) = ${log_b_a.toFixed(3)} < k = ${k}`;
    result.solution    = `T(n) = Θ(n^${k})`;
    result.explanation = "The non-recursive (combining) work dominates.";
  }

  return result;
};

// ── Parse Recurrence from Query ───────────────────────────────────
const parseRecurrence = (query) => {
  const q = query.toLowerCase();

  // Pattern: T(n) = aT(n/b) + n^k  or  T(n) = aT(n/b) + n
  const patterns = [
    // T(n) = 2T(n/2) + n^2
    /t\s*\(\s*n\s*\)\s*=\s*(\d+)\s*t\s*\(\s*n\s*\/\s*(\d+)\s*\)\s*\+\s*(?:o\s*\()?\s*n\s*\^\s*(\d+)/i,
    // T(n) = 2T(n/2) + n
    /t\s*\(\s*n\s*\)\s*=\s*(\d+)\s*t\s*\(\s*n\s*\/\s*(\d+)\s*\)\s*\+\s*(?:o\s*\()?\s*n(?!\^)/i,
    // T(n) = 2T(n/2) + 1
    /t\s*\(\s*n\s*\)\s*=\s*(\d+)\s*t\s*\(\s*n\s*\/\s*(\d+)\s*\)\s*\+\s*(?:o\s*\()?\s*1/i,
    // T(n) = T(n/2) + n^k
    /t\s*\(\s*n\s*\)\s*=\s*t\s*\(\s*n\s*\/\s*(\d+)\s*\)\s*\+\s*(?:o\s*\()?\s*n\s*\^\s*(\d+)/i,
    // T(n) = T(n/2) + n
    /t\s*\(\s*n\s*\)\s*=\s*t\s*\(\s*n\s*\/\s*(\d+)\s*\)\s*\+\s*(?:o\s*\()?\s*n/i,
    // T(n) = T(n/2) + 1
    /t\s*\(\s*n\s*\)\s*=\s*t\s*\(\s*n\s*\/\s*(\d+)\s*\)\s*\+\s*(?:o\s*\()?\s*1/i,
  ];

  // Pattern with a subproblems and n^k
  const m1 = q.match(/t\(n\)\s*=\s*(\d+)t\(n\/(\d+)\)\s*\+\s*(?:o\()?n\^(\d+)/i);
  if (m1) return { found: true, a: +m1[1], b: +m1[2], k: +m1[3] };

  // Pattern with a subproblems and n
  const m2 = q.match(/t\(n\)\s*=\s*(\d+)t\(n\/(\d+)\)\s*\+\s*(?:o\()?n(?!\^|\d)/i);
  if (m2) return { found: true, a: +m2[1], b: +m2[2], k: 1 };

  // Pattern with a subproblems and 1
  const m3 = q.match(/t\(n\)\s*=\s*(\d+)t\(n\/(\d+)\)\s*\+\s*(?:o\()?1/i);
  if (m3) return { found: true, a: +m3[1], b: +m3[2], k: 0 };

  // Pattern with 1 subproblem and n^k
  const m4 = q.match(/t\(n\)\s*=\s*t\(n\/(\d+)\)\s*\+\s*(?:o\()?n\^(\d+)/i);
  if (m4) return { found: true, a: 1, b: +m4[1], k: +m4[2] };

  // Pattern with 1 subproblem and n
  const m5 = q.match(/t\(n\)\s*=\s*t\(n\/(\d+)\)\s*\+\s*(?:o\()?n(?!\^|\d)/i);
  if (m5) return { found: true, a: 1, b: +m5[1], k: 1 };

  // Pattern with 1 subproblem and 1
  const m6 = q.match(/t\(n\)\s*=\s*t\(n\/(\d+)\)\s*\+\s*(?:o\()?1/i);
  if (m6) return { found: true, a: 1, b: +m6[1], k: 0 };

  return { found: false };
};

// ── Complexity Database ───────────────────────────────────────────
const COMPLEXITY_DB = {
  "merge sort":        { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)",      stable: true  },
  "mergesort":         { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)",      stable: true  },
  "quick sort":        { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)",      space: "O(log n)", stable: false },
  "quicksort":         { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)",      space: "O(log n)", stable: false },
  "heap sort":         { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)",     stable: false },
  "heapsort":          { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)",     stable: false },
  "bubble sort":       { best: "O(n)",       average: "O(n²)",      worst: "O(n²)",      space: "O(1)",     stable: true  },
  "insertion sort":    { best: "O(n)",       average: "O(n²)",      worst: "O(n²)",      space: "O(1)",     stable: true  },
  "selection sort":    { best: "O(n²)",      average: "O(n²)",      worst: "O(n²)",      space: "O(1)",     stable: false },
  "counting sort":     { best: "O(n+k)",     average: "O(n+k)",     worst: "O(n+k)",     space: "O(k)",     stable: true  },
  "radix sort":        { best: "O(d(n+k))",  average: "O(d(n+k))",  worst: "O(d(n+k))",  space: "O(n+k)",  stable: true  },
  "bucket sort":       { best: "O(n)",       average: "O(n)",       worst: "O(n²)",      space: "O(n)",     stable: true  },
  "binary search":     { best: "O(1)",       average: "O(log n)",   worst: "O(log n)",   space: "O(1)",     stable: null  },
  "linear search":     { best: "O(1)",       average: "O(n)",       worst: "O(n)",       space: "O(1)",     stable: null  },
  "bfs":               { best: "O(V+E)",     average: "O(V+E)",     worst: "O(V+E)",     space: "O(V)",     stable: null  },
  "dfs":               { best: "O(V+E)",     average: "O(V+E)",     worst: "O(V+E)",     space: "O(V)",     stable: null  },
  "dijkstra":          { best: "O((V+E)logV)",average: "O((V+E)logV)",worst: "O((V+E)logV)",space: "O(V)", stable: null  },
  "bellman-ford":      { best: "O(VE)",      average: "O(VE)",      worst: "O(VE)",      space: "O(V)",     stable: null  },
  "bellman ford":      { best: "O(VE)",      average: "O(VE)",      worst: "O(VE)",      space: "O(V)",     stable: null  },
  "kruskal":           { best: "O(E log E)", average: "O(E log E)", worst: "O(E log E)", space: "O(V)",     stable: null  },
  "prim":              { best: "O(E log V)", average: "O(E log V)", worst: "O(E log V)", space: "O(V)",     stable: null  },
  "topological sort":  { best: "O(V+E)",     average: "O(V+E)",     worst: "O(V+E)",     space: "O(V)",     stable: null  },
  "dynamic programming": { best: "O(n)",     average: "O(n²)",      worst: "O(n³)",      space: "O(n²)",   stable: null  },
};

const getComplexity = (query) => {
  const q = query.toLowerCase();
  for (const [algo, data] of Object.entries(COMPLEXITY_DB)) {
    if (q.includes(algo)) {
      return { algorithm: algo, ...data };
    }
  }
  return null;
};

// ── Detect mathematical query ─────────────────────────────────────
const isMathQuery = (query) => {
  const q = query.toLowerCase();
  return (
    /t\s*\(\s*n\s*\)/.test(q) ||
    /recurrence|master theorem|master method|substitution method|recursion tree/.test(q) ||
    /time complexity of|space complexity of|complexity of|big.?o of|what is the complexity/.test(q)
  );
};

module.exports = {
  solveMasterTheorem,
  parseRecurrence,
  getComplexity,
  isMathQuery,
};