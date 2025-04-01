package stack;

public class BackspaceStringCompare {
    public boolean backspaceCompare(String s, String t) {
        return buildString(s).equals(buildString(t));
    }

    private String buildString(String str) {
        StringBuilder sb = new StringBuilder();
        int skip = 0;

        for (int i = str.length() - 1; i >= 0; i--) {
            char c = str.charAt(i);
            if (c == '#') {
                skip++;
            } else if (skip > 0) {
                skip--;
            } else {
                sb.append(c);
            }
        }

        return sb.toString();
    }
}
