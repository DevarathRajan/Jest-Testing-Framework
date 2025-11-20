// frontend/__tests__/GameControls.test.jsx
import { render, fireEvent } from "@testing-library/react";
import GameControls from "../src/components/GameControls.jsx";

describe("GameControls component", () => {
  test("calls onNewGame with 'X' and 'O' when symbol buttons clicked", () => {
    const onNewGame = jest.fn();

    const { getByText } = render(
      <GameControls
        onNewGame={onNewGame}
        onReset={() => {}}
        difficulty="medium"
        onDifficultyChange={() => {}}
        playerSymbol="X"
        gameMode="ai"
        onGameModeChange={() => {}}
      />
    );

    fireEvent.click(getByText("X"));
    fireEvent.click(getByText("O"));

    expect(onNewGame).toHaveBeenCalledWith("X");
    expect(onNewGame).toHaveBeenCalledWith("O");
  });

  test("calls onGameModeChange when game mode buttons clicked", () => {
    const onGameModeChange = jest.fn();

    const { getByText } = render(
      <GameControls
        onNewGame={() => {}}
        onReset={() => {}}
        difficulty="medium"
        onDifficultyChange={() => {}}
        playerSymbol="X"
        gameMode="ai"
        onGameModeChange={onGameModeChange}
      />
    );

    fireEvent.click(getByText("vs Human"));
    expect(onGameModeChange).toHaveBeenCalledWith("human");

    fireEvent.click(getByText("vs AI"));
    expect(onGameModeChange).toHaveBeenCalledWith("ai");
  });

  test("calls onDifficultyChange when difficulty buttons clicked in AI mode", () => {
    const onDifficultyChange = jest.fn();

    const { getByText } = render(
      <GameControls
        onNewGame={() => {}}
        onReset={() => {}}
        difficulty="medium"
        onDifficultyChange={onDifficultyChange}
        playerSymbol="X"
        gameMode="ai"
        onGameModeChange={() => {}}
      />
    );

    fireEvent.click(getByText("Easy"));
    fireEvent.click(getByText("Medium"));
    fireEvent.click(getByText("Hard"));

    expect(onDifficultyChange).toHaveBeenCalledWith("easy");
    expect(onDifficultyChange).toHaveBeenCalledWith("medium");
    expect(onDifficultyChange).toHaveBeenCalledWith("hard");
  });

  test("calls onReset when Reset Game clicked", () => {
    const onReset = jest.fn();

    const { getByText } = render(
      <GameControls
        onNewGame={() => {}}
        onReset={onReset}
        difficulty="medium"
        onDifficultyChange={() => {}}
        playerSymbol="X"
        gameMode="ai"
        onGameModeChange={() => {}}
      />
    );

    fireEvent.click(getByText("Reset Game"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
