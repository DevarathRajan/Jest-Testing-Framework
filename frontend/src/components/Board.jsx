import Cell from "./Cell";
import "./Board.css";

function Board({ board, onCellClick, winningLine = null, disabled = false }) {
  const isWinningCell = (index) => {
    return winningLine && winningLine.includes(index);
  };

  return (
    <div className="board">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinning={isWinningCell(index)}
          disabled={disabled || value !== null}
        />
      ))}
    </div>
  );
}

export default Board;
