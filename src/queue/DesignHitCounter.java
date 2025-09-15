package queue;

/**
 * Design a hit counter which counts the number of hits received in the past 5 minutes.
 *
 * Each function accepts a timestamp parameter (in seconds granularity) and you may assume that calls are being made to
 * the system in chronological order (i.e., timestamp is monotonically increasing). You may assume that the earliest
 * timestamp starts at 1.
 *
 * It is possible that several hits arrive roughly at the same time.
 *
 * Implement the HitCounter class:
 *
 * HitCounter() Initializes the object of the hit counter system.
 *
 * void hit(int timestamp) Records a hit that happened at the given timestamp.
 *
 * int getHits(int timestamp) Returns the number of hits in the past 5 minutes from the given timestamp.
 *
 * Example 1:
 *
 * Input
 * ["HitCounter", "hit", "hit", "hit", "getHits", "hit", "getHits"]
 * [[], [1], [2], [3], [4], [300], [300]]
 * Output
 * [null, null, null, null, 3, null, 4]
 */
public class DesignHitCounter {
    private final int[] times;
    private final int[] hits;

    public DesignHitCounter() {
        times = new int[300];
        hits = new int[300];
    }

    public void hit(int timestamp) {
        int index = timestamp % 300;
        if (times[index] != timestamp) {
            times[index] = timestamp;
            hits[index] = 1;
        } else {
            hits[index]++;
        }
    }

    public int getHits(int timestamp) {
        int totalHits = 0;
        for (int i = 0; i < 300; i++) {
            if (timestamp - times[i] < 300) {
                totalHits += hits[i];
            }
        }
        return totalHits;
    }
}
