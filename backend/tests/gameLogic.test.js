// backend/tests/gameLogic.test.js
import {
  WINNING_COMBINATIONS,
  checkWinner,
  isBoardFull,
  checkGameOver,
  isValidMove,
  getAvailableMoves,
  createEmptyBoard,
  boardToString,
  getBoardStatistics,
} from "../utils/gameLogic.js";

describe("gameLogic utility functions", () => {
  test("createEmptyBoard returns 9 nulls", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(9);
    expect(board.every((c) => c === null)).toBe(true);
  });

  // ---------------- WINNER TESTS ----------------
  test("checkWinner detects a horizontal win", () => {
    const board = ["X", "X", "X", null, null, null, null, null, null];
    const { winner, winningLine } = checkWinner(board);
    expect(winner).toBe("X");
    expect(WINNING_COMBINATIONS).toContainEqual(winningLine);
  });

  test("checkWinner detects a vertical win", () => {
    const board = ["O", null, null, "O", null, null, "O", null, null];
    const { winner, winningLine } = checkWinner(board);
    expect(winner).toBe("O");
    expect(WINNING_COMBINATIONS).toContainEqual(winningLine);
  });

  test("checkWinner detects a diagonal win", () => {
    const board = ["X", null, null, null, "X", null, null, null, "X"];
    const { winner, winningLine } = checkWinner(board);
    expect(winner).toBe("X");
    expect(WINNING_COMBINATIONS).toContainEqual(winningLine);
  });

  test("checkWinner returns null when no winner", () => {
    const board = ["X", "O", "X", null, "O", null, null, null, null];
    const { winner, winningLine } = checkWinner(board);
    expect(winner).toBeNull();
    expect(winningLine).toBeNull();
  });

  // ---------------- BOARD / GAME OVER TESTS ----------------
  test("isBoardFull true when board has no empty cells", () => {
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(isBoardFull(board)).toBe(true);
  });

  test("isBoardFull false when board has empty cells", () => {
    const board = ["X", null, "O", "X", "O", null, null, "X", null];
    expect(isBoardFull(board)).toBe(false);
  });

  test("checkGameOver detects win correctly", () => {
    const board = ["X", "X", "X", null, null, null, null, null, null];
    const state = checkGameOver(board);
    expect(state.isOver).toBe(true);
    expect(state.winner).toBe("X");
    expect(state.isDraw).toBe(false);
    expect(state.winningLine).toEqual([0, 1, 2]);
  });

  test("checkGameOver detects draw", () => {
    const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    const state = checkGameOver(board);
    expect(state.isOver).toBe(true);
    expect(state.winner).toBeNull();
    expect(state.isDraw).toBe(true);
  });

  test("checkGameOver returns in-progress when no win/draw", () => {
    const board = ["X", "O", "X", null, "O", null, null, null, null];
    const state = checkGameOver(board);
    expect(state.isOver).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.isDraw).toBe(false);
  });

  // ---------------- MOVE VALIDATION ----------------
  test("isValidMove rejects out-of-range position", () => {
    const board = createEmptyBoard();
    const result = isValidMove(board, 9);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/between 0 and 8/i);
  });

  test("isValidMove rejects occupied position", () => {
    const board = createEmptyBoard();
    board[0] = "X";
    const result = isValidMove(board, 0);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/already occupied/i);
  });

  test("isValidMove rejects when game is already over", () => {
    const board = ["X", "X", "X", null, null, null, null, null, null];
    const result = isValidMove(board, 3);
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/already over/i);
  });

  test("isValidMove accepts valid move on empty ongoing board", () => {
    const board = createEmptyBoard();
    const result = isValidMove(board, 4);
    expect(result.valid).toBe(true);
    expect(result.message).toMatch(/Valid/i);
  });

  // ---------------- AVAILABLE MOVES / STRING / STATS ----------------
  test("getAvailableMoves returns indexes of empty cells", () => {
    const board = ["X", null, "O", null, "X", null, "O", null, null];
    const moves = getAvailableMoves(board);
    expect(moves).toEqual([1, 3, 5, 7, 8]);
  });

  test("boardToString converts board to _-filled string", () => {
    const board = ["X", null, "O", null, "", "X", "O", null, null];
    const str = boardToString(board);
    // null / "" become "_"
    expect(str).toBe("X_O__XO__");
  });

  test("getBoardStatistics counts X, O, empty correctly", () => {
    const board = ["X", "O", "X", null, "", "O", null, "X", null];
    const stats = getBoardStatistics(board);
    expect(stats.xCount).toBe(3);
    expect(stats.oCount).toBe(2);
    expect(stats.emptyCount).toBe(4);
    expect(stats.moveNumber).toBe(5); // X + O moves
  });
});
