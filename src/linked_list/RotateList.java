package linked_list;

public class RotateList {
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null || head.next == null || k == 0) {
            return head;
        }

        // Step 1: Find the length of the list
        ListNode current = head;
        int length = 1;
        while (current.next != null) {
            current = current.next;
            length++;
        }

        // Step 2: Connect the last node to the head to make it circular
        current.next = head;

        // Step 3: Find the new tail and new head
        k = k % length; // In case k is greater than length
        int stepsToNewHead = length - k;
        ListNode newTail = head;
        for (int i = 1; i < stepsToNewHead; i++) {
            newTail = newTail.next;
        }
        ListNode newHead = newTail.next;

        // Step 4: Break the circular link
        newTail.next = null;

        return newHead;
    }
}
