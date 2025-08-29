package graph;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Set;

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
