package binary_tree;

import java.util.ArrayList;
import java.util.List;

public class MaximumWidthOfBinaryTree {
    private int maxWidth = 1;
    private final List<Integer> left = new ArrayList<>();
    public int widthOfBinaryTree(TreeNode root) {
        dfs(root, 0, 1);
        return maxWidth;
    }

    private void dfs(TreeNode node, int depth, int index) {
        if (node == null) {
            return;
        }
        if (depth == left.size()) {
            left.add(index);
        } else {
            maxWidth = Math.max(maxWidth, index - left.get(depth) + 1);
        }
        dfs(node.left, depth + 1, index * 2 - 1);
        dfs(node.right, depth + 1, index * 2);
    }
}
