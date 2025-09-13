package heap;

public class TaskScheduler {
    public int leastInterval(char[] tasks, int n) {
        int[] taskCounts = new int[26];
        for (char task : tasks) {
            taskCounts[task - 'A']++;
        }

        int maxCount = 0;
        int maxCountTasks = 0;
        for (int count : taskCounts) {
            if (count > maxCount) {
                maxCount = count;
                maxCountTasks = 1;
            } else if (count == maxCount) {
                maxCountTasks++;
            }
        }

        int partCount = maxCount - 1;
        int partLength = n - (maxCountTasks - 1);
        int emptySlots = partCount * partLength;
        int availableTasks = tasks.length - (maxCount * maxCountTasks);
        int idles = Math.max(0, emptySlots - availableTasks);

        return tasks.length + idles;
    }
}