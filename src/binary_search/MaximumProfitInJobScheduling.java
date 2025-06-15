package binary_search;

import java.util.Arrays;
import java.util.Comparator;

public class MaximumProfitInJobScheduling {
    static class Job {
        int start, end, profit;
        Job(int s, int e, int p) {
            start = s;
            end = e;
            profit = p;
        }
    }

    public int jobScheduling(int[] startTime, int[] endTime, int[] profit) {
        int n = startTime.length;
        Job[] jobs = new Job[n];
        for (int i = 0; i < n; i++) {
            jobs[i] = new Job(startTime[i], endTime[i], profit[i]);
        }

        Arrays.sort(jobs, Comparator.comparingInt(j -> j.end));

        int[] dp = new int[n];
        dp[0] = jobs[0].profit;

        for (int i = 1; i < n; i++) {
            int include = jobs[i].profit;
            int lastNonConflict = binarySearch(jobs, i);
            if (lastNonConflict != -1) {
                include += dp[lastNonConflict];
            }

            dp[i] = Math.max(dp[i - 1], include);
        }
        return dp[n - 1];
    }

    private int binarySearch(Job[] jobs, int index) {
        int low = 0, high = index - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (jobs[mid].end <= jobs[index].start) {
                if (jobs[mid + 1].end <= jobs[index].start) {
                    low = mid + 1; // Search in the right half
                } else {
                    return mid; // Found the last non-conflicting job
                }
            } else {
                high = mid - 1; // Search in the left half
            }
        }
        return -1; // No non-conflicting job found
    }
}
