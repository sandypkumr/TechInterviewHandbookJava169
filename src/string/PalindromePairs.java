package string;

import java.util.*;

public class PalindromePairs {
    public List<List<Integer>> palindromePairs(String[] words) {
        List<List<Integer>> result = new ArrayList<>();
        Map<String, Integer> wordToIndex = new HashMap<>();

        for (int i = 0; i < words.length; i++) {
            wordToIndex.put(words[i], i);
        }

        for (int i = 0; i < words.length; i++) {
            String word = words[i];

            for (int j = 0; j <= word.length(); j++) {
                String prefix = word.substring(0, j);
                String suffix = word.substring(j);

                if (isPalindrome(prefix)) {
                    String reversedSuffix = new StringBuilder(suffix).reverse().toString();
                    Integer foundIdx = wordToIndex.get(reversedSuffix);
                    if (foundIdx != null && foundIdx != i) {
                        result.add(Arrays.asList(foundIdx, i));
                    }
                }

                if (j != word.length() && isPalindrome(suffix)) {
                    String reversedPrefix = new StringBuilder(prefix).reverse().toString();
                    Integer foundIdx = wordToIndex.get(reversedPrefix);
                    if (foundIdx != null && foundIdx != i) {
                        result.add(Arrays.asList(i, foundIdx));
                    }
                }
            }
        }

        return result;
    }

    private boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left++) != s.charAt(right--)) {
                return false;
            }
        }
        return true;
    }
}
