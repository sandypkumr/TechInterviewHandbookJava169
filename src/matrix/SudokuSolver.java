package matrix;

public class SudokuSolver {
    public void solveSudoku(char[][] board) {
        int[] emptyCell = findEmptyCell(board);
        if (emptyCell == null) {
            return;
        }

        int row = emptyCell[0];
        int col = emptyCell[1];

        for (char num = '1'; num <= '9'; num++) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                solveSudoku(board);
                if (findEmptyCell(board) == null) {
                    return;
                }
                board[row][col] = '.';
            }
        }
    }

    private boolean isValid(char[][] board, int row, int col, char num) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == num || board[i][col] == num) {
                return false;
            }
        }

        int boxRowStart = (row / 3) * 3;
        int boxColStart = (col / 3) * 3;
        for (int i = boxRowStart; i < boxRowStart + 3; i++) {
            for (int j = boxColStart; j < boxColStart + 3; j++) {
                if (board[i][j] == num) {
                    return false;
                }
            }
        }
        return true;
    }

    private int[] findEmptyCell(char[][] board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    return new int[]{i, j};
                }
            }
        }
        return null;
    }
}
