package binary_tree;

import java.util.HashMap;
import java.util.Map;

public class PathSum3 {
    public int pathSum(TreeNode root, int targetSum) {
        Map<Long, Integer> prefixSumMap = new HashMap<>();
        prefixSumMap.put(0L, 1);
        return dfs(root, 0L, targetSum, prefixSumMap);
    }

    private int dfs(TreeNode node, long curSum, int targetSum, Map<Long, Integer> prefixSumMap) {
        if (node == null) {
            return 0;
        }

        curSum += node.val;
        int count = prefixSumMap.getOrDefault(curSum - targetSum, 0);

        prefixSumMap.put(curSum, prefixSumMap.getOrDefault(curSum, 0) + 1);

        count += dfs(node.left, curSum, targetSum, prefixSumMap);
        count += dfs(node.right, curSum, targetSum, prefixSumMap);

        prefixSumMap.put(curSum, prefixSumMap.get(curSum) - 1);

        return count;
    }
}
