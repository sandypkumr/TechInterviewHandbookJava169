export type CheatSection =
  | { type: 'heading'; text: string }
  | { type: 'note'; text: string }
  | { type: 'code'; lang: string; caption: string; code: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'tip'; variant: 'tip' | 'warning' | 'key'; text: string }
  | { type: 'list'; title: string; items: string[] };

export interface Cheatsheet {
  slug: string;
  title: string;
  icon: string;
  description: string;
  sections: CheatSection[];
}

// ─── 1. Java Collections ────────────────────────────────────────────────────

const javaCollections: Cheatsheet = {
  slug: 'java-collections',
  title: 'Java Collections',
  icon: '☕',
  description: 'Essential Java Collection APIs for coding interviews — HashMap, ArrayList, PriorityQueue, Deque, TreeMap.',
  sections: [
    { type: 'heading', text: 'HashMap' },
    { type: 'code', lang: 'java', caption: 'HashMap essentials', code:
`Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.getOrDefault("b", 0);          // safe get
map.putIfAbsent("a", 99);          // no-op if exists
map.computeIfAbsent("c", k -> 0);  // lazy init
map.merge("a", 1, Integer::sum);   // increment counter

// Iteration
for (Map.Entry<String, Integer> e : map.entrySet())
    System.out.println(e.getKey() + " = " + e.getValue());

// Frequency count shorthand
map.merge(word, 1, Integer::sum);` },
    { type: 'heading', text: 'PriorityQueue (Heap)' },
    { type: 'code', lang: 'java', caption: 'Min-heap and Max-heap', code:
`// Min-heap (default)
PriorityQueue<Integer> minH = new PriorityQueue<>();

// Max-heap
PriorityQueue<Integer> maxH = new PriorityQueue<>(Collections.reverseOrder());

// Custom comparator — sort by second element desc
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> b[1] - a[1]);

minH.offer(5);   // add
minH.peek();     // look at top — O(1)
minH.poll();     // remove top — O(log n)
minH.size();` },
    { type: 'heading', text: 'ArrayDeque (Stack + Queue)' },
    { type: 'code', lang: 'java', caption: 'Deque used as stack and queue', code:
`Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);   stack.pop();   stack.peek();   // LIFO

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1);  queue.poll();  queue.peek();   // FIFO

// Monotonic stack pattern
Deque<Integer> mono = new ArrayDeque<>();
for (int x : nums) {
    while (!mono.isEmpty() && mono.peek() < x)
        mono.pop();          // pop smaller elements
    mono.push(x);
}` },
    { type: 'heading', text: 'TreeMap (Sorted Map)' },
    { type: 'code', lang: 'java', caption: 'TreeMap navigation methods', code:
`TreeMap<Integer, String> tm = new TreeMap<>();
tm.put(10, "ten");  tm.put(20, "twenty");

tm.floorKey(15);    // largest key <= 15  → 10
tm.ceilingKey(15);  // smallest key >= 15 → 20
tm.lowerKey(20);    // strictly less than 20 → 10
tm.higherKey(10);   // strictly greater than 10 → 20
tm.firstKey();  tm.lastKey();
tm.subMap(10, true, 20, false);  // [10, 20)` },
    { type: 'heading', text: 'ArrayList' },
    { type: 'code', lang: 'java', caption: 'ArrayList and Collections utils', code:
`List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 2));
list.add(4);
list.remove(Integer.valueOf(1)); // remove by value
list.remove(0);                  // remove by index
Collections.sort(list);
Collections.sort(list, Collections.reverseOrder());
Collections.binarySearch(list, 3); // list must be sorted
int[] arr = list.stream().mapToInt(Integer::intValue).toArray();` },
    { type: 'heading', text: 'HashSet / LinkedHashSet' },
    { type: 'code', lang: 'java', caption: 'Set operations', code:
`Set<Integer> set = new HashSet<>();
set.add(1);  set.contains(1);  set.remove(1);

// Set intersection / union
Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3));
Set<Integer> b = new HashSet<>(Arrays.asList(2, 3, 4));
a.retainAll(b);   // intersection → {2,3}
a.addAll(b);      // union
a.removeAll(b);   // difference` },
    { type: 'tip', variant: 'key', text: 'Prefer ArrayDeque over Stack (faster). Use LinkedHashMap when insertion-order matters. TreeMap adds O(log n) overhead vs HashMap O(1).' },
  ],
};

// ─── 2. Complexity Reference ─────────────────────────────────────────────────

const complexityRef: Cheatsheet = {
  slug: 'complexity-reference',
  title: 'Complexity Reference',
  icon: '📊',
  description: 'Big O reference for data structures and sorting algorithms, plus space complexity notes.',
  sections: [
    { type: 'heading', text: 'Data Structure Complexities' },
    { type: 'table', headers: ['Structure', 'Access', 'Search', 'Insert', 'Delete', 'Space'],
      rows: [
        ['Array', 'O(1)', 'O(n)', 'O(n)', 'O(n)', 'O(n)'],
        ['Dynamic Array', 'O(1)', 'O(n)', 'O(1)*', 'O(n)', 'O(n)'],
        ['Linked List', 'O(n)', 'O(n)', 'O(1) head', 'O(1) head', 'O(n)'],
        ['HashMap', 'O(1)*', 'O(1)*', 'O(1)*', 'O(1)*', 'O(n)'],
        ['TreeMap', 'O(log n)', 'O(log n)', 'O(log n)', 'O(log n)', 'O(n)'],
        ['PriorityQueue', '—', 'O(n)', 'O(log n)', 'O(log n)', 'O(n)'],
        ['Stack / Deque', 'O(n)', 'O(n)', 'O(1)', 'O(1)', 'O(n)'],
        ['HashSet', '—', 'O(1)*', 'O(1)*', 'O(1)*', 'O(n)'],
        ['Trie', '—', 'O(L)', 'O(L)', 'O(L)', 'O(n·L)'],
      ] },
    { type: 'note', text: '* amortised average case. L = length of key.' },
    { type: 'heading', text: 'Sorting Algorithms' },
    { type: 'table', headers: ['Algorithm', 'Best', 'Average', 'Worst', 'Space', 'Stable'],
      rows: [
        ['Arrays.sort (int[])', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(log n)', 'No (dual-pivot QS)'],
        ['Collections.sort', 'O(n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Yes (TimSort)'],
        ['Merge Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Yes'],
        ['Quick Sort', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', 'No'],
        ['Heap Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'No'],
        ['Counting Sort', 'O(n+k)', 'O(n+k)', 'O(n+k)', 'O(k)', 'Yes'],
      ] },
    { type: 'heading', text: 'Common Algorithm Complexities' },
    { type: 'table', headers: ['Algorithm', 'Time', 'Space'],
      rows: [
        ['Binary Search', 'O(log n)', 'O(1)'],
        ['BFS / DFS', 'O(V + E)', 'O(V)'],
        ['Dijkstra (min-heap)', 'O((V+E) log V)', 'O(V)'],
        ['Topological Sort', 'O(V + E)', 'O(V)'],
        ['Union-Find (path+rank)', 'O(α(n)) ≈ O(1)', 'O(n)'],
        ['Dynamic Programming 1D', 'O(n)', 'O(n) or O(1)'],
        ['LCS / LIS (DP)', 'O(n²)', 'O(n²) or O(n)'],
        ['Sliding Window', 'O(n)', 'O(1) or O(k)'],
        ['Two Pointers', 'O(n)', 'O(1)'],
        ['Backtracking subsets', 'O(2ⁿ)', 'O(n)'],
      ] },
    { type: 'tip', variant: 'key', text: 'Interview rule of thumb: O(n log n) is usually acceptable. O(n²) is borderline for n ≤ 10⁴. O(2ⁿ) is only OK for n ≤ 20.' },
  ],
};

// ─── 3. Sliding Window ────────────────────────────────────────────────────────

const slidingWindow: Cheatsheet = {
  slug: 'sliding-window',
  title: 'Sliding Window',
  icon: '🪟',
  description: 'Fixed and variable window templates for contiguous subarray and substring problems.',
  sections: [
    { type: 'heading', text: 'Fixed-Size Window (size k)' },
    { type: 'code', lang: 'java', caption: 'Max sum of subarray of size k', code:
`int windowSum = 0, maxSum = 0;
for (int i = 0; i < nums.length; i++) {
    windowSum += nums[i];
    if (i >= k - 1) {
        maxSum = Math.max(maxSum, windowSum);
        windowSum -= nums[i - (k - 1)]; // slide: remove leftmost
    }
}` },
    { type: 'heading', text: 'Variable-Size Window (shrink on violation)' },
    { type: 'code', lang: 'java', caption: 'Longest substring with at most k distinct chars', code:
`int left = 0, maxLen = 0;
Map<Character, Integer> freq = new HashMap<>();

for (int right = 0; right < s.length(); right++) {
    // 1. Expand: add right element
    freq.merge(s.charAt(right), 1, Integer::sum);

    // 2. Shrink: restore invariant
    while (freq.size() > k) {
        char c = s.charAt(left++);
        freq.merge(c, -1, Integer::sum);
        if (freq.get(c) == 0) freq.remove(c);
    }

    // 3. Update answer
    maxLen = Math.max(maxLen, right - left + 1);
}` },
    { type: 'heading', text: 'Variable-Size Window (exact count — two-pass)' },
    { type: 'code', lang: 'java', caption: 'Count subarrays with exactly k → atMost(k) - atMost(k-1)', code:
`// Subarrays with exactly k distinct = atMost(k) - atMost(k-1)
private int atMost(int[] nums, int k) {
    int left = 0, result = 0;
    Map<Integer, Integer> freq = new HashMap<>();
    for (int right = 0; right < nums.length; right++) {
        freq.merge(nums[right], 1, Integer::sum);
        while (freq.size() > k) {
            int x = nums[left++];
            freq.merge(x, -1, Integer::sum);
            if (freq.get(x) == 0) freq.remove(x);
        }
        result += right - left + 1; // count all windows ending at right
    }
    return result;
}` },
    { type: 'list', title: 'Signal words that suggest Sliding Window', items: [
      '"contiguous subarray / substring"',
      '"longest / shortest satisfying condition"',
      '"maximum sum of length k"',
      '"at most / exactly k distinct elements"',
      'String anagram / permutation problems',
    ]},
    { type: 'tip', variant: 'tip', text: 'Window invariant: always maintain a valid state. If shrinking, use while (not if) to restore the invariant fully before recording the answer.' },
  ],
};

// ─── 4. Binary Search Templates ──────────────────────────────────────────────

const binarySearch: Cheatsheet = {
  slug: 'binary-search-templates',
  title: 'Binary Search Templates',
  icon: '🔍',
  description: 'Standard, leftmost, rightmost, and "search on answer" binary search patterns in Java.',
  sections: [
    { type: 'heading', text: 'Standard — find exact target' },
    { type: 'code', lang: 'java', caption: 'Returns index or -1', code:
`int lo = 0, hi = nums.length - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;   // avoids overflow
    if      (nums[mid] == target) return mid;
    else if (nums[mid] <  target) lo = mid + 1;
    else                          hi = mid - 1;
}
return -1;` },
    { type: 'heading', text: 'Left Boundary — first position ≥ target' },
    { type: 'code', lang: 'java', caption: 'Lower bound (like std::lower_bound)', code:
`int lo = 0, hi = nums.length; // hi = length (open right)
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] < target) lo = mid + 1;
    else                    hi = mid;      // keep mid as candidate
}
return lo; // lo == hi: first index where nums[i] >= target` },
    { type: 'heading', text: 'Right Boundary — last position ≤ target' },
    { type: 'code', lang: 'java', caption: 'Upper bound', code:
`int lo = 0, hi = nums.length;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] <= target) lo = mid + 1;
    else                     hi = mid;
}
return lo - 1; // last index where nums[i] <= target` },
    { type: 'heading', text: 'Search on Answer' },
    { type: 'code', lang: 'java', caption: 'Minimise maximum (e.g. Capacity to Ship in D Days)', code:
`// Binary search on the ANSWER SPACE, not the array indices
int lo = minPossible, hi = maxPossible;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (isFeasible(mid)) hi = mid;      // mid works, try smaller
    else                 lo = mid + 1;   // mid too small
}
return lo; // smallest feasible answer

// isFeasible: can we achieve value <= mid?
private boolean isFeasible(int capacity) { ... }` },
    { type: 'tip', variant: 'key', text: 'Always use mid = lo + (hi - lo) / 2. Choosing lo < hi vs lo <= hi depends on whether hi is inclusive. For boundary problems, use lo < hi with open right.' },
    { type: 'list', title: 'Binary search on answer — typical problems', items: [
      'Koko Eating Bananas — minimise eating speed',
      'Capacity to Ship Packages in D Days',
      'Minimum Number of Days to Make m Bouquets',
      'Find Peak Element (converging pointers)',
      'Median of Two Sorted Arrays (partition)',
    ]},
  ],
};

// ─── 5. BFS / DFS Templates ──────────────────────────────────────────────────

const bfsDfs: Cheatsheet = {
  slug: 'bfs-dfs-templates',
  title: 'BFS / DFS Templates',
  icon: '🌊',
  description: 'Iterative BFS, recursive DFS, grid BFS, and bidirectional BFS templates in Java.',
  sections: [
    { type: 'heading', text: 'BFS — Shortest Path (Graph)' },
    { type: 'code', lang: 'java', caption: 'Level-order BFS with visited set', code:
`Queue<Integer> queue = new ArrayDeque<>();
Set<Integer> visited = new HashSet<>();
queue.offer(start);
visited.add(start);
int steps = 0;

while (!queue.isEmpty()) {
    int size = queue.size();          // process level by level
    for (int i = 0; i < size; i++) {
        int node = queue.poll();
        if (node == target) return steps;
        for (int nei : graph.get(node)) {
            if (!visited.contains(nei)) {
                visited.add(nei);
                queue.offer(nei);
            }
        }
    }
    steps++;
}
return -1;` },
    { type: 'heading', text: 'BFS — Grid (4-directional)' },
    { type: 'code', lang: 'java', caption: '0-1 matrix / island / shortest path on grid', code:
`int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
boolean[][] visited = new boolean[rows][cols];
Queue<int[]> q = new ArrayDeque<>();
q.offer(new int[]{startR, startC});
visited[startR][startC] = true;
int steps = 0;

while (!q.isEmpty()) {
    int sz = q.size();
    while (sz-- > 0) {
        int[] cur = q.poll();
        if (cur[0] == endR && cur[1] == endC) return steps;
        for (int[] d : dirs) {
            int r = cur[0] + d[0], c = cur[1] + d[1];
            if (r >= 0 && r < rows && c >= 0 && c < cols
                    && !visited[r][c] && grid[r][c] != 1) {
                visited[r][c] = true;
                q.offer(new int[]{r, c});
            }
        }
    }
    steps++;
}` },
    { type: 'heading', text: 'DFS — Recursive (Graph / Tree)' },
    { type: 'code', lang: 'java', caption: 'DFS with visited tracking', code:
`Set<Integer> visited = new HashSet<>();

void dfs(int node) {
    visited.add(node);
    // process node
    for (int nei : graph.get(node)) {
        if (!visited.contains(nei))
            dfs(nei);
    }
}` },
    { type: 'heading', text: 'DFS — Iterative (Explicit Stack)' },
    { type: 'code', lang: 'java', caption: 'Avoids stack overflow on deep graphs', code:
`Deque<Integer> stack = new ArrayDeque<>();
Set<Integer> visited = new HashSet<>();
stack.push(start);

while (!stack.isEmpty()) {
    int node = stack.pop();
    if (visited.contains(node)) continue;
    visited.add(node);
    // process node
    for (int nei : graph.get(node))
        if (!visited.contains(nei))
            stack.push(nei);
}` },
    { type: 'tip', variant: 'tip', text: 'BFS guarantees shortest path in unweighted graphs. DFS is simpler for connectivity / cycle detection. For very deep recursion (> ~10k), switch to iterative DFS.' },
  ],
};

// ─── 6. DP Patterns ──────────────────────────────────────────────────────────

const dpPatterns: Cheatsheet = {
  slug: 'dp-patterns',
  title: 'DP Patterns',
  icon: '🧮',
  description: 'Core dynamic programming patterns: 1-D, 2-D, LCS, Knapsack, memoisation, and space optimisation.',
  sections: [
    { type: 'heading', text: '1-D DP (Fibonacci-style)' },
    { type: 'code', lang: 'java', caption: 'Climbing stairs / Coin change', code:
`// dp[i] = min coins to make amount i
int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);  // fill with "infinity"
dp[0] = 0;
for (int i = 1; i <= amount; i++)
    for (int coin : coins)
        if (coin <= i)
            dp[i] = Math.min(dp[i], dp[i - coin] + 1);
return dp[amount] > amount ? -1 : dp[amount];` },
    { type: 'heading', text: '2-D DP — LCS / Edit Distance' },
    { type: 'code', lang: 'java', caption: 'Longest Common Subsequence', code:
`int m = s1.length(), n = s2.length();
int[][] dp = new int[m + 1][n + 1];
for (int i = 1; i <= m; i++)
    for (int j = 1; j <= n; j++)
        if (s1.charAt(i-1) == s2.charAt(j-1))
            dp[i][j] = dp[i-1][j-1] + 1;
        else
            dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
return dp[m][n];` },
    { type: 'heading', text: '0/1 Knapsack' },
    { type: 'code', lang: 'java', caption: 'Classic 0/1 knapsack — take or skip item', code:
`// dp[j] = max value using capacity j
int[] dp = new int[W + 1];
for (int i = 0; i < n; i++)
    for (int j = W; j >= weights[i]; j--) // iterate backwards!
        dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);
return dp[W];` },
    { type: 'heading', text: 'Top-Down Memoisation' },
    { type: 'code', lang: 'java', caption: 'Memoisation with HashMap', code:
`Map<String, Integer> memo = new HashMap<>();

int dp(int i, int j) {
    String key = i + "," + j;
    if (memo.containsKey(key)) return memo.get(key);
    // base cases
    if (i == 0 || j == 0) return 0;
    int result;
    if (s1.charAt(i-1) == s2.charAt(j-1)) result = dp(i-1, j-1) + 1;
    else result = Math.max(dp(i-1, j), dp(i, j-1));
    memo.put(key, result);
    return result;
}` },
    { type: 'heading', text: 'Space-Optimised 2-D → 1-D' },
    { type: 'code', lang: 'java', caption: 'LCS with O(n) space using two rows', code:
`int[] prev = new int[n + 1], curr = new int[n + 1];
for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++)
        curr[j] = s1.charAt(i-1) == s2.charAt(j-1)
                  ? prev[j-1] + 1
                  : Math.max(prev[j], curr[j-1]);
    int[] tmp = prev; prev = curr; curr = tmp; // swap
}
return prev[n];` },
    { type: 'tip', variant: 'key', text: 'DP recipe: (1) define dp[i] clearly, (2) write recurrence, (3) determine base cases, (4) fill order (bottom-up) or memoize (top-down), (5) optimize space last.' },
  ],
};

// ─── 7. Graph Algorithms ──────────────────────────────────────────────────────

const graphAlgorithms: Cheatsheet = {
  slug: 'graph-algorithms',
  title: 'Graph Algorithms',
  icon: '🕸️',
  description: 'Adjacency list construction, topological sort (Kahn\'s + DFS), and Dijkstra templates in Java.',
  sections: [
    { type: 'heading', text: 'Build Adjacency List' },
    { type: 'code', lang: 'java', caption: 'Directed and undirected graph setup', code:
`int n = 5;
List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < n; i++) graph.add(new ArrayList<>());

// Directed edge: u → v
graph.get(u).add(v);

// Undirected edge: u — v
graph.get(u).add(v);
graph.get(v).add(u);

// Weighted directed edge
List<List<int[]>> wgraph = new ArrayList<>();
for (int i = 0; i < n; i++) wgraph.add(new ArrayList<>());
wgraph.get(u).add(new int[]{v, weight});` },
    { type: 'heading', text: 'Topological Sort — Kahn\'s (BFS in-degree)' },
    { type: 'code', lang: 'java', caption: 'Course Schedule / Alien Dictionary', code:
`int[] inDegree = new int[n];
for (int[] edge : edges) inDegree[edge[1]]++;

Queue<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++)
    if (inDegree[i] == 0) q.offer(i);

List<Integer> order = new ArrayList<>();
while (!q.isEmpty()) {
    int node = q.poll();
    order.add(node);
    for (int nei : graph.get(node))
        if (--inDegree[nei] == 0) q.offer(nei);
}
// Cycle detected if order.size() < n
return order.size() == n ? order : Collections.emptyList();` },
    { type: 'heading', text: 'Topological Sort — DFS (post-order)' },
    { type: 'code', lang: 'java', caption: 'DFS-based topo sort with cycle detection', code:
`int[] state = new int[n]; // 0=unvisited, 1=visiting, 2=done
Deque<Integer> result = new ArrayDeque<>();

boolean dfs(int node) {
    if (state[node] == 1) return false; // back edge = cycle
    if (state[node] == 2) return true;
    state[node] = 1;
    for (int nei : graph.get(node))
        if (!dfs(nei)) return false;
    state[node] = 2;
    result.addFirst(node); // prepend for reverse post-order
    return true;
}` },
    { type: 'heading', text: 'Dijkstra\'s Shortest Path' },
    { type: 'code', lang: 'java', caption: 'Single-source shortest path (non-negative weights)', code:
`int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[src] = 0;

// {dist, node}
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
pq.offer(new int[]{0, src});

while (!pq.isEmpty()) {
    int[] cur = pq.poll();
    int d = cur[0], u = cur[1];
    if (d > dist[u]) continue;        // stale entry
    for (int[] edge : graph.get(u)) { // {neighbour, weight}
        int v = edge[0], w = edge[1];
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.offer(new int[]{dist[v], v});
        }
    }
}` },
    { type: 'tip', variant: 'warning', text: 'Dijkstra fails with negative edge weights — use Bellman-Ford instead. Kahn\'s topo sort also detects cycles (order.size() < n means cycle exists).' },
  ],
};

// ─── 8. Trie / Heap / Union-Find ──────────────────────────────────────────────

const trieHeapUF: Cheatsheet = {
  slug: 'trie-heap-unionfind',
  title: 'Trie · Heap · Union-Find',
  icon: '🌐',
  description: 'Complete implementations of Trie, heap patterns, and Union-Find (DSU) with path compression + rank.',
  sections: [
    { type: 'heading', text: 'Trie Node + Insert + Search' },
    { type: 'code', lang: 'java', caption: 'Standard Trie for lowercase letters', code:
`class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd;
}

class Trie {
    private TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.children[i] == null)
                cur.children[i] = new TrieNode();
            cur = cur.children[i];
        }
        cur.isEnd = true;
    }

    public boolean search(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.children[i] == null) return false;
            cur = cur.children[i];
        }
        return cur.isEnd;
    }

    public boolean startsWith(String prefix) {
        TrieNode cur = root;
        for (char c : prefix.toCharArray()) {
            int i = c - 'a';
            if (cur.children[i] == null) return false;
            cur = cur.children[i];
        }
        return true; // any node reached = valid prefix
    }
}` },
    { type: 'heading', text: 'Heap Patterns' },
    { type: 'code', lang: 'java', caption: 'Top-K, K closest, running median', code:
`// Top-K largest — maintain min-heap of size K
PriorityQueue<Integer> topK = new PriorityQueue<>(); // min-heap
for (int num : nums) {
    topK.offer(num);
    if (topK.size() > k) topK.poll(); // evict smallest
}
// topK now contains K largest; topK.peek() = Kth largest

// Running median — two heaps
PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
PriorityQueue<Integer> hi = new PriorityQueue<>(); // min-heap

void addNum(int num) {
    lo.offer(num);
    hi.offer(lo.poll());       // balance: push max of lo into hi
    if (lo.size() < hi.size()) lo.offer(hi.poll()); // keep lo >= hi
}
double getMedian() {
    return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
}` },
    { type: 'heading', text: 'Union-Find (DSU)' },
    { type: 'code', lang: 'java', caption: 'Path compression + union by rank', code:
`class UnionFind {
    int[] parent, rank;
    int components;

    UnionFind(int n) {
        parent = new int[n];
        rank   = new int[n];
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;       // already connected
        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }
        parent[py] = px;                  // attach smaller tree
        if (rank[px] == rank[py]) rank[px]++;
        components--;
        return true;
    }

    boolean connected(int x, int y) { return find(x) == find(y); }
}` },
    { type: 'tip', variant: 'key', text: 'Trie: use HashMap<Character, TrieNode> for large alphabets. Union-Find: call find() twice and compare roots — never compare nodes directly. Heap: offer() never blocks; use poll() not remove() in hot paths.' },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const CHEATSHEETS: Cheatsheet[] = [
  javaCollections,
  complexityRef,
  slidingWindow,
  binarySearch,
  bfsDfs,
  dpPatterns,
  graphAlgorithms,
  trieHeapUF,
];

export const CHEATSHEET_MAP = Object.fromEntries(CHEATSHEETS.map(c => [c.slug, c]));
