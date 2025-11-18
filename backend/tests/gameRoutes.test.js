// backend/tests/gameRoutes.test.js
import { jest } from "@jest/globals";
import request from "supertest";
import app from "../server.js";
import * as gameLogic from "../utils/gameLogic.js";

describe("Game routes integration tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/game/new creates a game", async () => {
    const res = await request(app)
      .post("/api/game/new")
      .send({ playerSymbol: "X" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.game).toBeDefined();
    expect(res.body.game.board).toHaveLength(9);
  });

  test("full flow: new game → move → get state → reset", async () => {
    // create game
    const newRes = await request(app)
      .post("/api/game/new")
      .send({ playerSymbol: "X" });

    const gameId = newRes.body.game.gameId;

    // make a valid move
    const moveRes = await request(app).post("/api/game/move").send({
      gameId,
      position: 0,
      player: "X",
    });

    expect(moveRes.status).toBe(200);
    expect(moveRes.body.game.board[0]).toBe("X");

    // get game state
    const getRes = await request(app).get(`/api/game/${gameId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.game.board[0]).toBe("X");

    // reset game
    const resetRes = await request(app).post(`/api/game/reset/${gameId}`);
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.game.board.every((c) => c === null)).toBe(true);
  });

  test("POST /api/game/validate validates moves", async () => {
    const board = Array(9).fill(null);
    const res = await request(app)
      .post("/api/game/validate")
      .send({ board, position: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.valid).toBe(true);
  });

  test("POST /api/game/ai-move returns AI move", async () => {
    // make deterministic: spy on Math.random
    jest.spyOn(Math, "random").mockReturnValue(0);

    const board = Array(9).fill(null);
    const res = await request(app).post("/api/game/ai-move").send({
      board,
      aiSymbol: "O",
      difficulty: "medium",
    });

    expect(res.status).toBe(200);
    expect(res.body.position).toBeDefined();
    expect(res.body.board[res.body.position]).toBe("O");

    Math.random.mockRestore();
  });
});
