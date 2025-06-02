package binary_search;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class TimeBasedKeyValueStore {

    private Map<String, TreeMap<Integer, String>> map;

    public TimeBasedKeyValueStore() {
        map = new HashMap<>();
    }

    public void set(String key, String value, int timestamp) {
        map.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);
    }

    public String get(String key, int timestamp) {
        if (!map.containsKey(key)) return "";
        TreeMap<Integer, String> tree = map.get(key);
        Map.Entry<Integer, String> entry = tree.floorEntry(timestamp);
        return entry != null ? entry.getValue() : "";
    }
}
