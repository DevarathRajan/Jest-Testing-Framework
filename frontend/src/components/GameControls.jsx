import "./GameControls.css";

function GameControls({
  onNewGame,
  onReset,
  difficulty,
  onDifficultyChange,
  playerSymbol,
  gameMode,
  onGameModeChange,
  disabled = false,
}) {
  return (
    <div className="game-controls">
      <div className="control-section">
        <h3>Game Mode</h3>
        <div className="button-group">
          <button
            className={`control-button ${gameMode === "ai" ? "active" : ""}`}
            onClick={() => onGameModeChange("ai")}
            disabled={disabled}
          >
            vs AI
          </button>
          <button
            className={`control-button ${gameMode === "human" ? "active" : ""}`}
            onClick={() => onGameModeChange("human")}
            disabled={disabled}
          >
            vs Human
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Choose Your Symbol</h3>
        <div className="button-group">
          <button
            className={`control-button symbol-button ${
              playerSymbol === "X" ? "active" : ""
            }`}
            onClick={() => onNewGame("X")}
            disabled={disabled}
          >
            X
          </button>
          <button
            className={`control-button symbol-button ${
              playerSymbol === "O" ? "active" : ""
            }`}
            onClick={() => onNewGame("O")}
            disabled={disabled}
          >
            O
          </button>
        </div>
      </div>

      {gameMode === "ai" && (
        <div className="control-section">
          <h3>AI Difficulty</h3>
          <div className="button-group">
            <button
              className={`control-button ${
                difficulty === "easy" ? "active" : ""
              }`}
              onClick={() => onDifficultyChange("easy")}
              disabled={disabled}
            >
              Easy
            </button>
            <button
              className={`control-button ${
                difficulty === "medium" ? "active" : ""
              }`}
              onClick={() => onDifficultyChange("medium")}
              disabled={disabled}
            >
              Medium
            </button>
            <button
              className={`control-button ${
                difficulty === "hard" ? "active" : ""
              }`}
              onClick={() => onDifficultyChange("hard")}
              disabled={disabled}
            >
              Hard
            </button>
          </div>
        </div>
      )}

      <div className="control-section">
        <button
          className="control-button reset-button"
          onClick={onReset}
          disabled={disabled}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default GameControls;
