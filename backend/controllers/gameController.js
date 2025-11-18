import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  createEmptyBoard,
  checkGameOver,
  isValidMove,
  getAvailableMoves,
  boardToString,
  getBoardStatistics,
} from "../utils/gameLogic.js";

// In-memory game storage (in production, use a database)
const games = new Map();

/**
 * Create a new game
 * POST /api/game/new
 */
export const createNewGame = (req, res) => {
  try {
    const { playerSymbol = "X" } = req.body;

    // Validate player symbol
    if (playerSymbol !== "X" && playerSymbol !== "O") {
      return res.status(400).json({
        error: "Invalid player symbol. Must be X or O",
      });
    }

    const gameId = uuidv4();
    const board = createEmptyBoard();
    const aiSymbol = playerSymbol === "X" ? "O" : "X";

    const game = {
      gameId,
      board,
      playerSymbol,
      aiSymbol,
      currentPlayer: "X", // X always starts
      winner: null,
      isOver: false,
      isDraw: false,
      winningLine: null,
      moveHistory: [],
      createdAt: new Date().toISOString(),
    };

    games.set(gameId, game);

    res.status(201).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error creating new game:", error);
    res.status(500).json({
      error: "Failed to create new game",
    });
  }
};

/**
 * Make a player move
 * POST /api/game/move
 */
export const makeMove = (req, res) => {
  try {
    const { gameId, position, player } = req.body;

    // Validate input
    if (!gameId || position === undefined || !player) {
      return res.status(400).json({
        error: "Missing required fields: gameId, position, player",
      });
    }

    // Get game
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({
        error: "Game not found",
      });
    }

    // Check if it's the player's turn
    if (game.currentPlayer !== player) {
      return res.status(400).json({
        error: `Not your turn. Current player is ${game.currentPlayer}`,
      });
    }

    // Validate move
    const validation = isValidMove(game.board, position);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.message,
      });
    }

    // Make the move
    game.board[position] = player;
    game.moveHistory.push({
      player,
      position,
      timestamp: new Date().toISOString(),
    });

    // Check game state
    const gameState = checkGameOver(game.board);
    game.isOver = gameState.isOver;
    game.winner = gameState.winner;
    game.isDraw = gameState.isDraw;
    game.winningLine = gameState.winningLine;

    // Switch player if game is not over
    if (!game.isOver) {
      game.currentPlayer = player === "X" ? "O" : "X";
    }

    // Update game in storage
    games.set(gameId, game);

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error making move:", error);
    res.status(500).json({
      error: "Failed to make move",
    });
  }
};

/**
 * Request AI move
 * POST /api/game/ai-move
 * This endpoint prepares the data and calls the AI agent API
 */
export const requestAIMove = async (req, res) => {
  try {
    const { board, aiSymbol, difficulty = "medium", gameId } = req.body;

    // Validate input
    if (!board || !aiSymbol) {
      return res.status(400).json({
        error: "Missing required fields: board, aiSymbol",
      });
    }

    // Validate board
    if (!Array.isArray(board) || board.length !== 9) {
      return res.status(400).json({
        error: "Invalid board format. Must be an array of 9 elements",
      });
    }

    // Get available moves
    const availableMoves = getAvailableMoves(board);

    if (availableMoves.length === 0) {
      return res.status(400).json({
        error: "No available moves on the board",
      });
    }

    // Prepare data for AI agent
    const aiRequestData = {
      board: boardToString(board),
      boardArray: board,
      availableMoves,
      aiSymbol,
      playerSymbol: aiSymbol === "X" ? "O" : "X",
      difficulty,
      statistics: getBoardStatistics(board),
      timestamp: new Date().toISOString(),
    };

    // ===== AI AGENT INTEGRATION POINT =====
    // This is where you would call your AI agent API

    let aiMove;
    let confidence = 0;

    // Check if AI agent URL is configured
    const aiAgentUrl = process.env.AI_AGENT_URL;

    if (aiAgentUrl) {
      try {
        // Call external AI agent
        console.log("Calling AI agent at:", aiAgentUrl);
        const aiResponse = await axios.post(aiAgentUrl, aiRequestData, {
          timeout: parseInt(process.env.AI_AGENT_TIMEOUT) || 5000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AI_AGENT_API_KEY || ""}`,
          },
        });

        // Extract AI move from response
        aiMove = aiResponse.data.position || aiResponse.data.move;
        confidence = aiResponse.data.confidence || 0.5;

        console.log("AI agent response:", { aiMove, confidence });
      } catch (aiError) {
        console.error("AI agent error:", aiError.message);
        // Fallback to random move if AI agent fails
        aiMove =
          availableMoves[Math.floor(Math.random() * availableMoves.length)];
        confidence = 0.3;
      }
    } else {
      // No AI agent configured - use random move
      console.log("No AI agent configured. Using random move.");
      aiMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      confidence = 0.5;
    }

    // Validate AI move
    if (!availableMoves.includes(aiMove)) {
      console.error("Invalid AI move:", aiMove);
      aiMove = availableMoves[0];
      confidence = 0.2;
    }

    // Update board with AI move
    const updatedBoard = [...board];
    updatedBoard[aiMove] = aiSymbol;

    // Update game if gameId is provided
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        game.board = updatedBoard;
        game.moveHistory.push({
          player: aiSymbol,
          position: aiMove,
          timestamp: new Date().toISOString(),
          isAI: true,
          confidence,
        });

        // Check game state
        const gameState = checkGameOver(updatedBoard);
        game.isOver = gameState.isOver;
        game.winner = gameState.winner;
        game.isDraw = gameState.isDraw;
        game.winningLine = gameState.winningLine;

        // Switch player if game is not over
        if (!game.isOver) {
          game.currentPlayer = aiSymbol === "X" ? "O" : "X";
        }

        games.set(gameId, game);
      }
    }

    // Return AI move
    res.status(200).json({
      success: true,
      position: aiMove,
      board: updatedBoard,
      confidence,
      availableMoves,
      aiRequestData: {
        ...aiRequestData,
        responseTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error requesting AI move:", error);
    res.status(500).json({
      error: "Failed to get AI move",
      details: error.message,
    });
  }
};

/**
 * Get game state
 * GET /api/game/:gameId
 */
export const getGameState = (req, res) => {
  try {
    const { gameId } = req.params;

    const game = games.get(gameId);

    if (!game) {
      return res.status(404).json({
        error: "Game not found",
      });
    }

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error getting game state:", error);
    res.status(500).json({
      error: "Failed to get game state",
    });
  }
};

/**
 * Validate a move
 * POST /api/game/validate
 */
export const validateMove = (req, res) => {
  try {
    const { board, position } = req.body;

    if (!board || position === undefined) {
      return res.status(400).json({
        error: "Missing required fields: board, position",
      });
    }

    const validation = isValidMove(board, position);

    res.status(200).json({
      success: true,
      ...validation,
    });
  } catch (error) {
    console.error("Error validating move:", error);
    res.status(500).json({
      error: "Failed to validate move",
    });
  }
};

/**
 * Reset game
 * POST /api/game/reset/:gameId
 */
export const resetGame = (req, res) => {
  try {
    const { gameId } = req.params;

    const game = games.get(gameId);

    if (!game) {
      return res.status(404).json({
        error: "Game not found",
      });
    }

    // Reset game state
    game.board = createEmptyBoard();
    game.currentPlayer = "X";
    game.winner = null;
    game.isOver = false;
    game.isDraw = false;
    game.winningLine = null;
    game.moveHistory = [];

    games.set(gameId, game);

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Error resetting game:", error);
    res.status(500).json({
      error: "Failed to reset game",
    });
  }
};
