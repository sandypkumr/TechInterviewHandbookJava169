package trie;

import java.util.*;

/**
 * You need to design an in-memory file system that supports the following operations:
 *
 * - ls: Given a path in string format. If it is a file path, return a list that only contains this file's name. If it is
 * a directory path, return the list of file and directory names in this directory. Your output (file and directory names
 * together) should in lexicographic order.
 *
 * - mkdir: Given a directory path that does not exist, you should make a new directory according to the path. If the middle
 * directories in the path don't exist either, you should create them as well. This function has void return type.
 *
 * - addContentToFile: Given a file path and file content in string format. If the file doesn't exist, you need to create
 * that file containing given content. If the file already exists, you need to append the given content to original content.
 * This function has void return type.
 *
 * - readContentFromFile: Given a file path, return its content in string format.
 *
 * Example 1:
 *
 * Input
 * ["FileSystem", "ls", "mkdir", "addContentToFile", "ls", "readContentFromFile"]
 * [[], ["/"], ["/a/b/c"], ["/a/b/c/d", "hello"], ["/"], ["/a/b/c/d"]]
 * Output
 * [null, [], null, null, ["a"], "hello"]
 */
public class DesignInMemoryFileSystem {
    class Node {
        boolean isFile;
        String content;
        Map<String, Node> children;

        public Node() {
            this.isFile = false;
            this.content = "";
            this.children = new HashMap<>();
        }
    }

    private final Node root;

    public DesignInMemoryFileSystem() {
        root = new Node();
    }

    public List<String> ls(String path) {
        Node node = root;
        List<String> result = new ArrayList<>();
        if (!path.equals("/")) {
            String[] parts = path.split("/");
            for (int i = 1; i < parts.length; i++) {
                node = node.children.get(parts[i]);
            }
            if (node.isFile) {
                result.add(parts[parts.length - 1]);
                return result;
            }
        }
        result.addAll(node.children.keySet());
        Collections.sort(result);
        return result;
    }

    public void mkdir(String path) {
        Node node = root;
        String[] parts = path.split("/");
        for (int i = 1; i < parts.length; i++) {
            node.children.putIfAbsent(parts[i], new Node());
            node = node.children.get(parts[i]);
        }
    }

    public void addContentToFile(String filePath, String content) {
        Node node = root;
        String[] parts = filePath.split("/");
        for (int i = 1; i < parts.length - 1; i++) {
            node.children.putIfAbsent(parts[i], new Node());
            node = node.children.get(parts[i]);
        }
        node.children.putIfAbsent(parts[parts.length - 1], new Node());
        node = node.children.get(parts[parts.length - 1]);
        node.isFile = true;
        node.content += content;
    }

    public String readContentFromFile(String filePath) {
        Node node = root;
        String[] parts = filePath.split("/");
        for (int i = 1; i < parts.length; i++) {
            node = node.children.get(parts[i]);
        }
        return node.content;
    }
}
