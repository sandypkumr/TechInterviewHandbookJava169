package graph;

import java.util.*;

public class AccountsMerge {
    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        Map<String, String> emailToName = new HashMap<>();
        Map<String, String> parent = new HashMap<>();

        for (List<String> account : accounts) {
            String name = account.getFirst();

            for (int i = 1; i < account.size(); i++) {
                String email = account.get(i);
                emailToName.put(email, name);
                parent.put(email, email);
            }
        }

        for (List<String> account : accounts) {
            String firstEmail = account.get(1);
            for (int i = 2; i < account.size(); i++) {
                union(parent, firstEmail, account.get(i));
            }
        }

        Map<String, TreeSet<String>> unions = new HashMap<>();
        for (String email : parent.keySet()) {
            String root = find(parent, email);
            unions.computeIfAbsent(root, x -> new TreeSet<>()).add(email);
        }

        List<List<String>> result = new ArrayList<>();
        for (String root :unions.keySet()) {
            List<String> merged = new ArrayList<>();
            merged.add(emailToName.get(root)); // Add the name
            merged.addAll(unions.get(root)); // Add the sorted emails
            result.add(merged);
        }

        return result;
    }

    private void union(Map<String, String> parent, String e1, String e2) {
        String p1 = find(parent, e1);
        String p2 = find(parent, e2);
        if (!p1.equals(p2)) {
            parent.put(p1, p2);
        }
    }

    private String find(Map<String, String> parent, String email) {
        if (!parent.get(email).equals(email)) {
            parent.put(email, find(parent, parent.get(email)));
        }
        return parent.get(email);
    }
}
