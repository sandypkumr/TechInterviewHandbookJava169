package array;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MeetingRooms2 {
    public int minMeetingRooms(List<Interval> intervals) {
        if (intervals == null || intervals.isEmpty()) {
            return 0;
        }

        List<Integer> startTimes = new ArrayList<>();
        List<Integer> endTimes = new ArrayList<>();

        for (Interval interval : intervals) {
            startTimes.add(interval.start);
            endTimes.add(interval.end);
        }

        Collections.sort(startTimes);
        Collections.sort(endTimes);

        int startPointer = 0;
        int endPointer = 0;
        int roomCount = 0;
        int maxRooms = 0;

        while (startPointer < intervals.size()) {
            if (startTimes.get(startPointer) < endTimes.get(endPointer)) {
                roomCount++;
                startPointer++;
            } else {
                roomCount--;
                endPointer++;
            }
            maxRooms = Math.max(maxRooms, roomCount);
        }

        return maxRooms;
    }
}