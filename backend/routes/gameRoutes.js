import express from "express";
import {
  createNewGame,
  makeMove,
  requestAIMove,
  getGameState,
  validateMove,
  resetGame,
} from "../controllers/gameController.js";
const router = express.Router();
// Create a new game
router.post("/new", createNewGame);
// Make a player move
router.post("/move", makeMove);
// Request AI move (this endpoint will call AI agent)
router.post("/ai-move", requestAIMove);
// Get current game state
router.get("/:gameId", getGameState);
// Validate a move
router.post("/validate", validateMove);
// Reset game
router.post("/reset/:gameId", resetGame);
export default router;
