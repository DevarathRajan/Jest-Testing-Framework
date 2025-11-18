/**
 * Mock axios entirely before apiService.js loads.
 * This ensures axios.create exists during module initialization.
 */
jest.mock("axios", () => {
  const mockPost = jest.fn();
  const mockGet = jest.fn();

  return {
    create: jest.fn(() => ({
      post: mockPost,
      get: mockGet,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
    __mockPost: mockPost,
    __mockGet: mockGet,
  };
});
// frontend/__tests__/apiService.test.js
import {
  createNewGame,
  makePlayerMove,
  getAIMove,
} from "../src/services/apiService.js";

// jest.mock("axios", () => {
//   const mockPost = jest.fn();
//   const mockGet = jest.fn();

//   return {
//     create: jest.fn(() => ({
//       post: mockPost,
//       get: mockGet,
//       interceptors: {
//         request: { use: jest.fn() },
//         response: { use: jest.fn() },
//       },
//     })),
//     __mockPost: mockPost,
//     __mockGet: mockGet,
//   };
// });

// Extract mocks after module load
import axios from "axios";
const mockPost = axios.__mockPost;
const mockGet = axios.__mockGet;

describe("apiService axios wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createNewGame posts to /game/new", async () => {
    mockPost.mockResolvedValue({ success: true, game: {} });

    const res = await createNewGame("X");

    expect(mockPost).toHaveBeenCalledWith("/game/new", {
      playerSymbol: "X",
    });

    expect(res.success).toBe(true);
  });

  test("makePlayerMove posts to /game/move", async () => {
    mockPost.mockResolvedValue({ success: true });

    await makePlayerMove("gid-123", 0, "X");

    expect(mockPost).toHaveBeenCalledWith("/game/move", {
      gameId: "gid-123",
      position: 0,
      player: "X",
    });
  });

  test("getAIMove posts to /game/ai-move", async () => {
    mockPost.mockResolvedValue({
      position: 4,
      board: Array(9).fill(null),
    });

    const res = await getAIMove(Array(9).fill(null), "O", "medium", "gid-123");

    expect(mockPost).toHaveBeenCalledWith("/game/ai-move", {
      board: expect.any(Array),
      aiSymbol: "O",
      difficulty: "medium",
      gameId: "gid-123",
    });

    expect(res.position).toBe(4);
  });
});
