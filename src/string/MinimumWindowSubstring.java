package string;

public class MinimumWindowSubstring {
    public String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";

        int[] tCount = new int[128];
        for (char c : t.toCharArray()) {
            tCount[c]++;
        }

        int left = 0, right = 0, minLen = Integer.MAX_VALUE, minLeft = 0;
        int required = t.length();
        int[] sCount = new int[128];

        while (right < s.length()) {
            char cRight = s.charAt(right);
            sCount[cRight]++;
            if (sCount[cRight] <= tCount[cRight]) {
                required--;
            }

            while (required == 0) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minLeft = left;
                }

                char cLeft = s.charAt(left);
                sCount[cLeft]--;
                if (sCount[cLeft] < tCount[cLeft]) {
                    required++;
                }
                left++;
            }
            right++;
        }

        return minLen == Integer.MAX_VALUE ? "" : s.substring(minLeft, minLeft + minLen);
    }
}
