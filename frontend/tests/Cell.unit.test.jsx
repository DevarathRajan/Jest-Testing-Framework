// frontend/__tests__/Cell.test.jsx
import { render, fireEvent } from "@testing-library/react";
import Cell from "../src/components/Cell.jsx";

describe("Cell component", () => {
  test("renders empty cell and triggers onClick when enabled", () => {
    const onClick = jest.fn();
    const { getByRole } = render(<Cell value={null} onClick={onClick} />);

    const button = getByRole("button");
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <Cell value={null} onClick={onClick} disabled={true} />
    );

    const button = getByRole("button");
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  test("shows symbol when value is provided and sets aria-label", () => {
    const { getByRole, getByText } = render(
      <Cell value="X" onClick={() => {}} />
    );

    const button = getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Cell filled with X");

    const symbol = getByText("X");
    expect(symbol).toBeInTheDocument();
  });

  test("applies winning class when isWinning is true", () => {
    const { getByRole } = render(
      <Cell value="O" onClick={() => {}} isWinning={true} />
    );

    const button = getByRole("button");
    expect(button.className).toMatch(/winning/);
  });
});
