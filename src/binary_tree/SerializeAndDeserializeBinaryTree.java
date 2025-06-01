package binary_tree;

public class SerializeAndDeserializeBinaryTree {
    // Encodes a tree to a single string.
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        serializeHelper(root, sb);
        return sb.toString();
    }

    private void serializeHelper(TreeNode node, StringBuilder sb) {
        if (node == null) {
            sb.append("null,");
            return;
        }
        sb.append(node.val).append(",");
        serializeHelper(node.left, sb);
        serializeHelper(node.right, sb);
    }

    // Decodes your encoded data to tree.
    public TreeNode deserialize(String data) {
        String[] nodes = data.split(",");
        return deserializeHelper(nodes, new int[]{0});
    }

    private TreeNode deserializeHelper(String[] nodes, int[] index) {
        if (index[0] >= nodes.length || nodes[index[0]].equals("null")) {
            index[0]++;
            return null;
        }
        TreeNode node = new TreeNode(Integer.parseInt(nodes[index[0]++]));
        node.left = deserializeHelper(nodes, index);
        node.right = deserializeHelper(nodes, index);
        return node;
    }
}
