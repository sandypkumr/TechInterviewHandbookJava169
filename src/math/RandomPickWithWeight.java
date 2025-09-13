package math;

import java.util.Random;

public class RandomPickWithWeight {
    private int[] prefix;
    private int total;
    private Random rand;

    public RandomPickWithWeight(int[] w) {
        prefix = new int[w.length];
        rand = new Random();

        prefix[0] = w[0];
        for (int i = 1; i < w.length; i++) {
            prefix[i] = prefix[i - 1] + w[i];
        }
        total = prefix[w.length - 1];
    }

    public int pickIndex() {
        int target = rand.nextInt(total) + 1;

        int left = 0, right = prefix.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (target <= prefix[mid]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }
}
