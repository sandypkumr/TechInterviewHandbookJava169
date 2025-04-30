package stack;

import java.util.Stack;

public class DecodeString {
    public String decodeString(String s) {
        Stack<Integer> countStack = new Stack<>();
        Stack<StringBuilder> stringStack = new Stack<>();
        StringBuilder current = new StringBuilder();
        int k = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                k = k * 10 + (c - '0');
            } else if (c == '[') {
                countStack.push(k);
                stringStack.push(current);
                current = new StringBuilder();
                k = 0;
            } else if (c == ']') {
                StringBuilder decodedString = stringStack.pop();
                int repeatCount = countStack.pop();
                decodedString.append(String.valueOf(current).repeat(repeatCount));
                current = decodedString;
            } else {
                current.append(c);
            }
        }
        return current.toString();
    }
}
