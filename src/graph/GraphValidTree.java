package graph;

/**
 * You are given a graph represented as an integer n (the number of nodes, labeled from 0 to n-1) and a list of edges
 * where each edge is a pair of nodes [u, v] that connects two nodes in the graph.
 *
 * Write a function to determine if the graph is a valid tree.
 *
 * A valid tree must satisfy the following conditions:
 *
 * It is connected (there is a path between any two nodes).
 * It contains no cycles.
 *
 * Example 1:
 * Input: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]
 * Output: true
 *
 * Example 2:
 * Input: n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]
 * Output: false
 */
public class GraphValidTree {
    public boolean validTree(int n, int[][] edges) {
        if (edges.length != n - 1) {
            return false;
        }

        int[] parent = new int[n];
        int[] rank = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            rank[i] = 1;
        }

        for (int[] edge : edges) {
            if (!union(edge[0], edge[1], parent, rank)) {
                return false;
            }
        }

        return true;
    }

    private int find(int node, int[] parent) {
        if (parent[node] != node) {
            parent[node] = find(parent[node], parent);
        }
        return parent[node];
    }

    private boolean union(int u, int v, int[] parent, int[] rank) {
        int rootU = find(u, parent);
        int rootV = find(v, parent);

        if (rootU == rootV) {
            return false;
        }

        if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
        } else if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
        }

        return true;
    }
}
