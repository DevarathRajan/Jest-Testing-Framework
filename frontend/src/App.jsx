import { useState, useEffect } from "react";
import Board from "./components/Board";
import GameControls from "./components/GameControls";
import {
  createNewGame,
  makePlayerMove,
  getAIMove,
} from "./services/apiService";
import "./App.css";

function App() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState("X");
  const [difficulty, setDifficulty] = useState("medium");
  const [gameMode, setGameMode] = useState("ai"); // 'ai' or 'human'

  // Initialize new game
  const initializeGame = async (symbol) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createNewGame(symbol);
      setGame(response.game);
      setPlayerSymbol(symbol);

      // If AI goes first (X), request AI move
      if (response.game.aiSymbol === "X") {
        await handleAIMove(response.game);
      }
    } catch (err) {
      setError(err.message || "Failed to create game");
      console.error("Error creating game:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle player move
  const handlePlayerMove = async (position) => {
    if (!game || game.isOver || loading) return;

    // Check if it's player's turn
    if (game.currentPlayer !== playerSymbol) {
      setError("It's not your turn!");
      return;
    }

    // Check if cell is already occupied
    if (game.board[position]) {
      setError("Cell is already occupied!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Make player move
      const response = await makePlayerMove(
        game.gameId,
        position,
        playerSymbol
      );
      setGame(response.game);

      // If game is not over and it's AI mode, request AI move
      if (!response.game.isOver && gameMode === "ai") {
        // Small delay for better UX
        setTimeout(async () => {
          await handleAIMove(response.game);
        }, 500);
      }
    } catch (err) {
      setError(err.message || "Failed to make move");
      console.error("Error making move:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle AI move
  const handleAIMove = async (currentGame) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAIMove(
        currentGame.board,
        currentGame.aiSymbol,
        difficulty,
        currentGame.gameId
      );

      // Make the AI move
      const aiMoveResponse = await makePlayerMove(
        currentGame.gameId,
        response.position,
        currentGame.aiSymbol
      );

      setGame(aiMoveResponse.game);
    } catch (err) {
      setError(err.message || "AI move failed");
      console.error("Error with AI move:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset game
  const handleReset = () => {
    initializeGame(playerSymbol);
  };

  // Change difficulty
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  // Start new game on mount
  useEffect(() => {
    initializeGame("X");
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tic-Tac-Toe with AI</h1>
        <p className="subtitle">Play against an intelligent AI opponent</p>
      </header>

      <main className="app-main">
        <GameControls
          onNewGame={initializeGame}
          onReset={handleReset}
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          playerSymbol={playerSymbol}
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          disabled={loading}
        />

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {game && (
          <>
            <div className="game-info">
              <div className="info-item">
                <span className="label">Your Symbol:</span>
                <span className={`value symbol-${playerSymbol.toLowerCase()}`}>
                  {playerSymbol}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Current Turn:</span>
                <span
                  className={`value symbol-${game.currentPlayer.toLowerCase()}`}
                >
                  {game.currentPlayer}
                  {game.currentPlayer === playerSymbol ? " (You)" : " (AI)"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                <span className="value">
                  {game.isOver
                    ? game.isDraw
                      ? "Draw!"
                      : `${game.winner} Wins!`
                    : "In Progress"}
                </span>
              </div>
            </div>

            <Board
              board={game.board}
              onCellClick={handlePlayerMove}
              winningLine={game.winningLine}
              disabled={
                loading || game.isOver || game.currentPlayer !== playerSymbol
              }
            />

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Thinking...</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React and Node.js</p>
      </footer>
    </div>
  );
}

export default App;
