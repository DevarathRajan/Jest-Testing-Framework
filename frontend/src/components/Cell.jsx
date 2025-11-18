import "./Cell.css";

function Cell({ value, onClick, isWinning = false, disabled = false }) {
  const handleClick = () => {
    if (!disabled && !value) {
      onClick();
    }
  };

  return (
    <button
      className={`cell ${value ? "filled" : ""} ${isWinning ? "winning" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={value ? `Cell filled with ${value}` : "Empty cell"}
    >
      {value && (
        <span className={`symbol symbol-${value.toLowerCase()}`}>{value}</span>
      )}
    </button>
  );
}

export default Cell;
