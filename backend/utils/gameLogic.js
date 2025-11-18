/**
 * Tic-Tac-Toe Game Logic Utilities
 */

// Winning combinations (index positions in the board array)
export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

/**
 * Check if there's a winner
 * @param {Array} board - Current board state
 * @returns {Object} - { winner: 'X' | 'O' | null, winningLine: Array | null }
 */
export const checkWinner = (board) => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningLine: combination,
      };
    }
  }

  return { winner: null, winningLine: null };
};

/**
 * Check if the board is full (draw condition)
 * @param {Array} board - Current board state
 * @returns {Boolean}
 */
export const isBoardFull = (board) => {
  return board.every((cell) => cell !== null && cell !== "");
};

/**
 * Check if the game is over
 * @param {Array} board - Current board state
 * @returns {Object} - { isOver: Boolean, winner: String | null, isDraw: Boolean }
 */
export const checkGameOver = (board) => {
  const { winner, winningLine } = checkWinner(board);

  if (winner) {
    return {
      isOver: true,
      winner,
      winningLine,
      isDraw: false,
    };
  }

  if (isBoardFull(board)) {
    return {
      isOver: true,
      winner: null,
      winningLine: null,
      isDraw: true,
    };
  }

  return {
    isOver: false,
    winner: null,
    winningLine: null,
    isDraw: false,
  };
};

/**
 * Validate if a move is legal
 * @param {Array} board - Current board state
 * @param {Number} position - Position to place the move (0-8)
 * @returns {Object} - { valid: Boolean, message: String }
 */
export const isValidMove = (board, position) => {
  // Check if position is within bounds
  if (position < 0 || position > 8) {
    return {
      valid: false,
      message: "Position must be between 0 and 8",
    };
  }

  // Check if position is already occupied
  if (board[position] !== null && board[position] !== "") {
    return {
      valid: false,
      message: "Position is already occupied",
    };
  }

  // Check if game is already over
  const gameState = checkGameOver(board);
  if (gameState.isOver) {
    return {
      valid: false,
      message: "Game is already over",
    };
  }

  return {
    valid: true,
    message: "Valid move",
  };
};

/**
 * Get available moves (empty positions)
 * @param {Array} board - Current board state
 * @returns {Array} - Array of available positions
 */
export const getAvailableMoves = (board) => {
  return board
    .map((cell, index) => (cell === null || cell === "" ? index : null))
    .filter((index) => index !== null);
};

/**
 * Create a new empty board
 * @returns {Array} - Empty board array
 */
export const createEmptyBoard = () => {
  return Array(9).fill(null);
};

/**
 * Convert board to string representation for AI agent
 * @param {Array} board - Current board state
 * @returns {String} - String representation of board
 */
export const boardToString = (board) => {
  return board.map((cell) => cell || "_").join("");
};

/**
 * Calculate board statistics (for AI training data)
 * @param {Array} board - Current board state
 * @returns {Object} - Board statistics
 */
export const getBoardStatistics = (board) => {
  const xCount = board.filter((cell) => cell === "X").length;
  const oCount = board.filter((cell) => cell === "O").length;
  const emptyCount = board.filter(
    (cell) => cell === null || cell === ""
  ).length;

  return {
    xCount,
    oCount,
    emptyCount,
    moveNumber: xCount + oCount,
  };
};
