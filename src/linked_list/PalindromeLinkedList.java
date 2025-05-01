package linked_list;

public class PalindromeLinkedList {
    public boolean isPalindrome(ListNode head) {
        // Step 1: Find the middle of the linked list
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        // Step 2: Reverse the second half of the linked list
        ListNode prev = null;
        ListNode current = slow;

        while (current != null) {
            ListNode nextTemp = current.next; // Store next node
            current.next = prev; // Reverse the link
            prev = current; // Move prev to current
            current = nextTemp; // Move to the next node
        }

        // Step 3: Compare the first half and the reversed second half
        ListNode left = head;
        ListNode right = prev; // Start of the reversed second half

        while (right != null) {
            if (left.val != right.val) {
                return false; // Not a palindrome
            }
            left = left.next;
            right = right.next;
        }

        return true; // Is a palindrome
    }
}
