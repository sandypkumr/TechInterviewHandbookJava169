package binary_tree;

public class ConstructBinaryTreeFromPreorderAndInOrderTraversal {
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        return buildTree(preorder, 0, preorder.length - 1,
                inorder, 0, inorder.length - 1);
    }

    private TreeNode buildTree(int[] preorder, int preStart, int preEnd,
                               int[] inorder, int inStart, int inEnd) {
        if (preStart > preEnd || inStart > inEnd) {
            return null;
        }
        TreeNode root = new TreeNode(preorder[preStart]);
        int rootIndex = findRootIndex(inorder, inStart, inEnd, root.val);
        int leftTreeSize = rootIndex - inStart;
        root.left = buildTree(preorder, preStart + 1, preStart + leftTreeSize,
                inorder, inStart, rootIndex - 1);
        root.right = buildTree(preorder, preStart + leftTreeSize + 1, preEnd,
                inorder, rootIndex + 1, inEnd);
        return root;
    }

    private int findRootIndex(int[] inorder, int start, int end, int value) {
        for (int i = start; i <= end; i++) {
            if (inorder[i] == value) {
                return i;
            }
        }
        return -1;
    }
}
