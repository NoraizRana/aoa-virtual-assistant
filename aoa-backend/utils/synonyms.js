/**
 * synonyms.js
 * Maps user phrases / alternate terms to
 * the correct topic keywords for better matching
 */

const SYNONYMS = {
  // Merge Sort
  "merge":          "merge sort",
  "mergesort":      "merge sort",
  "merge sorting":  "merge sort",
  "divide conquer sort": "merge sort",

  // Quick Sort
  "quick":          "quick sort",
  "quicksort":      "quick sort",
  "partition sort": "quick sort",
  "pivot sort":     "quick sort",

  // Binary Search
  "binary":         "binary search",
  "half search":    "binary search",
  "log search":     "binary search",
  "bisect":         "binary search",

  // Bubble Sort
  "bubble":         "bubble sort",
  "sinking sort":   "bubble sort",
  "swap sort":      "bubble sort",

  // Dijkstra
  "dijkstra":       "dijkstra",
  "shortest path":  "dijkstra",
  "shortest route": "dijkstra",
  "minimum path":   "dijkstra",
  "weighted graph": "dijkstra",

  // Dynamic Programming
  "dp":             "dynamic programming",
  "memoiz":         "dynamic programming",
  "memoization":    "dynamic programming",
  "tabulation":     "dynamic programming",
  "overlapping":    "dynamic programming",
  "subproblem":     "dynamic programming",
  "fibonacci":      "dynamic programming",
  "knapsack":       "dynamic programming",

  // BFS
  "bfs":            "bfs",
  "breadth first":  "bfs",
  "level order":    "bfs",
  "level traversal":"bfs",

  // DFS
  "dfs":            "dfs",
  "depth first":    "dfs",
  "backtrack":      "dfs",
  "backtracking":   "dfs",
};

/**
 * Expand query by replacing known synonyms
 * Returns enriched query string
 */
const expandSynonyms = (query) => {
  let expanded = query.toLowerCase();

  Object.entries(SYNONYMS).forEach(([alias, canonical]) => {
    if (expanded.includes(alias)) {
      expanded += " " + canonical;
    }
  });

  return expanded;
};

module.exports = { expandSynonyms, SYNONYMS };