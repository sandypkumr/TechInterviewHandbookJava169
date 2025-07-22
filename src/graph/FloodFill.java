package graph;

public class FloodFill {
    public int[][] floodFill(int[][] image, int sr, int sc, int newColor) {
        int originalColor = image[sr][sc];
        if (originalColor == newColor) {
            return image;
        }
        fill(image, sr, sc, originalColor, newColor);
        return image;
    }

    private void fill(int[][] image, int r, int c, int originalColor, int newColor) {
        if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] != originalColor) {
            return;
        }
        image[r][c] = newColor; // Change the color
        // Recursively fill in all four directions
        fill(image, r + 1, c, originalColor, newColor); // Down
        fill(image, r - 1, c, originalColor, newColor); // Up
        fill(image, r, c + 1, originalColor, newColor); // Right
        fill(image, r, c - 1, originalColor, newColor); // Left
    }
}
