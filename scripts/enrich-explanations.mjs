/**
 * enrich-explanations.mjs
 *
 * Generates a detailed "## Explanation" section for every MDX problem file
 * that does not already have one.  Uses frontmatter metadata (patterns,
 * complexity, Java APIs) and the raw Java source to produce a structured,
 * human-readable walkthrough.
 *
 * Usage:
 *   node enrich-explanations.mjs           # dry-run (preview count)
 *   node enrich-explanations.mjs --write   # apply changes
 *   node enrich-explanations.mjs --force   # overwrite existing explanations too
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT   = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(REPO_ROOT, 'docs/src/content/problems');

const WRITE = process.argv.includes('--write');
const FORCE = process.argv.includes('--force');

// ─── File helpers ─────────────────────────────────────────────────────────────

function walkMdx(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory())              out.push(...walkMdx(p));
    else if (e.name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

// ─── Frontmatter parser ───────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    // Array value: key: ["a","b"]
    const arrM = line.match(/^(\w+):\s*\[(.*)\]\s*$/);
    if (arrM) {
      fm[arrM[1]] = arrM[2]
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }
    // Scalar: key: "value" or key: value
    const scalarM = line.match(/^(\w+):\s*(.+)$/);
    if (scalarM) {
      fm[scalarM[1]] = scalarM[2].trim().replace(/^["']|["']$/g, '').trim();
    }
  }
  return fm;
}

// ─── Java path resolver ───────────────────────────────────────────────────────

function deriveJavaPath(githubUrl) {
  if (!githubUrl) return null;
  const m = githubUrl.match(/\/blob\/master\/(.+)$/);
  if (!m) return null;
  return path.join(REPO_ROOT, m[1]);
}

// ─── Code analysis helpers ────────────────────────────────────────────────────

/** Extract the public method signatures (name + params). */
function extractMethods(src) {
  const re = /public\s+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)/g;
  const results = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[1] === 'main') continue;
    results.push({ name: m[1], params: m[2].trim() });
  }
  return results;
}

/** Extract meaningful local variable names declared in the method body. */
function extractVariables(src) {
  const vars = new Set();
  // int/long/boolean/String/Map/Set/List/Queue/Stack/Deque + varName
  const re = /(?:int|long|boolean|String|char|double|Map|Set|List|Queue|Stack|Deque|PriorityQueue|ArrayDeque|LinkedList|ArrayList|HashMap|HashSet|TreeMap|TreeSet|StringBuilder|int\[\]|boolean\[\])\s+(\w+)\s*=/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!['result', 'res', 'ans', 'output'].includes(m[1])) vars.add(m[1]);
  }
  return [...vars].slice(0, 6);
}

/** Detect the primary loop style. */
function detectLoopStyle(src) {
  if (/while\s*\(!?(\w+)\.isEmpty/.test(src)) return 'queue/stack loop';
  if (/for\s*\(.*;\s*\w+\s*</.test(src) && /for\s*\(.*;\s*\w+\s*>/.test(src)) return 'nested for-loops';
  if (/while\s*\(\w+\s*(<=|<)\s*\w+/.test(src)) return 'while loop with two pointers';
  if (/for\s*\(int\s+\w+\s*=/.test(src)) return 'indexed for-loop';
  if (/for\s*\(\w+\s+\w+\s*:/.test(src)) return 'enhanced for-each loop';
  return 'iterative loop';
}

// ─── Pattern-specific explanation builders ────────────────────────────────────

const PATTERN_DESCRIPTIONS = {
  'hash-map': {
    oneLiner: 'HashMap for O(1) average-case lookups',
    approach: (title, apis) =>
      `The key insight for **${title}** is that a brute-force nested-loop search would cost O(n²) time — we can cut that to O(n) by trading space for speed. As we scan the array once, we store information in a \`${apis.includes('HashMap') ? 'HashMap' : 'HashSet'}\` so that any future lookup takes constant time instead of requiring another full pass.\n\n` +
      `This "remember what we've seen" strategy is one of the most powerful tools in competitive programming. Instead of asking "does the answer exist somewhere in the array?" by re-scanning, we simply ask "is the answer already in my map?" — a single O(1) operation.`,
    keySteps: [
      'Initialise an empty hash structure (HashMap or HashSet) before iterating.',
      'For each element, compute what you\'re looking for (a complement, a count, a flag).',
      'Check the hash structure first — if the target is there, you\'re done.',
      'Otherwise, insert the current element (or its metadata) into the structure.',
      'Return the result after the loop if no early exit occurred.',
    ],
  },
  'sliding-window': {
    oneLiner: 'sliding window to avoid redundant re-computation',
    approach: (title) =>
      `**${title}** asks about a contiguous subarray or substring, which is the classic signal for a sliding window. Instead of recomputing the window's property from scratch every time (O(n²)), we maintain a running state and slide one boundary at a time.\n\n` +
      `Think of it like looking through a physical window on a train — as the train moves you don't redraw the entire landscape; you simply note what enters on one side and what leaves on the other. The window expands when we want to include more elements and shrinks when a constraint is violated.`,
    keySteps: [
      'Initialise left and right pointers both at index 0.',
      'Expand the window by advancing the right pointer and updating the window state.',
      'When the window violates the constraint, shrink from the left until it is valid again.',
      'At each valid state, update the global answer (max length, min size, etc.).',
      'Continue until the right pointer reaches the end of the input.',
    ],
  },
  'two-pointers': {
    oneLiner: 'two pointers moving toward each other',
    approach: (title) =>
      `**${title}** exploits sorted order (or a structural property) to let two pointers converge from opposite ends of the array, eliminating the need for a nested loop. When the current pair doesn't satisfy the condition, we know exactly which pointer to advance — so each element is visited at most once, giving O(n) time.\n\n` +
      `Imagine squeezing a tube of toothpaste from both ends simultaneously — instead of trying every possible pair (both ends → O(n²)), you make an informed decision at each step about which end to squeeze next.`,
    keySteps: [
      'Sort the array if it isn\'t already (or confirm the existing order guarantees correctness).',
      'Place one pointer at the start (left = 0) and one at the end (right = n - 1).',
      'Compute the result for the current pair.',
      'If the result is too small, advance left to increase it; if too large, move right backward.',
      'Stop when the pointers meet or cross.',
    ],
  },
  'binary-search': {
    oneLiner: 'binary search to halve the search space each step',
    approach: (title) =>
      `**${title}** has a monotonic property: we can always determine whether the answer lies in the left or right half of the remaining search space. Binary search exploits this by halving the space at every step, achieving O(log n) instead of O(n) linear scan.\n\n` +
      `Picture looking up a word in a dictionary: you open to the middle, decide whether your word is in the left or right half, and discard the other half entirely. After at most log₂(n) steps you've found your word — or confirmed it isn't there.`,
    keySteps: [
      'Define left and right boundaries covering all possible answers.',
      'Compute mid = left + (right - left) / 2 (avoids integer overflow).',
      'Evaluate the predicate at mid to decide which half to discard.',
      'Narrow the range: move left = mid + 1 or right = mid - 1.',
      'Repeat until left > right; the answer is typically left (or right + 1).',
    ],
  },
  'bfs': {
    oneLiner: 'BFS to explore nodes level by level',
    approach: (title) =>
      `**${title}** requires visiting nodes in order of their distance from the source — exactly what Breadth-First Search (BFS) guarantees. By processing nodes level by level via a queue (FIFO), BFS finds the shortest path in an unweighted graph and naturally handles all reachability questions.\n\n` +
      `Think of it as ripples spreading outward from a stone dropped in water. All nodes at distance 1 are visited before any node at distance 2, and so on. This property makes BFS the right tool whenever "minimum steps" or "level order" is part of the problem.`,
    keySteps: [
      'Add the source node(s) to a queue and mark them visited.',
      'While the queue is non-empty, poll the front node.',
      'Process the current node (update answer, record level, etc.).',
      'Enqueue all unvisited neighbours and mark them visited immediately to avoid re-processing.',
      'The first time you reach the target, you have the shortest path.',
    ],
  },
  'dfs': {
    oneLiner: 'DFS to explore all paths or connected components recursively',
    approach: (title) =>
      `**${title}** needs to explore all possible paths or the full extent of a connected region — the classic use-case for Depth-First Search (DFS). DFS dives as deep as possible along one branch before backtracking, making it ideal for connectivity, cycle detection, and exhaustive enumeration.\n\n` +
      `Imagine navigating a maze by always turning left until you hit a dead end, then backtracking to the last junction and trying the next option. DFS systematically explores every possibility without re-visiting the same cell.`,
    keySteps: [
      'Choose a starting node and mark it as visited.',
      'Recursively (or with an explicit stack) visit each unvisited neighbour.',
      'Perform the required computation during entry or exit of each node.',
      'Backtrack naturally when recursion returns — the call stack handles the state.',
      'Repeat for all unvisited nodes to cover disconnected components if needed.',
    ],
  },
  'dynamic-programming': {
    oneLiner: 'dynamic programming — break into overlapping subproblems and memoize',
    approach: (title) =>
      `**${title}** has optimal substructure: the answer to the full problem can be built from answers to smaller sub-problems. Without memoisation, a naive recursion solves the same sub-problem exponentially many times; DP stores each result once and reuses it in O(1).\n\n` +
      `Think of computing Fibonacci numbers: fib(5) needs fib(4) and fib(3), which both need fib(2) — without caching you'd compute fib(2) repeatedly. DP caches each sub-answer so every value is computed exactly once, reducing exponential work to polynomial.`,
    keySteps: [
      'Define the state: what does dp[i] (or dp[i][j]) represent?',
      'Write the recurrence relation that builds dp[i] from previously computed states.',
      'Identify and set the base cases (dp[0], dp[1], etc.).',
      'Fill the table bottom-up (or top-down with memoisation) in the correct order.',
      'Read off the final answer from dp[n] (or dp[m][n] for 2-D problems).',
    ],
  },
  'union-find': {
    oneLiner: 'Union-Find (Disjoint Set Union) to track connected components',
    approach: (title) =>
      `**${title}** involves repeatedly merging groups and querying whether two elements belong to the same group — perfect for Union-Find. The data structure maintains a forest of trees where each tree represents a component; union merges two trees and find identifies a root.\n\n` +
      `With path compression (flattening the tree on every find) and union by rank (always attaching the smaller tree under the larger), both operations run in near-constant amortised time O(α(n)), where α is the extremely slow-growing inverse Ackermann function.`,
    keySteps: [
      'Initialise parent[i] = i and rank[i] = 0 for every node.',
      'find(x): recursively find the root, applying path compression along the way.',
      'union(x, y): find both roots; if different, attach the lower-rank tree under the higher-rank one.',
      'After processing all edges/queries, count distinct roots or answer connectivity queries.',
    ],
  },
  'topological-sort': {
    oneLiner: 'topological sort (Kahn\'s algorithm) on a DAG',
    approach: (title) =>
      `**${title}** models dependencies as a Directed Acyclic Graph (DAG) and asks for a valid ordering — exactly what topological sort provides. Kahn's algorithm uses in-degree counts: start with all nodes that have no prerequisites (in-degree 0), process them, and decrement the in-degree of their successors.\n\n` +
      `Think of it as a task scheduler: you can only start a task once all tasks it depends on are finished. Kahn's BFS-based approach naturally detects cycles (if the processed count is less than the total node count, a cycle exists).`,
    keySteps: [
      'Build an adjacency list and compute in-degree for every node.',
      'Enqueue all nodes with in-degree 0.',
      'Poll a node, add it to the result, and decrement the in-degree of its neighbours.',
      'Enqueue any neighbour whose in-degree drops to 0.',
      'If the result size equals the total node count, the ordering is valid; otherwise a cycle exists.',
    ],
  },
  'heap': {
    oneLiner: 'heap (priority queue) for efficient min/max retrieval',
    approach: (title) =>
      `**${title}** needs to repeatedly find the smallest or largest element from a dynamically changing collection. A heap (Java's \`PriorityQueue\`) maintains this invariant with O(log n) insert and O(log n) remove, far better than sorting the entire collection each time.\n\n` +
      `A min-heap is like a waiting room where the most urgent patient always sits at the front. As patients arrive or leave, the room reorganises in O(log n) time to keep the most urgent at the front — you never need to scan everyone to find them.`,
    keySteps: [
      'Choose a min-heap (natural order) or max-heap (Comparator.reverseOrder()).',
      'Insert elements as you process them.',
      'Poll the top element when you need the current minimum/maximum.',
      'For "top-K" problems, keep the heap size bounded at K to save memory.',
      'After processing, the remaining heap elements or the polled sequence is your answer.',
    ],
  },
  'monotonic-stack': {
    oneLiner: 'monotonic stack to find the next greater/smaller element in O(n)',
    approach: (title) =>
      `**${title}** asks about the relationship between each element and the next element that is greater (or smaller) than it. A brute-force nested loop is O(n²); a monotonic stack solves it in O(n) by maintaining a stack that is always in increasing (or decreasing) order.\n\n` +
      `As you scan left to right, every time a new element would break the stack's monotonic property, you pop elements off — each pop reveals that the current element is the "next greater" for the popped element. Each element is pushed and popped at most once, giving O(n) total time.`,
    keySteps: [
      'Initialise an empty stack (storing indices, not values, for flexibility).',
      'For each element, while the stack is non-empty and the condition is met, pop and record the answer.',
      'Push the current index onto the stack.',
      'After the full scan, remaining stack elements have no next-greater element (answer = -1 or 0).',
    ],
  },
  'greedy': {
    oneLiner: 'greedy — make the locally optimal choice at each step',
    approach: (title) =>
      `**${title}** has a greedy property: at every decision point, the locally optimal choice leads to a globally optimal solution. Unlike DP, which considers all sub-problems, a greedy algorithm commits to one choice and never reconsiders.\n\n` +
      `The challenge with greedy is proving correctness (an exchange argument usually works: show that swapping any two elements in a non-greedy solution to match the greedy order never makes things worse). Once you accept the greedy choice is safe, the algorithm is typically simple and fast.`,
    keySteps: [
      'Identify the greedy criterion (sort by end time, sort by cost, always pick the max/min, etc.).',
      'Sort or arrange the input according to this criterion.',
      'Iterate and make the greedy decision at each step without revisiting previous choices.',
      'Update state (current end, running sum, remaining capacity) after each decision.',
      'Return the accumulated result.',
    ],
  },
  'prefix-sum': {
    oneLiner: 'prefix sum array for O(1) range queries',
    approach: (title) =>
      `**${title}** requires repeated range-sum queries. Computing each sum from scratch is O(n) per query; a prefix sum array precomputes cumulative totals so any range sum [l, r] reduces to prefixSum[r] - prefixSum[l - 1] — a single O(1) subtraction.\n\n` +
      `Imagine a running tally of rainfall: instead of adding up each day's rain for every query, you keep a running total. The rain from day l to day r is simply totalUpToR - totalUpToL-1.`,
    keySteps: [
      'Allocate prefix[n + 1] initialised to 0.',
      'Fill prefix[i] = prefix[i - 1] + nums[i - 1] for i from 1 to n.',
      'Answer a range query [l, r] (0-indexed) as prefix[r + 1] - prefix[l].',
      'Use a HashMap from prefix-sum → first index to detect subarrays with a target sum.',
    ],
  },
  'trie': {
    oneLiner: 'trie (prefix tree) for efficient string prefix operations',
    approach: (title) =>
      `**${title}** involves many prefix-based string operations (insert, startsWith, search). A trie (prefix tree) stores characters along edges; words with common prefixes share nodes, making prefix checks O(L) where L is the word length — independent of the total number of stored words.\n\n` +
      `Think of a trie as an autocomplete system. When you type "pre", the trie immediately navigates to the "pre" node and can enumerate all completions from there without scanning the entire dictionary.`,
    keySteps: [
      'Define a TrieNode with `children[26]` (or a `HashMap<Character, TrieNode>`) and a boolean `isEnd`.',
      '`insert(word)`: traverse/create nodes character by character; mark `isEnd = true` at the last node.',
      '`search(word)`: traverse nodes; return true only if all characters matched and `isEnd` is true.',
      '`startsWith(prefix)`: same traversal but return true as soon as you\'ve matched the full prefix.',
    ],
  },
  'merge-intervals': {
    oneLiner: 'sort intervals by start time, then merge overlapping ones in one pass',
    approach: (title) =>
      `**${title}** deals with overlapping intervals. After sorting by start time, any interval that overlaps with the previous one (its start ≤ previous end) can be merged by extending the end. A single left-to-right scan after sorting handles all merges in O(n).\n\n` +
      `Visualise intervals as horizontal bars on a timeline. Once sorted by left edge, you walk left to right: if the new bar overlaps the current merged bar, extend the merged bar; otherwise, seal the current bar and start a new one.`,
    keySteps: [
      'Sort intervals by their start value.',
      'Initialise the result list with the first interval.',
      'For each subsequent interval, compare its start with the end of the last interval in the result.',
      'If they overlap (start ≤ last.end), update last.end = max(last.end, current.end).',
      'Otherwise, append the current interval as a new merged interval.',
    ],
  },
  'fast-slow-pointers': {
    oneLiner: 'fast/slow pointer (Floyd\'s cycle detection)',
    approach: (title) =>
      `**${title}** uses two pointers moving at different speeds — slow advances one step at a time, fast advances two. If a cycle exists, the fast pointer eventually laps the slow pointer and they meet inside the cycle. If no cycle exists, fast reaches the end first.\n\n` +
      `Think of two runners on a circular track: the faster runner will always eventually overtake (lap) the slower one. If the track has no loop (i.e., it ends), the faster runner simply reaches the finish line first.`,
    keySteps: [
      'Initialise slow = head and fast = head.',
      'Advance slow by one step and fast by two steps each iteration.',
      'If fast or fast.next is null, there is no cycle.',
      'If slow == fast, a cycle is detected (meeting point is inside the cycle).',
      'To find the cycle entry point, reset one pointer to head and advance both one step at a time.',
    ],
  },
  'divide-and-conquer': {
    oneLiner: 'divide and conquer — split, solve recursively, combine',
    approach: (title) =>
      `**${title}** follows the classic divide-and-conquer pattern: split the problem into smaller independent sub-problems, solve each recursively, then combine the results. This typically yields O(n log n) time because each level of recursion does O(n) work and there are O(log n) levels.\n\n` +
      `Merge Sort is the canonical example: split the array in half, sort each half independently, then merge the two sorted halves in linear time. The "combine" step is where the real work happens.`,
    keySteps: [
      'Define the base case (array of size 0 or 1 is already solved).',
      'Split the input roughly in half (or by another natural partition).',
      'Recursively solve each half.',
      'Merge or combine the two results to produce the answer for the full input.',
    ],
  },
  'backtracking': {
    oneLiner: 'backtracking — explore all candidates and prune invalid paths early',
    approach: (title) =>
      `**${title}** requires enumerating all valid combinations/permutations/subsets. Backtracking systematically tries every candidate and immediately abandons ("prunes") any branch that cannot possibly lead to a valid solution, making it far faster than brute-force enumeration in practice.\n\n` +
      `Think of solving a sudoku: you place a digit, recursively try to solve the rest, and if you reach a contradiction you erase that digit (backtrack) and try the next. The key is that pruning can cut enormous branches of the search tree early.`,
    keySteps: [
      'Define what constitutes a valid complete solution (base case).',
      'At each step, iterate over all possible next choices.',
      'Apply a choice (mutate state), then recurse.',
      'After recursion returns, undo the choice (backtrack) to restore state.',
      'Apply a pruning condition to skip choices that cannot lead to a valid solution.',
    ],
  },
};

// ─── Complexity explanation builder ──────────────────────────────────────────

function explainComplexity(tc, sc, patterns, javaApis, src) {
  const lines = [];

  // Time
  const timeReason = reasonForTime(tc, patterns, src);
  lines.push(`- **Time Complexity: \`${tc || '?'}\`** — ${timeReason}`);

  // Space
  const spaceReason = reasonForSpace(sc, javaApis, patterns, src);
  lines.push(`- **Space Complexity: \`${sc || '?'}\`** — ${spaceReason}`);

  return lines.join('\n');
}

function reasonForTime(tc, patterns, src) {
  if (!tc) return 'see analysis above.';
  if (tc === 'O(1)')    return 'only a constant number of operations are performed regardless of input size.';
  if (tc === 'O(log n)') return 'the search space is halved at each step (binary search).';
  if (tc === 'O(n)')    {
    if (patterns.includes('hash-map') || patterns.includes('prefix-sum'))
      return 'the array is traversed exactly once; all HashMap/HashSet operations are O(1) amortised.';
    if (patterns.includes('sliding-window'))
      return 'each element enters and leaves the window at most once, so the total work across all iterations is linear.';
    if (patterns.includes('two-pointers'))
      return 'the two pointers together traverse the array at most once — every element is visited at most twice.';
    return 'the input is processed in a single linear pass.';
  }
  if (tc === 'O(n log n)') {
    if (patterns.includes('merge-intervals') || src?.includes('Arrays.sort') || src?.includes('Collections.sort'))
      return 'dominated by sorting the input (O(n log n)); the subsequent linear scan is O(n).';
    if (patterns.includes('heap'))
      return 'each of the n elements is inserted into and possibly removed from the heap at most once, each operation costing O(log n).';
    if (patterns.includes('divide-and-conquer'))
      return 'there are O(log n) levels of recursion and O(n) work at each level (Master Theorem: T(n) = 2T(n/2) + O(n)).';
    return 'the dominant operation runs in O(n log n).';
  }
  if (/O\(n\^?2\)/.test(tc) || tc === 'O(n²)')
    return 'requires examining all pairs of elements, leading to a quadratic number of comparisons.';
  if (/O\(m\*n\)/.test(tc) || /O\(m.n\)/.test(tc))
    return 'every cell of the m × n grid is visited at most once.';
  if (/O\(V\+E\)/.test(tc))
    return 'each vertex and each edge is processed at most once in the graph traversal.';
  if (/O\(n.k\)/.test(tc) || /O\(nk\)/.test(tc))
    return 'n elements are processed and each costs up to O(k) work.';
  if (/O\(2\^n\)/.test(tc))
    return 'worst-case exponential — every subset of the input may need to be explored.';
  return 'see the analysis for full details.';
}

function reasonForSpace(sc, javaApis, patterns, src) {
  if (!sc) return 'see analysis above.';
  if (sc === 'O(1)')
    return 'only a fixed number of extra variables are used; no data structures that scale with input.';
  if (sc === 'O(n)') {
    if (javaApis?.some(a => ['HashMap', 'HashSet', 'LinkedHashMap', 'TreeMap', 'TreeSet'].includes(a)))
      return 'the hash structure can hold up to n entries in the worst case.';
    if (patterns.includes('prefix-sum'))
      return 'the prefix sum array has the same length as the input.';
    if (patterns.includes('bfs'))
      return 'the BFS queue can hold up to O(n) nodes at the widest level.';
    if (patterns.includes('dynamic-programming'))
      return 'the DP table has O(n) entries (or O(n²) for 2-D DP — see the dp array dimensions).';
    return 'auxiliary space proportional to the input size is used.';
  }
  if (/O\(m.n\)/.test(sc) || /O\(m\*n\)/.test(sc))
    return 'a visited/DP matrix of the same dimensions as the input grid is maintained.';
  if (/O\(n\^?2\)/.test(sc) || sc === 'O(n²)')
    return 'a 2-D DP table of size n × n is used.';
  if (/O\(log n\)/.test(sc))
    return 'the recursion call stack grows to O(log n) depth.';
  if (/O\(V\+E\)/.test(sc))
    return 'the adjacency list and visited array together use space proportional to vertices + edges.';
  return 'auxiliary space proportional to the input is required.';
}

// ─── Explanation assembler ────────────────────────────────────────────────────

function generateExplanation(fm, javaSource) {
  const patterns  = Array.isArray(fm.patterns) ? fm.patterns.filter(Boolean) : [];
  const javaApis  = Array.isArray(fm.javaApis)  ? fm.javaApis.filter(Boolean)  : [];
  const title     = fm.title     || 'this problem';
  const tc        = fm.timeComplexity  || '';
  const sc        = fm.spaceComplexity || '';

  const methods   = javaSource ? extractMethods(javaSource)  : [];
  const variables = javaSource ? extractVariables(javaSource) : [];
  const loopStyle = javaSource ? detectLoopStyle(javaSource) : 'iterative loop';

  // Pick the first recognised pattern; fall back to a generic description
  const primaryPattern = patterns.find(p => PATTERN_DESCRIPTIONS[p]);
  const desc = primaryPattern ? PATTERN_DESCRIPTIONS[primaryPattern] : null;

  const lines = ['## Explanation', ''];

  // ── Approach ───────────────────────────────────────────────────────────────
  lines.push('### Approach');
  lines.push('');
  if (desc) {
    lines.push(escapeMDXText(desc.approach(title, javaApis)));
  } else {
    // Generic fallback based on topic
    const topicVerb = (fm.topic || '').replace(/_/g, ' ');
    lines.push(
      `**${title}** is a ${topicVerb} problem. The solution iterates over the input using a ${loopStyle}, ` +
      `applying the appropriate data structure (${javaApis.join(', ') || 'built-in arrays'}) to ` +
      `achieve the target complexities of \`${tc || 'O(?)'}\` time and \`${sc || 'O(?)'}\` space.`
    );
  }
  lines.push('');

  // ── Code walkthrough ───────────────────────────────────────────────────────
  lines.push('### Code Walkthrough');
  lines.push('');

  if (methods.length > 0) {
    const mainMethod = methods[0];
    lines.push(`The solution is implemented in \`${mainMethod.name}(${mainMethod.params})\`:`);
    lines.push('');
  }

  if (desc) {
    desc.keySteps.forEach((step, i) => {
      lines.push(`${i + 1}. ${escapeMDXText(step)}`);
    });
  } else {
    // Generic walkthrough using extracted variables
    lines.push(`1. **Initialise** the necessary data structures${variables.length ? ` (\`${variables.slice(0, 3).join('`, `')}\`)` : ''}.`);
    lines.push(`2. **Iterate** over the input using a ${loopStyle}.`);
    lines.push(`3. **Process** each element: apply the core logic and update state.`);
    lines.push(`4. **Return** the accumulated result after the loop.`);
  }

  // If there are important secondary patterns, mention them
  const secondary = patterns.filter(p => p !== primaryPattern && PATTERN_DESCRIPTIONS[p]);
  if (secondary.length > 0) {
    lines.push('');
    lines.push(escapeMDXText(
      `> **Note:** This solution also uses the **${secondary.map(p => PATTERN_DESCRIPTIONS[p].oneLiner).join('** and **')}** technique${secondary.length > 1 ? 's' : ''}.`
    ));
  }

  lines.push('');

  // ── Complexity analysis ────────────────────────────────────────────────────
  lines.push('### Complexity Analysis');
  lines.push('');
  lines.push(escapeMDXText(explainComplexity(tc, sc, patterns, javaApis, javaSource)));
  lines.push('');

  return lines.join('\n');
}

// ─── MDX safety ─────────────────────────────────────────────────────────────

/**
 * Escape characters that MDX would interpret as JSX in plain text.
 * Leaves content inside backtick code-spans untouched.
 */
function escapeMDXText(text) {
  // Split on backtick spans so we only escape outside code-spans
  const parts = text.split(/(`[^`]*`)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) return part; // inside a backtick span — leave as-is
    return part
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }).join('');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  DSA Explanation Enrichment' + (WRITE ? (FORCE ? ' [FORCE WRITE]' : ' [WRITE]') : ' [DRY-RUN — pass --write to apply]'));
  console.log('══════════════════════════════════════════════════════\n');

  const files = walkMdx(CONTENT_DIR);
  let generated = 0, skipped = 0, errors = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf-8');

    // Skip if already has an Explanation section and not forcing
    if (!FORCE && raw.includes('## Explanation')) {
      skipped++;
      continue;
    }

    const fm = parseFrontmatter(raw);
    const javaPath = deriveJavaPath(String(fm.githubUrl || ''));
    const javaSource = javaPath && fs.existsSync(javaPath)
      ? fs.readFileSync(javaPath, 'utf-8')
      : null;

    try {
      const explanation = generateExplanation(fm, javaSource);

      // Insert after the last ``` closing the Java Solution block, or append at end
      let updated;
      const javaSolutionEnd = raw.lastIndexOf('\n```\n');
      if (javaSolutionEnd !== -1) {
        updated = raw.slice(0, javaSolutionEnd + 5) + '\n' + explanation;
      } else {
        updated = raw.trimEnd() + '\n\n' + explanation;
      }

      if (WRITE) {
        fs.writeFileSync(file, updated, 'utf-8');
      }

      const rel = file.replace(CONTENT_DIR + '/', '');
      console.log(`  ✓ ${rel}`);
      generated++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(` Generated: ${generated}  │  Skipped (already exists): ${skipped}  │  Errors: ${errors}`);
  if (!WRITE && generated > 0) {
    console.log('\n Run with --write to apply the changes.');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('❌', err); process.exit(1); });
