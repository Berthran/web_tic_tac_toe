import React, { useState } from 'react';

function Square({ value, onSquareClick, highlight }) {
    return (
        <button className={`square ${highlight ? 'highlight' : ''}`} onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay, winningLine }) {
    function handleClick(i) {
        if (squares[i] || calculateWinner(squares)) {
            return;
        }
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? "X" : "O";
        onPlay(nextSquares, i);
    }

    const boardSize = 3;
    const rows = [];
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            const index = i * boardSize + j;
            row.push(
                <Square
                    key={index}
                    value={squares[index]}
                    onSquareClick={() => handleClick(index)}
                    highlight={winningLine && winningLine.includes(index)}
                />
            );
        }
        rows.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
        <>
            {rows}
        </>
    );
}

export default function Game() {
    const [history, setHistory] = useState([{ squares: Array(9).fill(null), location: null }]);
    const [currentMove, setCurrentMove] = useState(0);
    const [isAscending, setIsAscending] = useState(true);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove].squares;

    const winner = calculateWinner(currentSquares);
    const winningLine = winner ? winner.line : null;

    function handlePlay(nextSquares, location) {
        const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location }];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((step, move) => {
        const desc = move === currentMove
            ? `You are at move #${move}`
            : move
                ? `Go to move #${move} (${Math.floor(step.location / 3) + 1}, ${step.location % 3 + 1})`
                : 'Go to game start';
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{desc}</button>
            </li>
        );
    });

    const status = winner
        ? "Winner is: " + winner.player
        : history.length === 10
            ? "It's a draw!"
            : "Next player: " + (xIsNext ? "X" : "O");

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winningLine={winningLine} />
            </div>
            <div className="game-info">
                <div className="status">{status}</div>
                <button onClick={() => setIsAscending(!isAscending)}>
                    {isAscending ? "Sort Descending" : "Sort Ascending"}
                </button>
                <ol>{isAscending ? moves : moves.reverse()}</ol>
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
            return { player: squares[a], line: lines[i] };
        }
    }
    return null;
}
