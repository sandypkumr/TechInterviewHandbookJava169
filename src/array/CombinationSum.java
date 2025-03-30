package array;

import java.util.ArrayList;
import java.util.List;

public class CombinationSum {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(result, new ArrayList<>(), candidates, target, 0);
        return result;
    }

    private void backtrack(List<List<Integer>> result, ArrayList<Integer> curList, int[] candidates, int target, int index) {
        if (target == 0) {
            result.add(new ArrayList<>(curList));
            return;
        }
        if (target < 0) {
            return;
        }
        for (int i = index; i < candidates.length; i++) {
            curList.add(candidates[i]);
            backtrack(result, curList, candidates, target - candidates[i], i); // Not i + 1 because we can reuse the same elements
            curList.removeLast();
        }
    }
}
