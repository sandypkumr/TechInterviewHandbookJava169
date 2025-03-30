package array;

import java.util.HashMap;

public class ContiguousArray {
    public int findMaxLength(int[] nums) {
        int maxLength = 0;
        int count = 0;
        HashMap<Integer, Integer> map = new HashMap<>();
        map.put(0, -1); // Handle the case when the entire array is valid

        for (int i = 0; i < nums.length; i++) {
            count += (nums[i] == 1) ? 1 : -1; // Increment for 1, decrement for 0

            if (map.containsKey(count)) {
                maxLength = Math.max(maxLength, i - map.get(count));
            } else {
                map.put(count, i);
            }
        }

        return maxLength;
    }
}
