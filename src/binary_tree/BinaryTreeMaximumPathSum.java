package binary_tree;

public class BinaryTreeMaximumPathSum {
    private int maxSum;

    public int maxPathSum(TreeNode root) {
        maxSum = Integer.MIN_VALUE;
        findMaxPath(root);
        return maxSum;
    }

    private int findMaxPath(TreeNode node) {
        if (node == null) return 0;

        int left = Math.max(findMaxPath(node.left), 0);
        int right = Math.max(findMaxPath(node.right), 0);

        int currentMax = node.val + left + right;
        maxSum = Math.max(maxSum, currentMax);

        return node.val + Math.max(left, right);
    }
}
