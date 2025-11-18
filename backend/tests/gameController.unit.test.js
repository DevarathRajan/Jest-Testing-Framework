// backend/tests/gameController.unit.test.js
import { expect, jest, test } from "@jest/globals";

import {
  createNewGame,
  makeMove,
  requestAIMove,
  getGameState,
  validateMove,
  resetGame,
} from "../controllers/gameController.js";

// Simple mock response helper
const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("gameController unit tests (real gameLogic)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- createNewGame ----------------
  test("createNewGame creates a game with valid symbol", () => {
    const req = { body: { playerSymbol: "X" } };
    const res = createMockRes();

    createNewGame(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];

    expect(payload.success).toBe(true);
    expect(payload.game.board).toHaveLength(9);
    expect(payload.game.playerSymbol).toBe("X");
    expect(payload.game.aiSymbol).toBe("O");
  });

  test("createNewGame rejects invalid player symbol", () => {
    const req = { body: { playerSymbol: "Z" } };
    const res = createMockRes();

    createNewGame(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringMatching(/invalid player symbol/i), //i given to bypass case sensitivity of regular expression.
      })
    );
  });
  test("createNewGame reject null player symbol", () => {
    const req = { body: { playerSymbol: "" } };
    const res = createMockRes();

    createNewGame(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.error).toBe("Invalid player symbol. Must be X or O");
  });
  test("createNewGame with small letter player symbol x", () => {
    const req = { body: { playerSymbol: "x" } };
    const res = createMockRes();

    createNewGame(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.json.mock.calls[0][0];
    expect(payload.error).toBe("Invalid player symbol. Must be X or O");
  });

  // ---------------- makeMove ----------------
  test("makeMove applies move when valid", () => {
    // create game
    const createReq = { body: { playerSymbol: "X" } };
    const createRes = createMockRes();
    createNewGame(createReq, createRes);
    const { game } = createRes.json.mock.calls[0][0];

    const req = {
      body: {
        gameId: game.gameId,
        position: 0,
        player: "X",
      },
    };
    const res = createMockRes();

    makeMove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.game.board[0]).toBe("X");
    expect(payload.game.currentPlayer).toBe("O");
  });
  test("makeMove accepts any position in the starting", () => {
    for (i = 0; i < 9; i++) {
      const createReq = { body: { playerSymbol: "X" } };
      const createRes = createMockRes();
      createNewGame(createReq, createRes);
      const { game } = createRes.json.mock.calls[0][0];

      const req = {
        body: {
          gameId: game.gameId,
          position: i,
          player: "X",
        },
      };
      const res = createMockRes();
      makeMove(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      console.log(i + " checked");
    }
  });
  test("makeMove returns 404 when game not found", () => {
    const req = {
      body: {
        gameId: "non-existent",
        position: 0,
        player: "X",
      },
    };
    const res = createMockRes();

    makeMove(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Game not found",
      })
    );
  });

  test("makeMove rejects when not player's turn", () => {
    // create game with X
    const createReq = { body: { playerSymbol: "X" } };
    const createRes = createMockRes();
    createNewGame(createReq, createRes);
    const { game } = createRes.json.mock.calls[0][0];

    const req = {
      body: {
        gameId: game.gameId,
        position: 0,
        player: "O", // wrong player, X should play first
      },
    };
    const res = createMockRes();

    makeMove(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringMatching(/not your turn/i),
      })
    );
  });

  test("makeMove rejects invalid move when position already occupied", () => {
    // Create game and play two valid moves to reach occupied cell with correct turn
    const createReq = { body: { playerSymbol: "X" } };
    const createRes = createMockRes();
    createNewGame(createReq, createRes);
    const { game } = createRes.json.mock.calls[0][0];

    // 1) X moves at 0
    const move1Req = {
      body: { gameId: game.gameId, position: 0, player: "X" },
    };
    const move1Res = createMockRes();
    makeMove(move1Req, move1Res);
    expect(move1Res.status).toHaveBeenCalledWith(200);

    // 2) O moves at 1
    const move2Req = {
      body: { gameId: game.gameId, position: 1, player: "O" },
    };
    const move2Res = createMockRes();
    makeMove(move2Req, move2Res);
    expect(move2Res.status).toHaveBeenCalledWith(200);

    // 3) X tries to move again at 0 (occupied)
    const move3Req = {
      body: { gameId: game.gameId, position: 0, player: "X" },
    };
    const move3Res = createMockRes();
    makeMove(move3Req, move3Res);

    expect(move3Res.status).toHaveBeenCalledWith(400);
    const payload = move3Res.json.mock.calls[0][0];
    expect(payload.error).toMatch(/occupied|invalid/i);
  });

  test("makeMove rejects same player playing again", () => {
    const createReq = { body: { playerSymbol: "X" } };
    const createRes = createMockRes();
    createNewGame(createReq, createRes);
    const { game } = createRes.json.mock.calls[0][0];
    //Creating game for player X
    const req1 = {
      body: {
        gameId: game.gameId,
        position: 0,
        player: "X",
      },
    };
    const res1 = createMockRes();
    makeMove(req1, res1);
    expect(res1.status).toHaveBeenCalledWith(200);

    // Player X plays again

    const req2 = {
      body: {
        gameId: game.gameId,
        position: 1,
        player: "X",
      },
    };
    const res2 = createMockRes();
    makeMove(req2, res2);
    expect(res2.status).toHaveBeenCalledWith(400);
    const payload = res2.json.mock.calls[0][0];
    expect(payload.error).toMatch(/not your turn/i);
  });

  // ---------------- requestAIMove (no axios mocking) ----------------
  test("requestAIMove uses random fallback when no AI_AGENT_URL", async () => {
    const originalEnv = process.env.AI_AGENT_URL;
    delete process.env.AI_AGENT_URL;

    const req = {
      body: {
        board: Array(9).fill(null),
        aiSymbol: "O",
        difficulty: "medium",
        gameId: null,
      },
    };
    const res = createMockRes();

    await requestAIMove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];

    const board = payload.board;
    const oCount = board.filter((c) => c === "O").length;

    expect(oCount).toBe(1);
    expect(payload.position).toBeGreaterThanOrEqual(0);
    expect(payload.position).toBeLessThan(board.length);
    expect(board[payload.position]).toBe("O");

    process.env.AI_AGENT_URL = originalEnv;
  });

  // ---------------- misc endpoints ----------------
  test("getGameState returns 404 for unknown game", () => {
    const req = { params: { gameId: "unknown" } };
    const res = createMockRes();

    getGameState(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("validateMove returns success from real logic", () => {
    const board = Array(9).fill(null);
    const req = { body: { board, position: 4 } };
    const res = createMockRes();

    validateMove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.valid).toBe(true);
  });

  test("resetGame returns 404 if game not found", () => {
    const req = { params: { gameId: "unknown" } };
    const res = createMockRes();

    resetGame(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
