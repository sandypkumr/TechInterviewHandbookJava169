package array;

import java.util.Arrays;
import java.util.Comparator;

/**
 * The "Meeting Rooms" problem is about determining if a person can attend all their meetings without overlap. Given an
 * array of intervals where each interval represents a meeting time [start, end], the goal is to check if any of these
 * intervals overlap. If there’s overlap, return False; otherwise, return True.
 *
 * For example:
 *
 * Input: [[0, 30], [5, 10], [15, 20]]
 * Output: False (since the meetings overlap).
 */
public class MeetingRooms {
    public boolean canAttendMeetings(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] < intervals[i - 1][1]) {
                return false;
            }
        }
        return true;
    }
}
