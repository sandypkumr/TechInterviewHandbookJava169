package array;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * We are given a list of employees, where each employee has a list of non-overlapping intervals representing their
 * working hours. These intervals are sorted by start time. We need to find the common free time intervals across all
 * employees.
 * <p>
 * The free time intervals are the time periods when all employees are not working.
 * <p>
 * Example:
 *     Input: [[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]
 *     Output: [[4, 6], [7, 9]]
 * <p>
 *     Explanation:
 *     The common free time intervals are [4, 6] and [7, 9].
 */
public class EmployeeFreeTime {
    public List<Interval> employeeFreeTime(List<List<Interval>> schedule) {
        // Step 1: Flatten the schedule into a single list of intervals
        List<Interval> allIntervals = new ArrayList<>();
        for (List<Interval> employeeSchedule : schedule) {
            allIntervals.addAll(employeeSchedule);
        }

        // Step 2: Sort the intervals based on their start times
        allIntervals.sort(Comparator.comparingInt(a -> a.start));

        // Step 3: Find free time intervals
        List<Interval> freeTime = new ArrayList<>();
        int end = allIntervals.getFirst().end;

        for (int i = 1; i < allIntervals.size(); i++) {
            Interval current = allIntervals.get(i);
            if (current.start > end) {
                freeTime.add(new Interval(end, current.start));
            }
            end = Math.max(end, current.end);
        }

        return freeTime;
    }
}
