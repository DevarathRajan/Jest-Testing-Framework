import axios from "axios";

let API_URL = "http://localhost:5000/api";

// Safe access to import.meta.env (works in Vite but not visible to Jest parser)
try {
  const meta = eval("import.meta");
  if (meta && meta.env && meta.env.VITE_API_URL) {
    API_URL = meta.env.VITE_API_URL;
  }
} catch (_) {
  // Jest or Node environment → ignore
  if (process.env.VITE_API_URL) {
    API_URL = process.env.VITE_API_URL;
  }
}
// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error("Response error:", error);

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || "Server error occurred";
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Error setting up request
      throw new Error(error.message || "An error occurred");
    }
  }
);

/**
 * Create a new game
 * @param {string} playerSymbol - 'X' or 'O'
 * @returns {Promise<Object>} Game object
 */
export const createNewGame = async (playerSymbol = "X") => {
  try {
    const response = await api.post("/game/new", { playerSymbol });
    return response;
  } catch (error) {
    console.error("Error creating new game:", error);
    throw error;
  }
};

/**
 * Make a player move
 * @param {string} gameId - Game ID
 * @param {number} position - Position on board (0-8)
 * @param {string} player - 'X' or 'O'
 * @returns {Promise<Object>} Updated game object
 */
export const makePlayerMove = async (gameId, position, player) => {
  try {
    const response = await api.post("/game/move", {
      gameId,
      position,
      player,
    });
    return response;
  } catch (error) {
    console.error("Error making player move:", error);
    throw error;
  }
};

/**
 * Request AI move
 * @param {Array} board - Current board state
 * @param {string} aiSymbol - AI's symbol ('X' or 'O')
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {string} gameId - Optional game ID
 * @returns {Promise<Object>} AI move response
 */
export const getAIMove = async (
  board,
  aiSymbol,
  difficulty = "medium",
  gameId = null
) => {
  try {
    const response = await api.post("/game/ai-move", {
      board,
      aiSymbol,
      difficulty,
      gameId,
    });
    return response;
  } catch (error) {
    console.error("Error getting AI move:", error);
    throw error;
  }
};

/**
 * Get current game state
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} Game object
 */
export const getGameState = async (gameId) => {
  try {
    const response = await api.get(`/game/${gameId}`);
    return response;
  } catch (error) {
    console.error("Error getting game state:", error);
    throw error;
  }
};

/**
 * Validate a move
 * @param {Array} board - Current board state
 * @param {number} position - Position to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateMove = async (board, position) => {
  try {
    const response = await api.post("/game/validate", {
      board,
      position,
    });
    return response;
  } catch (error) {
    console.error("Error validating move:", error);
    throw error;
  }
};

/**
 * Reset game
 * @param {string} gameId - Game ID
 * @returns {Promise<Object>} Reset game object
 */
export const resetGame = async (gameId) => {
  try {
    const response = await api.post(`/game/reset/${gameId}`);
    return response;
  } catch (error) {
    console.error("Error resetting game:", error);
    throw error;
  }
};

export default api;
