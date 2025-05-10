package string;

import java.util.ArrayList;
import java.util.List;

/**
 * Design an algorithm to encode a list of strings to a string.
 * The encoded string is then sent over the network and is
 * decoded back to the original list of strings.
 *
 * Please implement encode and decode
 *
 * Example:
 *     Input: ["Hello", "World", "this is a test"]
 *     codec = Solution()
 *     encoded_string = codec.encode(["Hello", "World", "this is a test"])
 *     print(encoded_string)
 *     Output: "5#Hello5#World14#this is a test"
 *     decoded_string = codec.decode(encoded_string)
 *     print(decoded_string)
 *     Output: ["Hello", "World", "this is a test"]
 */
public class EncodeAndDecodeStrings {
    // Encodes a list of strings to a single string.
    public String encode(String[] strs) {
        StringBuilder sb = new StringBuilder();
        for (String str : strs) {
            sb.append(str.length()).append('#').append(str);
        }
        return sb.toString();
    }

    // Decodes a single string to a list of strings.
    public List<String> decode(String s) {
        int i = 0;
        List<String> result = new ArrayList<>();
        while (i < s.length()) {
            int j = s.indexOf('#', i);
            int length = Integer.parseInt(s.substring(i, j));
            result.add(s.substring(j + 1, j + 1 + length));
            i = j + 1 + length;
        }
        return result;
    }
}
