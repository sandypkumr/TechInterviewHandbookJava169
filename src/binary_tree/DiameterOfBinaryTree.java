package binary_tree;

public class DiameterOfBinaryTree {
    public int diameterOfBinaryTree(TreeNode root) {
        int[] diameter = new int[1]; // Use an array to store the diameter
        calculateHeight(root, diameter);
        return diameter[0];
    }

    private int calculateHeight(TreeNode node, int[] diameter) {
        if (node == null) {
            return 0;
        }

        int leftHeight = calculateHeight(node.left, diameter);
        int rightHeight = calculateHeight(node.right, diameter);

        // Update the diameter if the path through the current node is larger
        diameter[0] = Math.max(diameter[0], leftHeight + rightHeight);

        // Return the height of the current node
        return Math.max(leftHeight, rightHeight) + 1;
    }
}
