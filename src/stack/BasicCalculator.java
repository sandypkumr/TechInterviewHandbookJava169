package stack;

import java.util.Stack;

public class BasicCalculator {
    public int calculate(String s) {
        Stack<Integer> stack = new Stack<>();
        int sign = 1;
        int result = 0;
        int num = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) {
                num = num * 10 + (c - '0');
            } else if (c == '+') {
                result += sign * num;
                sign = 1;
                num = 0;
            } else if (c == '-') {
                result += sign * num;
                sign = -1;
                num = 0;
            } else if (c == '(') {
                stack.push(result);
                stack.push(sign);
                result = 0;
                sign = 1;
            } else if (c == ')') {
                result += sign * num;
                result *= stack.pop();
                result += stack.pop();
                num = 0;
            }
        }

        result += sign * num; // Add the last number
        return result;
    }
}
