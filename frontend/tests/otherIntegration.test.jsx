import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import App from "../src/App.jsx";
import * as api from "../src/services/apiService.js";

jest.mock("../src/services/apiService.js");

describe("App integration flow (with mocked apiService)", () => {
  const baseGame = {
    gameId: "game-1",
    board: Array(9).fill(null),
    playerSymbol: "X",
    aiSymbol: "O",
    currentPlayer: "X",
    winner: null,
    isOver: false,
    isDraw: false,
    winningLine: null,
    moveHistory: [],
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // mock createNewGame used in useEffect
    api.createNewGame.mockResolvedValue({
      success: true,
      game: { ...baseGame },
    });
  });
  test("Human vs Human should not trigger AI calls", async () => {
    api.createNewGame.mockResolvedValueOnce({
      success: true,
      game: { ...baseGame, currentPlayer: "X" },
    });

    api.makePlayerMove.mockResolvedValueOnce({
      success: true,
      game: {
        ...baseGame,
        board: ["X", null, null, null, null, null, null, null, null],
        currentPlayer: "O",
      },
    });
    const { container } = render(<App />);
    await waitFor(() => expect(api.createNewGame).toHaveBeenCalled());
    //Switch to human mode
    const humanMode = screen.getByRole("button", { name: /human/i });
    fireEvent.click(humanMode);

    //Wait for init
    await waitFor(() => expect(api.createNewGame).toHaveBeenCalled());
    const cell = container.getElementsByClassName("cell");
    fireEvent.click(cell[0]);

    await waitFor(() =>
      expect(api.makePlayerMove).toHaveBeenCalledWith("game-1", 0, "X")
    );

    //AI should not be called

    expect(api.getAIMove).not.toHaveBeenCalled();
    expect(api.makePlayerMove).toHaveBeenCalledTimes(1);
  });

  test("Clicking an occupied cell throws error and does not call backend", async () => {
    api.createNewGame.mockResolvedValueOnce({
      success: true,
      game: {
        ...baseGame,
        board: ["X", null, null, null, null, null, null, null, null],
        currentPlayer: "X",
      },
    });
    const { container } = render(<App />);
    await waitFor(() => expect(api.createNewGame).toHaveBeenCalled());

    const cell = container.getElementsByClassName("cell");
    fireEvent.click(cell[0]);
    //Backend must not be called

    expect(api.makePlayerMove).not.toHaveBeenCalled();
  });

  test("Cannot play after game is over", async () => {
    api.createNewGame.mockResolvedValueOnce({
      success: true,
      game: {
        ...baseGame,
        board: ["X", "X", "X", null, null, null, null, null, null],
        winner: "X",
        isOver: true,
      },
    });
    const { container } = render(<App />);
    await waitFor(() => expect(api.createNewGame).toHaveBeenCalled());
    const cell = container.getElementsByClassName("cell");

    fireEvent.click(cell[3]);
    expect(api.makePlayerMove).not.toHaveBeenCalled();
    expect(screen.getByText(/X Wins/i)).toBeInTheDocument();
  });
});
