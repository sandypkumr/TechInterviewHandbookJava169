import fs from 'fs';

/**
 * Parse a Java source file and return structured metadata.
 *
 * @param {string} filePath  Absolute path to the .java file
 * @returns {{
 *   source: string,
 *   javadoc: string|null,
 *   imports: string[],
 *   hasProblemStatement: boolean,
 *   timeComplexity: string,
 *   spaceComplexity: string,
 *   javaApis: string[],
 *   patterns: string[],
 * } | null}
 */
export function parseJavaFile(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, 'utf-8');

  const javadoc            = extractClassJavadoc(source);
  const imports            = extractImports(source);
  const hasProblemStatement = isRichDescription(javadoc);
  const timeComplexity     = extractComplexity(source, 'time');
  const spaceComplexity    = extractComplexity(source, 'space');
  const javaApis           = detectJavaApis(source, imports);
  const patterns           = detectPatterns(source);

  return { source, javadoc, imports, hasProblemStatement, timeComplexity, spaceComplexity, javaApis, patterns };
}

// ─── Javadoc extraction ──────────────────────────────────────────────────────

/**
 * Find the last block-comment (/** ... *\/) that appears before the first
 * class/interface/enum declaration and clean it up into plain text.
 */
function extractClassJavadoc(source) {
  // Find first class-like declaration
  const classIdx = source.search(/\b(class|interface|enum)\s+\w+/);
  if (classIdx === -1) return null;

  const beforeClass = source.slice(0, classIdx);

  // Match the last /** ... */ block
  const allBlocks = [...beforeClass.matchAll(/\/\*\*([\s\S]*?)\*\//g)];
  if (allBlocks.length === 0) return null;

  const raw = allBlocks[allBlocks.length - 1][1];

  // Convert HTML block tags → Markdown equivalents, then strip remaining tags
  const cleaned = raw
    .replace(/<p\s*\/?>/gi, '\n\n')              // <p> / <p/> → blank line
    .replace(/<\/p>/gi, '')                       // </p> → nothing
    .replace(/<br\s*\/?>/gi, '\n')               // <br> / <br/> → newline
    .replace(/<li>/gi, '\n- ')                   // <li> → list item
    .replace(/<\/li>|<ul>|<\/ul>|<ol>|<\/ol>/gi, '')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')    // <code>x</code> → `x`
    .replace(/<[^>]+>/g, '');                    // strip any remaining tags

  const lines = cleaned
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, '').trimEnd())  // strip leading " * "
    .filter(l => !l.startsWith('@'))                  // remove @param/@return tags
    .map(l => l.trimEnd());

  // Trim leading/trailing blank lines
  while (lines.length && lines[0].trim() === '')    lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  return lines.length > 0 ? lines.join('\n') : null;
}

/** At least 3 non-blank content lines → "rich" */
function isRichDescription(javadoc) {
  if (!javadoc) return false;
  return javadoc.split('\n').filter(l => l.trim().length > 0).length >= 3;
}

// ─── Imports ─────────────────────────────────────────────────────────────────

function extractImports(source) {
  return [...source.matchAll(/^import\s+(static\s+)?([\w.]+);/gm)].map(m => m[2]);
}

// ─── Complexity detection ────────────────────────────────────────────────────

const TIME_PATTERNS  = [
  /[Tt]ime\s*[Cc]omplexity\s*:?\s*(O\s*\([^)\n]+\))/,
  /\*\s*Time\s*:?\s*(O\s*\([^)\n]+\))/,
  /@time\s+(O\s*\([^)\n]+\))/i,
];
const SPACE_PATTERNS = [
  /[Ss]pace\s*[Cc]omplexity\s*:?\s*(O\s*\([^)\n]+\))/,
  /\*\s*Space\s*:?\s*(O\s*\([^)\n]+\))/,
  /@space\s+(O\s*\([^)\n]+\))/i,
];

function extractComplexity(source, type) {
  for (const re of type === 'time' ? TIME_PATTERNS : SPACE_PATTERNS) {
    const m = source.match(re);
    if (m) return m[1].replace(/\s+/g, '');
  }
  return '';
}

// ─── Java API detection ──────────────────────────────────────────────────────

const API_HINTS = [
  ['HashMap',             'HashMap'],
  ['LinkedHashMap',       'LinkedHashMap'],
  ['TreeMap',             'TreeMap'],
  ['HashSet',             'HashSet'],
  ['LinkedHashSet',       'LinkedHashSet'],
  ['TreeSet',             'TreeSet'],
  ['PriorityQueue',       'PriorityQueue'],
  ['ArrayDeque',          'ArrayDeque'],
  ['LinkedList',          'LinkedList'],
  ['Stack',               'Stack'],
  ['ArrayList',           'ArrayList'],
  ['Arrays.sort',         'Arrays.sort'],
  ['Arrays.fill',         'Arrays.fill'],
  ['Arrays.copyOf',       'Arrays.copyOf'],
  ['Collections.sort',    'Collections.sort'],
  ['Collections.reverse', 'Collections.reverse'],
  ['Collections.unmodifiableMap', 'Collections.unmodifiable*'],
  ['StringBuilder',       'StringBuilder'],
  ['Math.max',            'Math.max/min'],
  ['Math.min',            'Math.max/min'],
  ['Math.abs',            'Math.abs'],
  ['Integer.MAX_VALUE',   'Integer.MAX/MIN_VALUE'],
  ['Integer.MIN_VALUE',   'Integer.MAX/MIN_VALUE'],
  ['Integer.parseInt',    'Integer.parseInt'],
  ['Character.isDigit',   'Character utilities'],
  ['Character.isLetter',  'Character utilities'],
  ['Character.toLowerCase', 'Character utilities'],
];

function detectJavaApis(source, imports) {
  const found = new Set();
  for (const [hint, label] of API_HINTS) {
    if (source.includes(hint)) found.add(label);
  }
  // Add key import-based APIs
  for (const imp of imports) {
    if (imp.endsWith('HashMap'))      found.add('HashMap');
    if (imp.endsWith('PriorityQueue')) found.add('PriorityQueue');
    if (imp.endsWith('TreeMap'))      found.add('TreeMap');
  }
  return [...found];
}

// ─── Pattern detection ───────────────────────────────────────────────────────

const PATTERN_RULES = [
  {
    slug: 'sliding-window',
    hints: ['sliding window', 'Sliding Window', 'windowStart', 'windowEnd', 'window size',
            'left =', 'right =', 'l = 0', 'r = 0', 'shrink', 'expand'],
    keywords: [],
  },
  {
    slug: 'two-pointers',
    hints: ['two pointer', 'two-pointer', 'Two Pointer', 'left pointer', 'right pointer',
            'slow.next', 'fast.next'],
    keywords: [],
  },
  {
    slug: 'binary-search',
    hints: ['binary search', 'Binary Search', 'binarySearch',
            'lo = 0', 'hi =', 'mid = lo +', 'mid = (lo', 'while (lo <= hi', 'while (left <= right'],
    keywords: [],
  },
  {
    slug: 'bfs',
    hints: ['bfs', 'BFS', 'breadth-first', 'breadth first', 'level order', 'Level Order',
            'queue.poll()', 'queue.offer(', 'while (!queue.isEmpty'],
    keywords: [],
  },
  {
    slug: 'dfs',
    hints: ['dfs', 'DFS', 'depth-first', 'depth first', 'helper(', 'dfs(', 'traverse('],
    keywords: [],
  },
  {
    slug: 'backtracking',
    hints: ['backtrack', 'Backtrack', 'backtracking', 'permutation', 'combination',
            'subset', 'N-Queens', 'nQueens'],
    keywords: [],
  },
  {
    slug: 'dynamic-programming',
    hints: ['dp[', 'dp =', 'memo[', 'memo.put', 'memoization', 'Memoization',
            'bottom-up', 'top-down', 'Bottom-up', 'Top-down', 'subproblem', 'tabulation'],
    keywords: [],
  },
  {
    slug: 'union-find',
    hints: ['UnionFind', 'union-find', 'Union Find', 'parent[', 'find(root', 'union(',
            'rank[', 'DSU', 'disjoint'],
    keywords: [],
  },
  {
    slug: 'topological-sort',
    hints: ['topological', 'Topological', 'inDegree', 'in-degree', 'in_degree',
            'topoSort', 'topSort'],
    keywords: [],
  },
  {
    slug: 'heap',
    hints: ['PriorityQueue', 'maxHeap', 'minHeap', 'max heap', 'min heap', 'Max Heap',
            'Min Heap', 'kth largest', 'kth smallest'],
    keywords: [],
  },
  {
    slug: 'monotonic-stack',
    hints: ['monotonic', 'Monotonic', 'decreasing stack', 'increasing stack',
            'next greater', 'next smaller', 'largest rectangle'],
    keywords: [],
  },
  {
    slug: 'greedy',
    hints: ['greedy', 'Greedy', 'interval scheduling', 'always pick', 'locally optimal'],
    keywords: [],
  },
  {
    slug: 'prefix-sum',
    hints: ['prefix', 'prefixSum', 'prefix_sum', 'prefix sum', 'cumulative sum',
            'running sum', 'preSum'],
    keywords: [],
  },
  {
    slug: 'trie',
    hints: ['Trie', 'TrieNode', 'trie node', 'startsWith', 'isEnd', 'addWord', 'insert(word'],
    keywords: [],
  },
  {
    slug: 'merge-intervals',
    hints: ['merge', 'intervals', 'overlap', 'Interval', 'interval[', '[start', '[end',
            'start =', 'end ='],
    keywords: [],
  },
  {
    slug: 'fast-slow-pointers',
    hints: ['slow = slow.next', 'fast = fast.next.next', 'cycle detection', 'Floyd'],
    keywords: [],
  },
  {
    slug: 'divide-and-conquer',
    hints: ['divide and conquer', 'Divide and Conquer', 'merge sort', 'Merge Sort'],
    keywords: [],
  },
];

export function detectPatterns(source) {
  const found = new Set();
  for (const rule of PATTERN_RULES) {
    for (const hint of rule.hints) {
      if (source.includes(hint)) {
        found.add(rule.slug);
        break;
      }
    }
  }
  return [...found];
}
