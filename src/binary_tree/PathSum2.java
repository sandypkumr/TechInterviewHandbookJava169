package binary_tree;

import java.util.ArrayList;
import java.util.List;

public class PathSum2 {
    public List<List<Integer>> pathSum(TreeNode root, int targetSum) {
        List<List<Integer>> result = new ArrayList<>();
        findPaths(root, targetSum, new ArrayList<>(), result);
        return result;
    }

    private void findPaths(TreeNode node, int targetSum, List<Integer> currentPath,
                           List<List<Integer>> result) {
        if (node == null) {
            return;
        }
        currentPath.add(node.val);
        if (node.left == null && node.right == null && node.val == targetSum) {
            result.add(new ArrayList<>(currentPath));
        } else {
            findPaths(node.left, targetSum - node.val, currentPath, result);
            findPaths(node.right, targetSum - node.val, currentPath, result);
        }
        currentPath.removeLast();
    }
}
