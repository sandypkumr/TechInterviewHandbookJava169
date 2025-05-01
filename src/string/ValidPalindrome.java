package string;

public class ValidPalindrome {
    public boolean isPalindrome(String s) {
        int left = 0;
        int right = s.length() - 1;

        while (left < right) {
            // Move left pointer to the next valid character
            while (left < right && !isValidChar(s.charAt(left))) {
                left++;
            }
            // Move right pointer to the previous valid character
            while (left < right && !isValidChar(s.charAt(right))) {
                right--;
            }
            // Compare characters
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }

        return true;
    }

    private boolean isValidChar(char c) {
        return Character.isLetterOrDigit(c);
    }
}
