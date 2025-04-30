package stack;

import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

public class MaximumFrequencyStack {
    private Map<Integer, Integer> frequencyMap;
    private Map<Integer, Stack<Integer>> groupMap;
    private int maxFrequency;

    public MaximumFrequencyStack() {
        frequencyMap = new HashMap<>();
        groupMap = new HashMap<>();
        maxFrequency = 0;
    }

    public void push(int val) {
        int frequency = frequencyMap.getOrDefault(val, 0) + 1;
        frequencyMap.put(val, frequency);
        maxFrequency = Math.max(maxFrequency, frequency);
        groupMap.computeIfAbsent(frequency, k -> new Stack<>()).push(val);
    }

    public int pop() {
        Stack<Integer> stack = groupMap.get(maxFrequency);
        int val = stack.pop();
        if (stack.isEmpty()) {
            groupMap.remove(maxFrequency);
            maxFrequency--;
        }
        frequencyMap.put(val, frequencyMap.get(val) - 1);
        return val;
    }
}
