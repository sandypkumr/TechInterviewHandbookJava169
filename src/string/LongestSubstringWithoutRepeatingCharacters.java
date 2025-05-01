package string;

public class LongestSubstringWithoutRepeatingCharacters {
    public int lengthOfLongestSubstring(String s) {
        int n = s.length();
        int maxLength = 0;
        int left = 0;
        int[] charIndex = new int[128]; // Assuming ASCII characters

        for (int right = 0; right < n; right++) {
            char currentChar = s.charAt(right);
            if (charIndex[currentChar] > left) {
                left = charIndex[currentChar];
            }
            charIndex[currentChar] = right + 1; // Store the next index of the character
            maxLength = Math.max(maxLength, right - left + 1);
        }

        return maxLength;
    }
}
