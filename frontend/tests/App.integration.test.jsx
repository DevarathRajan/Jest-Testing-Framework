// frontend/__tests__/App.test.jsx
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

  test("initializes game on mount and shows basic info", async () => {
    render(<App />);

    await waitFor(() => expect(api.createNewGame).toHaveBeenCalledWith("X"));

    expect(screen.getByText(/Your Symbol:/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Turn:/i)).toBeInTheDocument();
  });

  test("player move triggers makePlayerMove and AI move when in AI mode", async () => {
    // Player move response (X moves to index 0)
    api.makePlayerMove
      .mockResolvedValueOnce({
        success: true,
        game: {
          ...baseGame,
          board: ["X", null, null, null, null, null, null, null, null],
          currentPlayer: "O",
        },
      })
      // AI move response (O moves to index 4)
      .mockResolvedValueOnce({
        success: true,
        game: {
          ...baseGame,
          board: ["X", null, null, null, "O", null, null, null, null],
          currentPlayer: "X",
        },
      });

    // AI engine returns position 4
    api.getAIMove.mockResolvedValue({
      success: true,
      position: 4,
      board: ["X", null, null, null, "O", null, null, null, null],
    });

    const { container } = render(<App />);

    // Wait for new game init
    await waitFor(() => expect(api.createNewGame).toHaveBeenCalled());

    const cells = container.getElementsByClassName("cell");

    // Player clicks cell 0
    fireEvent.click(cells[0]);

    // Player move called
    await waitFor(() =>
      expect(api.makePlayerMove).toHaveBeenCalledWith("game-1", 0, "X")
    );

    // AI getAIMove should be called
    await waitFor(() => expect(api.getAIMove).toHaveBeenCalled());

    // AI move applied via second makePlayerMove call
    await waitFor(() => expect(api.makePlayerMove).toHaveBeenCalledTimes(2));

    // Check board visually
    expect(cells[0].textContent).toContain("X");
    expect(cells[4].textContent).toContain("O");
  });
});
