package binary_search;

public class FirstBadVersion {
    public int firstBadVersion(int n) {
        int left = 1;
        int right = n;

        while (left < right) {
            int mid = left + (right - left) / 2;

            if (isBadVersion(mid)) {
                right = mid; // Search in the left half
            } else {
                left = mid + 1; // Search in the right half
            }
        }

        return left; // The first bad version
    }

    // This is a placeholder for the actual implementation of isBadVersion.
    private boolean isBadVersion(int version) {
        // Assume this method is implemented to check if a version is bad.
        return false; // Replace with actual logic.
    }
}
