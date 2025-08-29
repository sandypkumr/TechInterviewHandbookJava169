package graph;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

/**
 * You are given a chessboard with an infinite number of squares in all directions. A knight is placed on the square
 * (0, 0). The knight can move to any of the squares that are two squares away horizontally and one square vertically,
 * or two squares vertically and one square horizontally. This means that from the square (x, y), the knight can move to
 * any of the following eight squares:
 *
 * (x + 2, y + 1), (x + 2, y - 1), (x - 2, y + 1), (x - 2, y - 1),
 * (x + 1, y + 2), (x + 1, y - 2), (x - 1, y + 2), (x - 1, y - 2).
 *
 * Given two integers x and y, return the minimum number of moves required for the knight to reach the square (x, y).
 *
 * Example 1:
 * Input: x = 2, y = 1
 * Output: 1
 * Explanation: The knight can reach the target square in one move: (0, 0) -> (2, 1).
 *
 * Example 2:
 * Input: x = 5, y = 5
 * Output: 4
 * Explanation: The knight can reach the target square in four moves: (0, 0) -> (2, 1) -> (4, 2) -> (3, 4) -> (5, 5).
 */
public class MinimumKnightMoves {
    public int minKnightMoves(int x, int y) {
        x = Math.abs(x);
        y = Math.abs(y);

        int[][] directions = {{1, 2}, {2, 1}, {-1, 2}, {-2, 1}, {1, -2}, {2, -1}, {-1, -2}, {-2, -1}};

        Queue<int[]> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();

        queue.offer(new int[]{0, 0});
        visited.add("0,0");

        int steps = 0;

        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                int[] current = queue.poll();
                int currX = current[0];
                int currY = current[1];

                if (currX == x && currY == y) {
                    return steps;
                }

                for (int[] dir : directions) {
                    int newX = currX + dir[0];
                    int newY = currY + dir[1];
                    String key = newX + "," + newY;

                    if (!visited.contains(key) && newX >= -2 && newY >= -2) {
                        visited.add(key);
                        queue.offer(new int[]{newX, newY});
                    }
                }
            }
            steps++;
        }
        return -1;
    }
}
