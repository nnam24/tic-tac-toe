import { useState, useEffect } from "react";
import { Switch, FormControlLabel } from "@mui/material";
import "./App.css";

function Square({ value, onSquareClick, isHighLighted }) {
  return (
    <button
      style={{
        backgroundColor: isHighLighted ? "burlywood" : "transparent",
      }}
      className="square"
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const [winArray, setWinArray] = useState([]);

  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares, i); // Pass the index of the move
  }

  const result = calculateWinner(squares);
  let status;

  useEffect(() => {
    if (result) {
      setWinArray([result.a, result.b, result.c]);
    } else {
      setWinArray([]);
    }
  }, [squares, result]);

  if (result) {
    status = "Winner: " + result.winner;
  } else if (squares.every((square) => square !== null)) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {Array.from({ length: 3 }, (_, row) => (
        <div className="board-row" key={row}>
          {Array.from({ length: 3 }, (_, col) => (
            <Square
              key={row * 3 + col}
              isHighLighted={winArray.includes(row * 3 + col)}
              value={squares[row * 3 + col]}
              onSquareClick={() => handleClick(row * 3 + col)}
            />
          ))}
        </div>
      ))}
    </>
  );
}

const ToggleButton = ({ onToggle }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
    onToggle(isToggled);
  };

  return (
    <FormControlLabel
      control={
        <Switch checked={isToggled} onChange={handleToggle} color="primary" />
      }
      label={isToggled ? "On" : "Off"}
      labelPlacement="start"
      style={{ margin: "20px" }}
    />
  );
};

export default function Game() {
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), move: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;
  const [isSortedAsc, setSortAsc] = useState(true);

  function handlePlay(nextSquares, i) {
    const row = Math.floor(i / 3);
    const col = i % 3;

    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, move: { row, col } },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleToggle(newState) {
    setSortAsc(newState);
  }

  const moves = history.map((step, move) => {
    let description;
    const { row, col } = step.move || { row: null, col: null };
    if (move === currentMove) {
      description = `You are at #${move} at (${row}, ${col})`;
    } else if (move > 0) {
      description = `Go to move #${move} at (${row}, ${col})`;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        {move === currentMove ? (
          <div>{description}</div>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        {!isSortedAsc ? <ol>{moves.reverse()}</ol> : <ol>{moves}</ol>}
        <ToggleButton onToggle={handleToggle} />
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], a, b, c };
    }
  }
  return null;
}
