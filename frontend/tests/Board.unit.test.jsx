// frontend/__tests__/Board.test.jsx
import { render, fireEvent } from "@testing-library/react";
import Board from "../src/components/Board.jsx";

describe("Board component", () => {
  test("renders 9 cells", () => {
    const board = Array(9).fill(null);
    const { container } = render(
      <Board board={board} onCellClick={() => {}} />
    );

    const cells = container.getElementsByClassName("cell");
    expect(cells.length).toBe(9);
  });

  test("clicking a cell calls onCellClick with correct index when enabled", () => {
    const board = Array(9).fill(null);
    const onCellClick = jest.fn();

    const { container } = render(
      <Board board={board} onCellClick={onCellClick} />
    );

    const cells = container.getElementsByClassName("cell");

    fireEvent.click(cells[3]);

    expect(onCellClick).toHaveBeenCalledWith(3);
  });

  test("does not call onCellClick when board is disabled", () => {
    const board = Array(9).fill(null);
    const onCellClick = jest.fn();

    const { container } = render(
      <Board board={board} onCellClick={onCellClick} disabled={true} />
    );

    const cells = container.getElementsByClassName("cell");
    fireEvent.click(cells[0]);

    expect(onCellClick).not.toHaveBeenCalled();
  });

  test("applies winning class to winning cells", () => {
    const board = ["X", "X", "X", null, null, null, null, null, null];
    const winningLine = [0, 1, 2];

    const { container } = render(
      <Board board={board} onCellClick={() => {}} winningLine={winningLine} />
    );

    const cells = container.getElementsByClassName("cell");
    expect(cells[0].className).toMatch(/winning/);
    expect(cells[1].className).toMatch(/winning/);
    expect(cells[2].className).toMatch(/winning/);
  });
});
