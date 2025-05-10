package string;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FindAllAnagramsInAString {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        int sLength = s.length();
        int pLength = p.length();

        if (sLength < pLength) {
            return result;
        }

        int[] pCount = new int[26];
        int[] sCount = new int[26];

        for (int i = 0; i < pLength; i++) {
            pCount[p.charAt(i) - 'a']++;
            sCount[s.charAt(i) - 'a']++;
        }

        if (Arrays.equals(pCount, sCount)) {
            result.add(0);
        }

        for (int i = pLength; i < sLength; i++) {
            sCount[s.charAt(i) - 'a']++;
            sCount[s.charAt(i - pLength) - 'a']--;

            if (Arrays.equals(pCount, sCount)) {
                result.add(i - pLength + 1);
            }
        }

        return result;
    }
}
