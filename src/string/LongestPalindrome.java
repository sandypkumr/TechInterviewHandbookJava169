package string;

public class LongestPalindrome {
    public int longestPalindrome(String s) {
        int[] charCount = new int[128]; // Assuming ASCII characters
        for (char c : s.toCharArray()) {
            charCount[c]++;
        }

        int length = 0;
        boolean hasOddCount = false;

        for (int count : charCount) {
            if (count % 2 == 0) {
                length += count; // Add even counts directly
            } else {
                length += count - 1; // Add the largest even number less than the odd count
                hasOddCount = true; // Mark that we have at least one odd count
            }
        }

        // If there's at least one odd count, we can place one odd character in the middle
        return length + (hasOddCount ? 1 : 0);
    }
}
