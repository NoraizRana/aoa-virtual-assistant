require("dotenv").config();
const mongoose = require("mongoose");
const Topic    = require("../models/Topic");
const connectDB = require("../db");

const topics = [
  // ── ROLE OF ALGORITHMS ────────────────────────────────────────
  {
    id: "role-of-algorithms",
    name: "Role of Algorithms",
    aliases: ["role of algorithms", "what is an algorithm", "algorithm", "algorithms in computing", "analyzing algorithms", "designing algorithms", "algorithm design"],
    keywords: ["algorithm", "role", "computing", "analyze", "design", "efficiency", "correctness"],
    category: "introduction",
    difficulty: "beginner",
    definition: "An algorithm is any well-defined computational procedure that takes some value (or set of values) as input and produces some value (or set of values) as output. Algorithms are the foundation of computer science — the study of their design, analysis, and correctness.",
    intuition: "A recipe is an algorithm: it takes ingredients (input), follows a sequence of steps, and produces a dish (output). Algorithms describe how to solve computational problems step by step.",
    steps: [
      "Define the problem clearly — specify input and output",
      "Design an algorithm that solves it correctly",
      "Analyze the algorithm for time and space efficiency",
      "Prove correctness using loop invariants or induction",
      "Implement and test the algorithm"
    ],
    complexity: { time: { best: "Varies", average: "Varies", worst: "Varies" }, space: "Varies" },
    related_topics: ["asymptotic-notation", "loop-invariants", "divide-and-conquer"]
  },

  // ── ASYMPTOTIC NOTATION ──────────────────────────────────────
  {
    id: "asymptotic-notation",
    name: "Asymptotic Notation",
    aliases: [
      "asymptotic notation", "big o", "big-o", "big o notation",
      "big omega", "big-omega", "big theta", "big-theta",
      "little o", "little-o", "little omega", "little-omega",
      "growth of functions", "time complexity", "space complexity",
      "asymptotic", "notation", "o notation", "theta notation",
      "omega notation", "complexity notation", "asymptotic analysis"
    ],
    keywords: [
      "big o", "big-o", "omega", "theta", "asymptotic",
      "little-o", "little-omega", "little o", "little omega",
      "growth", "notation", "upper bound", "lower bound", "tight bound"
    ],
    category: "complexity",
    difficulty: "beginner",
    definition: "Asymptotic notation characterizes algorithm running time growth as input size n increases, ignoring constants and lower-order terms. Five notations: O (upper bound / worst case), Ω (lower bound / best case), Θ (tight bound), o (strict upper), ω (strict lower).",
    intuition: "We don't care if an algorithm takes 3n²+5n+2 steps — we just care it grows like n². Constants depend on hardware. Growth rate is what matters for large n.",
    notations: {
      big_o:     { symbol: "O(g(n))",  meaning: "Upper bound — f grows NO FASTER than g",      formal: "∃ c,n₀>0: f(n) ≤ cg(n) for all n≥n₀",                  example: "3n²+5n = O(n²)" },
      big_omega: { symbol: "Ω(g(n))",  meaning: "Lower bound — f grows AT LEAST as fast as g", formal: "∃ c,n₀>0: f(n) ≥ cg(n) for all n≥n₀",                  example: "3n²+5n = Ω(n)" },
      big_theta: { symbol: "Θ(g(n))",  meaning: "Tight bound — f grows EXACTLY like g",        formal: "∃ c₁,c₂,n₀>0: c₁g(n) ≤ f(n) ≤ c₂g(n) for all n≥n₀", example: "3n²+5n = Θ(n²)" },
      little_o:  { symbol: "o(g(n))",  meaning: "Strict upper — f grows STRICTLY slower than g", formal: "lim[n→∞] f(n)/g(n) = 0",                              example: "n = o(n²)" },
      little_omega: { symbol: "ω(g(n))", meaning: "Strict lower — f grows STRICTLY faster than g", formal: "lim[n→∞] f(n)/g(n) = ∞",                           example: "n² = ω(n)" }
    },
    steps: [
      "Identify the dominant term in the running time expression",
      "Drop all lower-order terms and constants",
      "Express using appropriate notation: O, Ω, Θ, o, or ω",
      "Verify using the formal definition"
    ],
    common_complexities: [
      { notation: "O(1)",      name: "Constant",      example: "Array index access" },
      { notation: "O(log n)",  name: "Logarithmic",   example: "Binary Search" },
      { notation: "O(n)",      name: "Linear",         example: "Linear Search" },
      { notation: "O(n log n)",name: "Linearithmic",  example: "Merge Sort" },
      { notation: "O(n²)",     name: "Quadratic",      example: "Bubble Sort" },
      { notation: "O(2ⁿ)",     name: "Exponential",   example: "Naive Fibonacci" },
      { notation: "O(n!)",     name: "Factorial",      example: "TSP brute force" }
    ],
    related_topics: ["master-theorem", "loop-analysis", "recurrence-relations"]
  },

  // ── DIVIDE AND CONQUER ────────────────────────────────────────
  {
    id: "divide-and-conquer",
    name: "Divide and Conquer",
    aliases: ["divide and conquer", "divide conquer", "divide & conquer", "d&c", "divide-and-conquer", "divide and conquer paradigm"],
    keywords: ["divide", "conquer", "combine", "recursive", "subproblems", "divide and conquer"],
    category: "algorithm design",
    difficulty: "intermediate",
    definition: "Divide and Conquer is an algorithm design paradigm with 3 steps: DIVIDE the problem into smaller subproblems, CONQUER by solving each recursively (or directly if small enough), COMBINE solutions into the answer. Running time: T(n) = aT(n/b) + f(n).",
    intuition: "Split a big problem into smaller problems of the same type. Solve each. Combine results.",
    steps: [
      "DIVIDE: Break problem into a subproblems, each of size n/b",
      "CONQUER: Solve each subproblem recursively",
      "Base case: solve directly when problem is small enough",
      "COMBINE: Merge subproblem solutions into overall solution",
      "Write recurrence T(n) = aT(n/b) + f(n) and solve with Master Theorem"
    ],
    examples: [
      "Merge Sort: divide array, sort halves, merge — T(n)=2T(n/2)+n",
      "Quick Sort: partition, sort partitions",
      "Binary Search: check middle, recurse on one half",
      "Strassen: divide matrices into submatrices"
    ],
    complexity: { time: "Solved by Master Theorem: T(n) = aT(n/b) + f(n)", space: "O(log n) to O(n) stack" },
    related_topics: ["master-theorem", "merge-sort", "quick-sort", "binary-search", "strassen"]
  },

  // ── RECURRENCES + MASTER THEOREM ─────────────────────────────
  {
    id: "master-theorem",
    name: "Master Theorem",
    aliases: [
      "master theorem", "master method", "recurrence", "recurrences",
      "recurrence relation", "recurrence relations", "solve recurrence",
      "solving recurrences", "t(n)", "substitution method",
      "recursion tree", "recursion tree method", "recurrence solving",
      "substitution", "master"
    ],
    keywords: ["master theorem", "recurrence", "t(n)", "substitution", "recursion tree", "solve", "master method"],
    category: "complexity",
    difficulty: "intermediate",
    definition: "The Master Theorem solves recurrences T(n) = aT(n/b) + f(n) (a≥1, b>1) from divide-and-conquer. Compare f(n) with n^log_b(a) to pick the case. Three methods: Substitution (guess+prove), Recursion Tree (visualize), Master Method (direct formula).",
    formula: "T(n) = aT(n/b) + f(n)",
    steps: [
      "Identify a (subproblems), b (size reduction), f(n) (combine cost)",
      "Compute log_b(a) — the critical exponent",
      "Compare f(n) with n^log_b(a)",
      "Case 1: f(n) = O(n^(log_b(a)-ε)) → T(n) = Θ(n^log_b(a))",
      "Case 2: f(n) = Θ(n^log_b(a))     → T(n) = Θ(n^log_b(a) · log n)",
      "Case 3: f(n) = Ω(n^(log_b(a)+ε)) → T(n) = Θ(f(n))"
    ],
    cases: [
      { case: "Case 1", condition: "f(n) = O(n^(log_b(a) - ε))", result: "T(n) = Θ(n^log_b(a))",         meaning: "Recursive work dominates" },
      { case: "Case 2", condition: "f(n) = Θ(n^log_b(a))",       result: "T(n) = Θ(n^log_b(a) · log n)", meaning: "Balanced work at each level" },
      { case: "Case 3", condition: "f(n) = Ω(n^(log_b(a) + ε))", result: "T(n) = Θ(f(n))",              meaning: "Non-recursive work dominates" }
    ],
    examples: [
      { recurrence: "T(n) = 2T(n/2) + n",    a: 2, b: 2, solution: "Θ(n log n)", algorithm: "Merge Sort",      case: "Case 2" },
      { recurrence: "T(n) = T(n/2) + 1",     a: 1, b: 2, solution: "Θ(log n)",   algorithm: "Binary Search",   case: "Case 2" },
      { recurrence: "T(n) = 2T(n/2) + 1",    a: 2, b: 2, solution: "Θ(n)",       algorithm: "Tree traversal",  case: "Case 1" },
      { recurrence: "T(n) = 9T(n/3) + n",    a: 9, b: 3, solution: "Θ(n²)",      algorithm: "Some D&C",        case: "Case 1" },
      { recurrence: "T(n) = 4T(n/2) + n²",   a: 4, b: 2, solution: "Θ(n² log n)",algorithm: "Strassen-like",  case: "Case 2" }
    ],
    related_topics: ["divide-and-conquer", "asymptotic-notation", "merge-sort"]
  },

  // ── INSERTION SORT ────────────────────────────────────────────
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    aliases: ["insertion sort", "insertionsort", "insert sort", "insertion sorting"],
    keywords: ["insertion", "insert", "insertionsort", "insertion sort", "key insertion"],
    category: "sorting",
    difficulty: "beginner",
    definition: "Insertion Sort builds a sorted array one element at a time by picking each element and inserting it into its correct position among previously sorted elements. Like sorting playing cards in hand.",
    intuition: "Pick one card at a time and insert it into the correct position among cards already sorted in your hand.",
    steps: [
      "Start from index 1 (treat index 0 as sorted)",
      "Pick current element as key = A[j]",
      "Compare key with each element to its left",
      "Shift all elements greater than key one position right",
      "Insert key at the correct gap",
      "Repeat for all elements"
    ],
    pseudocode: "INSERTION-SORT(A):\n  for j = 2 to A.length\n    key = A[j]\n    i = j - 1\n    while i > 0 and A[i] > key\n      A[i+1] = A[i]\n      i = i - 1\n    A[i+1] = key",
    example: {
      input: "[5, 2, 4, 6, 1, 3]",
      steps: ["j=2: key=2→[2,5,4,6,1,3]", "j=3: key=4→[2,4,5,6,1,3]", "j=4: key=6→no shift", "j=5: key=1→[1,2,4,5,6,3]", "j=6: key=3→[1,2,3,4,5,6]"],
      output: "[1, 2, 3, 4, 5, 6]"
    },
    complexity: { time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" }, space: "O(1)" },
    loop_invariant: "At start of each iteration j, subarray A[1..j-1] is sorted.",
    advantages: ["Simple", "In-place O(1)", "Stable", "O(n) for nearly sorted", "Online"],
    disadvantages: ["O(n²) for large n", "Not for large datasets"],
    related_topics: ["merge-sort", "bubble-sort", "selection-sort"]
  },

  // ── MERGE SORT ───────────────────────────────────────────────
  {
    id: "merge-sort",
    name: "Merge Sort",
    aliases: ["merge sort", "mergesort", "merge sorting", "divide and conquer sort"],
    keywords: ["merge", "mergesort", "merge sort", "merge sorting"],
    category: "sorting",
    difficulty: "intermediate",
    definition: "Merge Sort is a divide-and-conquer sorting algorithm that recursively splits an array into two halves, sorts each half, and merges them. Guaranteed O(n log n) in all cases. Recurrence: T(n) = 2T(n/2) + Θ(n).",
    intuition: "Split cards into two piles, sort each pile, merge by always picking the smaller top card.",
    steps: [
      "DIVIDE: Find midpoint q = floor((p+r)/2)",
      "CONQUER: Recursively sort A[p..q]",
      "CONQUER: Recursively sort A[q+1..r]",
      "COMBINE: MERGE the two sorted halves",
      "Base case: single element is already sorted"
    ],
    pseudocode: "MERGE-SORT(A, p, r):\n  if p < r\n    q = floor((p+r)/2)\n    MERGE-SORT(A, p, q)\n    MERGE-SORT(A, q+1, r)\n    MERGE(A, p, q, r)",
    example: {
      input: "[38, 27, 43, 3, 9, 82, 10]",
      steps: ["Split→[38,27,43,3]|[9,82,10]", "Split→[38,27]|[43,3]|[9,82]|[10]", "Merge→[27,38]|[3,43]|[9,82]|[10]", "Merge→[3,27,38,43]|[9,10,82]", "Merge→[3,9,10,27,38,43,82]"],
      output: "[3, 9, 10, 27, 38, 43, 82]"
    },
    complexity: { time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", recurrence: "T(n) = 2T(n/2) + Θ(n)" },
    recurrence_solution: { relation: "T(n) = 2T(n/2) + n", method: "Master Theorem Case 2", a: 2, b: 2, k: 1, solution: "T(n) = O(n log n)" },
    advantages: ["Stable", "Guaranteed O(n log n)", "Good for linked lists"],
    disadvantages: ["O(n) extra space", "Slower than Quick Sort in practice for small n"],
    comparisons: {
      quick_sort: "Stable and always O(n log n) but uses O(n) space. Quick Sort is faster in practice.",
      heap_sort: "Both O(n log n). Merge Sort is stable, Heap Sort is in-place."
    },
    related_topics: ["quick-sort", "heap-sort", "divide-and-conquer", "master-theorem"]
  },

  // ── HEAP SORT ────────────────────────────────────────────────
  {
    id: "heap-sort",
    name: "Heap Sort",
    aliases: ["heap sort", "heapsort", "heap-sort", "heapify sort"],
    keywords: ["heap", "heapsort", "heap sort", "max heap", "heapify", "build max heap"],
    category: "sorting",
    difficulty: "intermediate",
    definition: "Heap Sort uses a max-heap to sort. It first builds a max-heap in O(n), then repeatedly extracts the maximum (placing it at end) and restores heap property using MAX-HEAPIFY. Time: O(n log n), Space: O(1).",
    steps: [
      "BUILD-MAX-HEAP(A): build max-heap in O(n)",
      "for i = n downto 2:",
      "  swap A[1] with A[i] — move max to correct position",
      "  reduce heap-size by 1",
      "  MAX-HEAPIFY(A, 1) — restore max-heap"
    ],
    pseudocode: "HEAPSORT(A):\n  BUILD-MAX-HEAP(A)\n  for i = A.length downto 2\n    swap A[1] with A[i]\n    A.heap-size -= 1\n    MAX-HEAPIFY(A, 1)\n\nMAX-HEAPIFY(A, i):\n  l=2i, r=2i+1, largest=i\n  if l<=heap-size and A[l]>A[i]: largest=l\n  if r<=heap-size and A[r]>A[largest]: largest=r\n  if largest!=i: swap A[i],A[largest]; MAX-HEAPIFY(A,largest)",
    example: {
      input: "[4, 1, 3, 2, 16, 9, 10, 14, 8, 7]",
      steps: ["BUILD-MAX-HEAP→[16,14,10,8,7,9,3,2,4,1]", "Extract 16→[14,8,10,4,7,9,3,2,1]|16", "Extract 14→[10,8,9,4,7,1,3,2]|14,16", "Continue until sorted"],
      output: "[1, 2, 3, 4, 7, 8, 9, 10, 14, 16]"
    },
    complexity: { time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(1)" },
    heap_properties: { max_heap: "A[PARENT(i)] >= A[i]", parent: "floor(i/2)", left: "2i", right: "2i+1" },
    advantages: ["In-place O(1) space", "Guaranteed O(n log n)", "No worst case"],
    disadvantages: ["Not stable", "Poor cache performance"],
    related_topics: ["priority-queue", "merge-sort", "quick-sort"]
  },

  // ── PRIORITY QUEUE ───────────────────────────────────────────
  {
    id: "priority-queue",
    name: "Priority Queue",
    aliases: ["priority queue", "max priority queue", "min priority queue", "heap priority queue", "max-heap", "min-heap", "max heap", "min heap"],
    keywords: ["priority queue", "priority", "extract max", "insert", "increase key", "max heap", "min heap"],
    category: "data structures",
    difficulty: "intermediate",
    definition: "A Priority Queue supports INSERT, MAXIMUM, EXTRACT-MAX, and INCREASE-KEY. Implemented with a max-heap: MAXIMUM in O(1), INSERT and EXTRACT-MAX in O(log n). Used in Dijkstra, Prim, Huffman, and Heap Sort.",
    steps: [
      "HEAP-MAXIMUM(A): return A[1] — O(1)",
      "HEAP-EXTRACT-MAX: swap A[1] with A[n], reduce size, MAX-HEAPIFY(A,1) — O(log n)",
      "HEAP-INCREASE-KEY: update key, bubble up while parent smaller — O(log n)",
      "MAX-HEAP-INSERT: add -∞ at end, HEAP-INCREASE-KEY to new value — O(log n)"
    ],
    complexity: { time: { MAXIMUM: "O(1)", EXTRACT_MAX: "O(log n)", INSERT: "O(log n)", INCREASE_KEY: "O(log n)" }, space: "O(n)" },
    applications: ["Dijkstra's shortest path", "Prim's MST", "Huffman coding", "Job scheduling", "Event simulation"],
    related_topics: ["heap-sort", "dijkstra", "prim", "huffman-codes"]
  },

  // ── QUICK SORT ───────────────────────────────────────────────
  {
    id: "quick-sort",
    name: "Quick Sort",
    aliases: ["quick sort", "quicksort", "partition sort", "pivot sort", "randomized quicksort", "hoare partition"],
    keywords: ["quick", "quicksort", "quick sort", "partition", "pivot", "randomized quick sort"],
    category: "sorting",
    difficulty: "intermediate",
    definition: "Quick Sort selects a pivot, partitions the array so elements smaller than pivot are left and larger are right, then recursively sorts both parts. Average O(n log n), worst case O(n²) on sorted input.",
    steps: [
      "Choose pivot (typically last element A[r])",
      "PARTITION: i = p-1",
      "For j=p to r-1: if A[j]<=pivot, increment i, swap A[i] with A[j]",
      "Place pivot at A[i+1] by swapping with A[r]",
      "Recursively sort left A[p..i] and right A[i+2..r]"
    ],
    pseudocode: "QUICKSORT(A, p, r):\n  if p < r\n    q = PARTITION(A, p, r)\n    QUICKSORT(A, p, q-1)\n    QUICKSORT(A, q+1, r)\n\nPARTITION(A, p, r):\n  x = A[r]\n  i = p-1\n  for j=p to r-1\n    if A[j] <= x: i++, swap A[i],A[j]\n  swap A[i+1],A[r]\n  return i+1",
    example: {
      input: "[2, 8, 7, 1, 3, 5, 6, 4]",
      steps: ["Pivot=4", "Partition→[2,1,3]4[8,7,5,6]", "Sort left→[1,2,3]", "Sort right→[5,6,7,8]", "Result→[1,2,3,4,5,6,7,8]"],
      output: "[1, 2, 3, 4, 5, 6, 7, 8]"
    },
    complexity: { time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" }, space: "O(log n)" },
    advantages: ["In-place", "Cache friendly", "Fast in practice"],
    disadvantages: ["O(n²) worst case", "Not stable"],
    related_topics: ["merge-sort", "heap-sort", "partitioning"]
  },

  // ── BUBBLE SORT ──────────────────────────────────────────────
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    aliases: ["bubble sort", "bubble", "sinking sort", "exchange sort"],
    keywords: ["bubble", "bubble sort", "sinking", "exchange sort", "adjacent swap"],
    category: "sorting",
    difficulty: "beginner",
    definition: "Bubble Sort repeatedly passes through the array swapping adjacent elements that are out of order. After each pass the largest unsorted element bubbles to its correct position.",
    steps: ["For i=0 to n-2:", "  For j=0 to n-2-i:", "    If A[j]>A[j+1]: swap them", "  Optimization: stop if no swap in a pass"],
    pseudocode: "BUBBLE-SORT(A):\n  for i=0 to n-2\n    for j=0 to n-2-i\n      if A[j] > A[j+1]\n        swap A[j] with A[j+1]",
    example: { input: "[5,3,8,1,2]", steps: ["Pass1→[3,5,1,2,8]", "Pass2→[3,1,2,5,8]", "Pass3→[1,2,3,5,8]"], output: "[1,2,3,5,8]" },
    complexity: { time: { best: "O(n) with optimization", average: "O(n²)", worst: "O(n²)" }, space: "O(1)" },
    advantages: ["Simple", "Stable", "Detects sorted in O(n)"],
    disadvantages: ["O(n²) — very slow"],
    related_topics: ["insertion-sort", "selection-sort"]
  },

  // ── SELECTION SORT ───────────────────────────────────────────
  {
    id: "selection-sort",
    name: "Selection Sort",
    aliases: ["selection sort", "selectionsort", "select sort", "selection sorting", "minimum selection sort"],
    keywords: ["selection", "select", "selection sort", "minimum", "find minimum"],
    category: "sorting",
    difficulty: "beginner",
    definition: "Selection Sort repeatedly finds the minimum from unsorted portion and places it at the start of the unsorted portion. Makes exactly n-1 swaps regardless of input.",
    steps: ["For i=0 to n-2:", "  Find min in A[i..n-1]", "  Swap min with A[i]", "  A[0..i] is now sorted"],
    pseudocode: "SELECTION-SORT(A):\n  for i=0 to n-2\n    min=i\n    for j=i+1 to n-1\n      if A[j]<A[min]: min=j\n    swap A[i],A[min]",
    example: { input: "[64,25,12,22,11]", steps: ["min=11,swap→[11,25,12,22,64]", "min=12→[11,12,25,22,64]", "min=22→[11,12,22,25,64]"], output: "[11,12,22,25,64]" },
    complexity: { time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" }, space: "O(1)" },
    advantages: ["Simple", "In-place", "Exactly n-1 swaps"],
    disadvantages: ["Always O(n²)", "Not stable"],
    related_topics: ["bubble-sort", "insertion-sort"]
  },

  // ── COUNTING SORT ────────────────────────────────────────────
  {
    id: "counting-sort",
    name: "Counting Sort",
    aliases: ["counting sort", "countingsort", "count sort", "linear sort", "counting sorting"],
    keywords: ["counting", "count", "counting sort", "linear sorting", "non comparison sort", "integer sort"],
    category: "sorting",
    difficulty: "intermediate",
    definition: "Counting Sort counts occurrences of each value and uses cumulative counts to place elements. Non-comparison based — runs in O(n+k) where k is value range. Beats Ω(n log n) comparison lower bound.",
    steps: ["Count occurrences: C[A[j]]++ for each element", "Accumulate: C[i] += C[i-1]", "Build output backwards for stability: B[C[A[j]]]= A[j], C[A[j]]--"],
    pseudocode: "COUNTING-SORT(A, B, k):\n  C[0..k] = 0\n  for j=1 to n: C[A[j]]++\n  for i=1 to k: C[i]+=C[i-1]\n  for j=n downto 1:\n    B[C[A[j]]]=A[j]\n    C[A[j]]--",
    example: { input: "A=[2,5,3,0,2,3,0,3], k=5", steps: ["Count:C=[2,0,2,3,0,1]", "Accumulate:C=[2,2,4,7,7,8]", "Build output"], output: "[0,0,2,2,3,3,3,5]" },
    complexity: { time: { best: "O(n+k)", average: "O(n+k)", worst: "O(n+k)" }, space: "O(k)" },
    advantages: ["O(n+k) — beats comparison lower bound", "Stable", "Used in Radix Sort"],
    disadvantages: ["Integer keys only", "O(k) space bad when k>>n"],
    related_topics: ["radix-sort", "bucket-sort", "lower-bounds-sorting"]
  },

  // ── RADIX SORT ───────────────────────────────────────────────
  {
    id: "radix-sort",
    name: "Radix Sort",
    aliases: ["radix sort", "radixsort", "digit sort", "lsd radix sort", "radix sorting"],
    keywords: ["radix", "radix sort", "digit", "lsd", "least significant digit"],
    category: "sorting",
    difficulty: "intermediate",
    definition: "Radix Sort sorts integers digit by digit from Least Significant Digit (LSD) to Most Significant Digit (MSD) using a stable sort (Counting Sort) for each digit. Time: O(d(n+k)) where d=digits, k=digit range.",
    steps: ["Find d = max number of digits", "For each digit position i from 1 (LSD) to d (MSD):", "  Stable sort array by digit i using Counting Sort"],
    pseudocode: "RADIX-SORT(A, d):\n  for i=1 to d\n    stable sort A on digit i",
    example: { input: "[329,457,657,839,436,720,355]", steps: ["Units digit→[720,355,436,457,657,329,839]", "Tens digit→[720,329,436,839,355,457,657]", "Hundreds→[329,355,436,457,657,720,839]"], output: "[329,355,436,457,657,720,839]" },
    complexity: { time: { best: "O(d(n+k))", average: "O(d(n+k))", worst: "O(d(n+k))" }, space: "O(n+k)" },
    advantages: ["Linear when d,k are constants", "Stable"],
    disadvantages: ["Integer/string keys only", "Requires stable subroutine"],
    related_topics: ["counting-sort", "bucket-sort"]
  },

  // ── BUCKET SORT ──────────────────────────────────────────────
  {
    id: "bucket-sort",
    name: "Bucket Sort",
    aliases: ["bucket sort", "bucketsort", "bin sort", "bucket sorting", "distribution sort"],
    keywords: ["bucket", "bucket sort", "bin", "distribution", "uniform distribution"],
    category: "sorting",
    difficulty: "intermediate",
    definition: "Bucket Sort distributes elements into n equal buckets, sorts each bucket with Insertion Sort, then concatenates. Expected O(n) when input is uniformly distributed over [0,1).",
    steps: ["Create n empty buckets", "Put A[i] in bucket floor(n*A[i])", "Sort each bucket with Insertion Sort", "Concatenate all buckets"],
    complexity: { time: { best: "O(n)", average: "O(n) uniform distribution", worst: "O(n²) all in one bucket" }, space: "O(n)" },
    advantages: ["O(n) expected for uniform input"],
    disadvantages: ["Worst case O(n²)", "Needs uniform distribution"],
    related_topics: ["counting-sort", "radix-sort"]
  },

  // ── LOWER BOUNDS ─────────────────────────────────────────────
  {
    id: "lower-bounds-sorting",
    name: "Lower Bounds for Sorting",
    aliases: ["lower bounds for sorting", "lower bound sorting", "comparison lower bound", "omega n log n", "decision tree", "sorting lower bound", "lower bound"],
    keywords: ["lower bound", "decision tree", "comparison sort", "omega n log n", "n factorial"],
    category: "complexity",
    difficulty: "advanced",
    definition: "Any comparison-based sorting algorithm requires Ω(n log n) comparisons worst case. Proved via decision tree model: the tree needs ≥ n! leaves (one per permutation), so height ≥ log₂(n!) = Ω(n log n).",
    proof: { model: "Decision tree — internal nodes are comparisons, leaves are sorted orderings", leaves: "≥ n! leaves required", height: "h ≥ log₂(n!) = Ω(n log n)", conclusion: "Ω(n log n) comparisons are necessary" },
    steps: ["Model any comparison sort as a decision tree", "Count leaves: must have ≥ n! leaves (one per permutation)", "Height of binary tree with ≥ n! leaves is ≥ log₂(n!)", "By Stirling: log₂(n!) = Ω(n log n)", "Therefore any comparison sort is Ω(n log n)"],
    why_linear_sorts_beat_it: "Counting/Radix/Bucket Sort are NOT comparison-based — they use element values directly, so bound doesn't apply.",
    related_topics: ["counting-sort", "radix-sort", "merge-sort", "asymptotic-notation"]
  },

  // ── MEDIANS AND ORDER STATISTICS ─────────────────────────────
  {
    id: "order-statistics",
    name: "Medians and Order Statistics",
    aliases: ["medians and order statistics", "order statistics", "median", "selection problem", "kth smallest", "kth element", "selection algorithm", "randomized select"],
    keywords: ["median", "order statistics", "selection", "kth smallest", "kth element", "randomized select"],
    category: "divide and conquer",
    difficulty: "advanced",
    definition: "The i-th order statistic is the i-th smallest element. The selection problem finds it in O(n) expected time using RANDOMIZED-SELECT (like Quick Sort but only recurse on one side).",
    steps: [
      "RANDOMIZED-SELECT(A, p, r, i):",
      "Partition A around random pivot q",
      "k = q - p + 1 (rank of pivot)",
      "If i==k: return A[q] (pivot is answer)",
      "If i<k: recurse on left A[p..q-1]",
      "If i>k: recurse on right A[q+1..r] for i-k th element"
    ],
    complexity: { time: { best: "O(n)", average: "O(n) expected", worst: "O(n²)" }, space: "O(1)" },
    special_cases: { median: "i = floor((n+1)/2)", minimum: "i = 1 — scan once O(n)", maximum: "i = n — scan once O(n)" },
    related_topics: ["quick-sort", "divide-and-conquer"]
  },

  // ── BINARY SEARCH ────────────────────────────────────────────
  {
    id: "binary-search",
    name: "Binary Search",
    aliases: ["binary search", "binary", "bisect", "half interval search", "logarithmic search", "log search"],
    keywords: ["binary search", "binary", "bisect", "half interval", "log n search"],
    category: "searching",
    difficulty: "beginner",
    definition: "Binary Search finds a target in a SORTED array by repeatedly halving the search space. Each step eliminates half the candidates. Time: O(log n). Recurrence: T(n) = T(n/2) + O(1).",
    intuition: "Like finding a word in dictionary — open to middle, decide which half, repeat.",
    steps: ["Set low=0, high=n-1", "mid = floor((low+high)/2)", "If A[mid]==target: return mid", "If target<A[mid]: high=mid-1", "If target>A[mid]: low=mid+1", "Repeat until low>high (not found)"],
    pseudocode: "BINARY-SEARCH(A, n, target):\n  low=0, high=n-1\n  while low<=high\n    mid=floor((low+high)/2)\n    if A[mid]==target: return mid\n    elif A[mid]<target: low=mid+1\n    else: high=mid-1\n  return -1",
    example: { input: "A=[2,5,8,12,16,23,38], target=23", steps: ["mid=3,A[3]=12<23→low=4", "mid=5,A[5]=23==23→FOUND"], output: "Index 5" },
    complexity: { time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" }, space: "O(1)", recurrence: "T(n) = T(n/2) + O(1)" },
    recurrence_solution: { relation: "T(n) = T(n/2) + 1", method: "Master Theorem Case 2", solution: "T(n) = O(log n)" },
    related_topics: ["divide-and-conquer", "sorting"]
  },

  // ── BINARY SEARCH TREES ──────────────────────────────────────
  {
    id: "binary-search-trees",
    name: "Binary Search Trees",
    aliases: [
      "binary search tree", "bst", "binary search trees",
      "tree traversal", "tree traversing", "inorder traversal",
      "tree search", "bst search", "tree insertion", "tree deletion",
      "inorder", "preorder", "postorder", "tree operations"
    ],
    keywords: ["bst", "binary search tree", "tree", "inorder", "preorder", "postorder", "traversal", "tree traversal", "tree traversing", "successor", "predecessor"],
    category: "data structures",
    difficulty: "intermediate",
    definition: "A Binary Search Tree is a binary tree where for every node x: left subtree keys ≤ x.key ≤ right subtree keys. Enables O(h) search, insert, delete where h is height. Inorder traversal gives sorted order.",
    steps: [
      "BST Property: left subtree keys ≤ node.key ≤ right subtree keys",
      "SEARCH: compare with root, go left or right — O(h)",
      "INORDER: Left→Root→Right — prints in sorted ascending order — O(n)",
      "PREORDER: Root→Left→Right — used to copy tree",
      "POSTORDER: Left→Right→Root — used to delete tree",
      "INSERT: search for position, insert as leaf — O(h)",
      "DELETE: three cases: leaf, one child, two children — O(h)"
    ],
    pseudocode: "TREE-SEARCH(x, k):\n  if x==NIL or k==x.key: return x\n  if k<x.key: return TREE-SEARCH(x.left,k)\n  else: return TREE-SEARCH(x.right,k)\n\nINORDER-WALK(x):\n  if x≠NIL:\n    INORDER-WALK(x.left)\n    print x.key\n    INORDER-WALK(x.right)",
    complexity: { time: { average: "O(log n) balanced", worst: "O(n) degenerate" }, space: "O(n)" },
    traversals: {
      inorder: "Left→Root→Right: prints BST in SORTED order. O(n)",
      preorder: "Root→Left→Right: copy tree. O(n)",
      postorder: "Left→Right→Root: delete tree. O(n)"
    },
    related_topics: ["red-black-trees", "avl-trees", "binary-search"]
  },

  // ── RED-BLACK TREES ──────────────────────────────────────────
  {
    id: "red-black-trees",
    name: "Red-Black Trees",
    aliases: ["red-black tree", "red black tree", "red-black", "rbt", "red black", "self balancing bst", "balanced bst"],
    keywords: ["red-black", "red black", "rbt", "balanced", "black height", "rotation", "self-balancing"],
    category: "data structures",
    difficulty: "advanced",
    definition: "A Red-Black Tree is a BST with one extra color bit per node (RED/BLACK) satisfying 5 properties that guarantee height ≤ 2·log(n+1) = O(log n). All operations: O(log n).",
    five_properties: [
      "Every node is RED or BLACK",
      "The root is BLACK",
      "Every leaf (NIL sentinel) is BLACK",
      "If a node is RED, both children are BLACK (no consecutive reds)",
      "All simple paths from any node to its NIL leaf descendants have same number of BLACK nodes (black-height)"
    ],
    steps: [
      "INSERT: insert like BST, color RED, fix violations with RB-INSERT-FIXUP",
      "FIXUP uses rotations (LEFT-ROTATE, RIGHT-ROTATE) and recoloring",
      "Cases in fixup: uncle is RED (recolor), uncle is BLACK (rotate)",
      "DELETE: BST delete + RB-DELETE-FIXUP if black node removed",
      "Height guaranteed ≤ 2·log(n+1)"
    ],
    complexity: { time: { search: "O(log n)", insert: "O(log n)", delete: "O(log n)" }, space: "O(n)" },
    comparisons: {
      regular_bst: "Regular BST is O(n) worst case. RB Tree guarantees O(log n) always.",
      avl_trees: "AVL Trees are more strictly balanced (faster search). RB Trees have faster insert/delete."
    },
    related_topics: ["binary-search-trees", "rotations", "avl-trees"]
  },

  // ── DYNAMIC PROGRAMMING ──────────────────────────────────────
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    aliases: ["dynamic programming", "dp", "memoization", "tabulation", "overlapping subproblems", "optimal substructure", "rod cutting", "matrix chain", "lcs", "longest common subsequence"],
    keywords: ["dynamic programming", "dp", "memoization", "tabulation", "overlapping", "optimal substructure", "rod cutting", "lcs"],
    category: "dynamic programming",
    difficulty: "advanced",
    definition: "Dynamic Programming (DP) solves optimization problems with: (1) Optimal Substructure — optimal solution contains optimal subproblem solutions, and (2) Overlapping Subproblems — same subproblems computed repeatedly. DP stores results to avoid recomputation.",
    intuition: "If Fibonacci(5) needs Fibonacci(3) and Fibonacci(4) also needs Fibonacci(3) — compute once, store, reuse.",
    two_conditions: {
      optimal_substructure: "Optimal solution to problem contains optimal solutions to subproblems",
      overlapping_subproblems: "Same subproblems solved repeatedly in naive recursion"
    },
    approaches: {
      memoization: "Top-down: recursive + cache. Natural structure.",
      tabulation: "Bottom-up: fill table iteratively. Usually faster."
    },
    steps: ["Identify optimal substructure and overlapping subproblems", "Define state dp[i] or dp[i][j]", "Write recurrence relation", "Identify base cases", "Fill table bottom-up or use memoization", "Return dp[n]"],
    classic_problems: ["Rod Cutting", "Matrix Chain Multiplication", "Longest Common Subsequence (LCS)", "0/1 Knapsack", "Optimal BST", "Coin Change", "Edit Distance"],
    example: { problem: "Fibonacci", naive: "O(2ⁿ) exponential", dp: "dp[i]=dp[i-1]+dp[i-2] → O(n)" },
    complexity: { time: "O(n) to O(n³) depending on problem", space: "O(n) to O(n²) for table" },
    comparisons: {
      greedy: "DP considers ALL choices. Greedy makes ONE local choice — faster but not always correct.",
      divide_conquer: "D&C: independent subproblems. DP: overlapping subproblems stored in table."
    },
    related_topics: ["greedy-algorithms", "divide-and-conquer"]
  },

  // ── GREEDY ALGORITHMS ────────────────────────────────────────
  {
    id: "greedy-algorithms",
    name: "Greedy Algorithms",
    aliases: ["greedy", "greedy algorithm", "greedy approach", "greedy method", "activity selection", "greedy strategy", "huffman codes", "huffman coding", "huffman"],
    keywords: ["greedy", "greedy algorithm", "activity selection", "greedy choice", "huffman", "greedy strategy"],
    category: "greedy",
    difficulty: "intermediate",
    definition: "Greedy algorithms make the locally optimal choice at each step. Require: (1) Greedy Choice Property — global optimum reachable by local choices, and (2) Optimal Substructure. Faster than DP but only correct for specific problems.",
    steps: ["Prove optimal substructure exists", "Prove greedy choice property (exchange argument)", "Design greedy rule", "Apply greedily, reduce to smaller subproblem", "Repeat"],
    classic_problems: ["Activity Selection — pick max non-overlapping activities by earliest finish time", "Huffman Coding — optimal prefix-free codes using min-heap", "Fractional Knapsack", "MST: Kruskal and Prim", "Dijkstra"],
    example: { problem: "Activity Selection", rule: "Always pick activity with EARLIEST finish time", proof: "Exchange argument: any optimal solution can include this activity" },
    complexity: { time: "O(n log n) for activity selection", space: "O(1)" },
    comparisons: { dynamic_programming: "Greedy is faster. DP always optimal. Greedy only correct when greedy choice property holds." },
    related_topics: ["dynamic-programming", "huffman-codes", "minimum-spanning-tree"]
  },

  // ── GRAPH ALGORITHMS ─────────────────────────────────────────
  {
    id: "graph-representations",
    name: "Graph Representations",
    aliases: ["graph representation", "adjacency list", "adjacency matrix", "graph", "graph structure"],
    keywords: ["adjacency list", "adjacency matrix", "graph", "vertices", "edges", "directed", "undirected"],
    category: "graph",
    difficulty: "beginner",
    definition: "Graphs G=(V,E) can be represented as: Adjacency List (array of linked lists — space O(V+E), good for sparse graphs) or Adjacency Matrix (V×V matrix — space O(V²), O(1) edge lookup, good for dense graphs).",
    comparisons: {
      adjacency_list: "Space O(V+E). Good for sparse graphs. Edge check O(degree).",
      adjacency_matrix: "Space O(V²). Edge check O(1). Wasteful for sparse graphs."
    },
    related_topics: ["bfs", "dfs", "dijkstra"]
  },

  // ── BFS ──────────────────────────────────────────────────────
  {
    id: "bfs",
    name: "BFS (Breadth-First Search)",
    aliases: ["bfs", "breadth first search", "breadth-first search", "breadth first", "level order", "level traversal", "breadth-first"],
    keywords: ["bfs", "breadth first", "breadth-first", "level order", "queue", "shortest path unweighted"],
    category: "graph",
    difficulty: "intermediate",
    definition: "BFS explores a graph level by level using a FIFO queue, visiting all vertices at distance k before distance k+1. Computes SHORTEST PATHS in unweighted graphs. Time: O(V+E), Space: O(V).",
    intuition: "Ripples in a pond — explore all neighbors one hop away first, then two hops, then three.",
    steps: ["Init: all WHITE, dist=∞, predecessor=NIL", "Source: color GRAY, dist[s]=0, enqueue", "While queue not empty: u=DEQUEUE", "For each WHITE neighbor v: GRAY, dist[v]=dist[u]+1, predecessor[v]=u, ENQUEUE(v)", "Color u BLACK"],
    pseudocode: "BFS(G, s):\n  for each u≠s: u.color=WHITE,u.d=∞,u.π=NIL\n  s.color=GRAY,s.d=0,s.π=NIL\n  Q=empty; ENQUEUE(Q,s)\n  while Q≠empty:\n    u=DEQUEUE(Q)\n    for each v in Adj[u]:\n      if v.color==WHITE:\n        v.color=GRAY,v.d=u.d+1,v.π=u\n        ENQUEUE(Q,v)\n    u.color=BLACK",
    complexity: { time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
    applications: ["Shortest path in unweighted graphs", "Web crawlers", "Social networks", "GPS"],
    comparisons: { dfs: "BFS finds shortest paths (unweighted). DFS doesn't. BFS uses queue, DFS uses stack." },
    related_topics: ["dfs", "dijkstra", "graph-representations"]
  },

  // ── DFS ──────────────────────────────────────────────────────
  {
    id: "dfs",
    name: "DFS (Depth-First Search)",
    aliases: ["dfs", "depth first search", "depth-first search", "depth first", "backtracking search", "backtrack", "depth-first"],
    keywords: ["dfs", "depth first", "depth-first", "backtrack", "discovery time", "finish time", "back edge"],
    category: "graph",
    difficulty: "intermediate",
    definition: "DFS explores as deep as possible before backtracking. Records discovery d[v] and finish f[v] timestamps. Essential for topological sort, SCC, cycle detection. Time: O(V+E), Space: O(V).",
    steps: ["Init: all WHITE, time=0", "For each WHITE vertex u: DFS-VISIT(u)", "DFS-VISIT: GRAY, time++, d[u]=time", "For each WHITE neighbor: recurse", "BLACK, time++, f[u]=time"],
    pseudocode: "DFS(G):\n  for each u: WHITE,π=NIL\n  time=0\n  for each u: if WHITE: DFS-VISIT(G,u)\n\nDFS-VISIT(G,u):\n  time++,u.d=time,GRAY\n  for each v in Adj[u]:\n    if v.color==WHITE: v.π=u; DFS-VISIT(G,v)\n  BLACK,time++,u.f=time",
    edge_classification: {
      tree_edge: "v WHITE when (u,v) explored — DFS tree edge",
      back_edge: "v GRAY — u is descendant of v. INDICATES CYCLE",
      forward_edge: "v BLACK, descendant of u",
      cross_edge: "v BLACK, not ancestor/descendant"
    },
    complexity: { time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
    applications: ["Topological sort", "SCC", "Cycle detection", "Maze solving"],
    comparisons: { bfs: "DFS: stack/recursion. BFS: queue. DFS better for topo sort. BFS better for shortest paths." },
    related_topics: ["bfs", "topological-sort", "strongly-connected-components"]
  },

  // ── TOPOLOGICAL SORT ─────────────────────────────────────────
  {
    id: "topological-sort",
    name: "Topological Sort",
    aliases: ["topological sort", "topological sorting", "topological order", "toposort", "topo sort"],
    keywords: ["topological sort", "topological", "dag", "directed acyclic", "toposort", "linear order", "finish time"],
    category: "graph",
    difficulty: "intermediate",
    definition: "Topological Sort of a DAG produces a linear ordering of vertices such that for every edge (u,v), u appears before v. Run DFS and insert each finished vertex at the FRONT of a linked list. Only possible for DAGs (no cycles).",
    steps: ["Run DFS on the graph", "As each vertex u finishes, INSERT AT FRONT of linked list", "Return the linked list — this is topological order", "If cycle exists: no topological order possible"],
    pseudocode: "TOPOLOGICAL-SORT(G):\n  run DFS(G)\n  as each vertex finishes, insert at front of list\n  return list",
    complexity: { time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)" },
    applications: ["Course prerequisites", "Build dependencies", "Task scheduling", "Compilation order"],
    related_topics: ["dfs", "dag", "strongly-connected-components"]
  },

  // ── DIJKSTRA ─────────────────────────────────────────────────
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    aliases: ["dijkstra", "dijkstra's algorithm", "dijkstras", "dijkstra algorithm", "shortest path", "single source shortest path", "sssp", "weighted shortest path"],
    keywords: ["dijkstra", "shortest path", "single source", "sssp", "non-negative weights", "relax", "greedy shortest"],
    category: "graph",
    difficulty: "advanced",
    definition: "Dijkstra's Algorithm finds shortest paths from a single source in weighted graphs with NON-NEGATIVE edge weights. Greedily extracts nearest vertex and relaxes edges. Time: O((V+E) log V) with binary heap.",
    intuition: "Always expand the unvisited vertex with smallest known distance. Like GPS routing.",
    steps: ["INIT: d[s]=0, d[v]=∞ for all v≠s, π[v]=NIL", "Add all vertices to min-priority queue Q", "While Q not empty: u=EXTRACT-MIN(Q)", "Add u to settled set S", "For each neighbor v: RELAX(u,v,w)", "RELAX: if d[u]+w(u,v)<d[v]: d[v]=d[u]+w(u,v), π[v]=u"],
    pseudocode: "DIJKSTRA(G, w, s):\n  INIT-SINGLE-SOURCE(G,s)\n  S=empty; Q=all vertices\n  while Q≠empty:\n    u=EXTRACT-MIN(Q)\n    S=S∪{u}\n    for each v in Adj[u]: RELAX(u,v,w)\n\nRELAX(u,v,w):\n  if d[v]>d[u]+w(u,v):\n    d[v]=d[u]+w(u,v); π[v]=u",
    example: { input: "s→t(10),s→y(5),y→t(3),t→x(1)", steps: ["Init:d={s:0,t:∞,y:∞,x:∞}", "Extract s: t→10,y→5", "Extract y(5): t→8,x→14", "Extract t(8): x→9", "Extract x(9): done"], output: "d={s:0,t:8,y:5,x:9}" },
    complexity: { time: { array: "O(V²)", binary_heap: "O((V+E) log V)", fibonacci_heap: "O(E + V log V)" }, space: "O(V)" },
    limitations: ["Does NOT work with negative edge weights", "Use Bellman-Ford for negative weights"],
    comparisons: { bellman_ford: "Dijkstra O((V+E)logV) no negative edges. Bellman-Ford O(VE) handles negatives.", bfs: "BFS for unweighted. Dijkstra for weighted non-negative." },
    related_topics: ["bellman-ford", "bfs", "minimum-spanning-tree", "priority-queue"]
  },

  // ── BELLMAN-FORD ─────────────────────────────────────────────
  {
    id: "bellman-ford",
    name: "Bellman-Ford Algorithm",
    aliases: ["bellman ford", "bellman-ford", "bellman ford algorithm", "bellman-ford algorithm", "bellman", "negative weight shortest path", "negative edges shortest path"],
    keywords: ["bellman ford", "bellman-ford", "negative weight", "negative edge", "negative cycle", "relax all edges"],
    category: "graph",
    difficulty: "advanced",
    definition: "Bellman-Ford solves single-source shortest paths even with NEGATIVE edge weights. Relaxes ALL edges V-1 times. A V-th pass that still relaxes indicates a negative-weight cycle. Time: O(VE).",
    steps: ["INIT: d[s]=0, d[v]=∞ for all v≠s", "Repeat V-1 times: for each edge (u,v): RELAX(u,v,w)", "For each edge: if d[v]>d[u]+w(u,v): NEGATIVE CYCLE EXISTS", "Return d[] if no negative cycle"],
    pseudocode: "BELLMAN-FORD(G, w, s):\n  INIT-SINGLE-SOURCE(G,s)\n  for i=1 to |V|-1:\n    for each (u,v) in E: RELAX(u,v,w)\n  for each (u,v) in E:\n    if d[v]>d[u]+w(u,v): return FALSE\n  return TRUE",
    complexity: { time: { best: "O(VE)", average: "O(VE)", worst: "O(VE)" }, space: "O(V)" },
    advantages: ["Handles negative edge weights", "Detects negative weight cycles"],
    disadvantages: ["Slower than Dijkstra: O(VE) vs O((V+E)logV)"],
    comparisons: { dijkstra: "Dijkstra faster but no negative edges. Use Bellman-Ford when negative edges exist." },
    related_topics: ["dijkstra", "shortest-path", "relaxation"]
  },

  // ── MINIMUM SPANNING TREE ────────────────────────────────────
  {
    id: "minimum-spanning-tree",
    name: "Minimum Spanning Tree",
    aliases: ["minimum spanning tree", "mst", "kruskal", "prim", "spanning tree", "kruskal's algorithm", "prim's algorithm", "kruskal algorithm", "prim algorithm"],
    keywords: ["minimum spanning tree", "mst", "kruskal", "prim", "spanning tree", "cut property", "safe edge"],
    category: "graph",
    difficulty: "advanced",
    definition: "A Minimum Spanning Tree (MST) of a weighted undirected graph is a spanning tree with minimum total edge weight. Key theorem: Cut Property — for any cut (S,V-S), the min weight crossing edge is in some MST. Kruskal and Prim both find MST greedily.",
    cut_property: "For any cut (S, V-S), the minimum weight edge crossing the cut belongs to some MST.",
    algorithms: {
      kruskal: { approach: "Sort ALL edges by weight. Add edge if no cycle (Union-Find).", complexity: "O(E log E) = O(E log V)", pseudocode: "KRUSKAL:\n  sort edges\n  for each (u,v) sorted:\n    if FIND(u)≠FIND(v): add to MST, UNION(u,v)" },
      prim: { approach: "Grow MST from one vertex. Always add cheapest edge to non-tree vertex.", complexity: "O(E log V) binary heap", pseudocode: "PRIM:\n  key[r]=0, all others ∞\n  Q=min-heap\n  while Q≠empty:\n    u=EXTRACT-MIN\n    for v in Adj[u]:\n      if v in Q and w(u,v)<key[v]: π[v]=u,key[v]=w(u,v)" }
    },
    comparisons: { kruskal_vs_prim: "Kruskal processes edges globally — better sparse. Prim grows from vertex — better dense." },
    related_topics: ["greedy-algorithms", "dijkstra", "union-find"]
  },

  // ── HUFFMAN CODES ────────────────────────────────────────────
  {
    id: "huffman-codes",
    name: "Huffman Codes",
    aliases: ["huffman codes", "huffman coding", "huffman", "prefix free codes", "data compression", "huffman tree", "optimal codes"],
    keywords: ["huffman", "prefix free", "compression", "optimal codes", "variable length", "frequency"],
    category: "greedy",
    difficulty: "intermediate",
    definition: "Huffman Coding creates optimal prefix-free binary codes for data compression. Frequent characters get shorter codes. Greedy: always merge two lowest-frequency nodes. Result is provably optimal.",
    steps: ["Create leaf for each character with its frequency", "Insert all into min-priority queue", "While queue has >1 node: extract x,y (min freq), create z with freq[x]+freq[y], left=x, right=y, insert z", "Root is Huffman tree. Left=0, Right=1. Code = root-to-leaf path."],
    example: { input: "a:45, b:13, c:12, d:16, e:9, f:5", output: "a:0, c:100, b:101, f:1100, e:1101, d:111" },
    complexity: { time: "O(n log n)", space: "O(n)" },
    optimality: "Huffman code minimizes expected code length — provably optimal prefix-free code",
    related_topics: ["greedy-algorithms", "priority-queue"]
  },

  // ── STRASSEN ─────────────────────────────────────────────────
  {
    id: "strassen",
    name: "Strassen's Algorithm",
    aliases: ["strassen", "strassen's algorithm", "strassen algorithm", "matrix multiplication", "fast matrix multiply"],
    keywords: ["strassen", "matrix multiplication", "matrix multiply", "7 multiplications"],
    category: "divide and conquer",
    difficulty: "advanced",
    definition: "Strassen's Algorithm multiplies n×n matrices in O(n^2.81) using only 7 recursive multiplications instead of 8, reducing from O(n³). Recurrence: T(n) = 7T(n/2) + Θ(n²).",
    steps: ["Divide each matrix into four n/2×n/2 submatrices", "Compute 7 products P₁..P₇ (not 8)", "Combine: C₁₁=P₅+P₄-P₂+P₆, C₁₂=P₁+P₂, C₂₁=P₃+P₄, C₂₂=P₁+P₅-P₃-P₇"],
    complexity: { time: { naive: "O(n³)", strassen: "O(n^log₂7) = O(n^2.81)" }, recurrence: "T(n) = 7T(n/2) + Θ(n²)" },
    related_topics: ["divide-and-conquer", "master-theorem"]
  }
];

const seedDB = async () => {
  await connectDB();
  await Topic.deleteMany({});
  console.log("🗑️  Cleared all existing topics");
  await Topic.insertMany(topics);
  console.log(`✅ Inserted ${topics.length} clean individual topics`);
  console.log("\n📋 Topics inserted:");
  topics.forEach(t => console.log(`  • ${t.name}`));
  mongoose.connection.close();
  console.log("\n🔒 Done!");
};

seedDB();