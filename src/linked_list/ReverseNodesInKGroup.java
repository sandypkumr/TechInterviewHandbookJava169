package linked_list;

public class ReverseNodesInKGroup {
    public ListNode reverseKGroup(ListNode head, int k) {
        if (head == null || k <= 1) {
            return head;
        }

        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode prevGroupEnd = dummy;

        while (true) {
            ListNode groupStart = prevGroupEnd.next;
            ListNode groupEnd = prevGroupEnd;

            // Check if there are k nodes in the current group
            for (int i = 0; i < k && groupEnd != null; i++) {
                groupEnd = groupEnd.next;
            }
            if (groupEnd == null) {
                break; // Not enough nodes to reverse
            }

            // Reverse the current group
            ListNode prev = null;
            ListNode curr = groupStart;
            for (int i = 0; i < k; i++) {
                ListNode nextTemp = curr.next;
                curr.next = prev;
                prev = curr;
                curr = nextTemp;
            }

            // Connect the reversed group with the previous part
            prevGroupEnd.next = prev;
            groupStart.next = curr;

            // Move to the next group
            prevGroupEnd = groupStart;
        }

        return dummy.next;
    }
}
