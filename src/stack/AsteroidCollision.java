package stack;

import java.util.Stack;

public class AsteroidCollision {
    public int[] asteroidCollision(int[] asteroids) {
        Stack<Integer> stack = new Stack<>();
        for(int a : asteroids) {
            boolean destroyed = false;
            while(!stack.isEmpty() && a < 0 && stack.peek() > 0) {
                if(-a > stack.peek()) {
                    stack.pop();
                    continue;
                }
                if (-a == stack.peek()) {
                    stack.pop();
                }
                destroyed = true;
                break;
            }
            if(!destroyed) {
                stack.push(a);
            }
        }
        int[] result = new int[stack.size()];
        for(int i = stack.size() - 1; i >= 0; i--) {
            result[i] = stack.pop();
        }
        return result;
    }
}
