package graph;

public class LongestIncreasingPathInAMatrix {
    private static final int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    private int rows;
    private int cols;
    private int[][] dp;

    public int longestIncreasingPath(int[][] matrix) {
        rows = matrix.length;
        cols = matrix[0].length;
        dp = new int[rows][cols];
        int maxLength = 0;

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                maxLength = Math.max(maxLength, dfs(matrix, i, j));
            }
        }

        return maxLength;
    }

    private int dfs(int[][] matrix, int x, int y) {
        if (dp[x][y] != 0) {
            return dp[x][y];
        }

        int maxLength = 1;

        for (int[] dir : directions) {
            int newX = x + dir[0];
            int newY = y + dir[1];

            if (newX >= 0 && newX < rows && newY >= 0 && newY < cols && matrix[newX][newY] > matrix[x][y]) {
                maxLength = Math.max(maxLength, 1 + dfs(matrix, newX, newY));
            }
        }

        dp[x][y] = maxLength;
        return maxLength;
    }
}
