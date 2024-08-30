import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Update this URL if your Flask server URL is different

export default function Game() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]]);
  const [players, setPlayers] = useState([]);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0
  });
  const [scores, setScores] = useState({});
  const [playWithAI, setPlayWithAI] = useState(false); // New state to track AI play

  useEffect(() => {
    const savedStats = localStorage.getItem(username);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    socket.on('board_update', (data) => {
      setBoard(data.board);
      setPlayers(data.players);
      setIsGameStarted(true);
      setGameOverMessage('');
    });

    socket.on('player_assignment', (data) => {
      alert(`You are player ${data.player} (${data.username})`);
    });

    socket.on('game_over', (data) => {
      if (data.winner === 'Tie') {
        setGameOverMessage('Draw, no winner');
        setStats(prevStats => ({ ...prevStats, draws: prevStats.draws + 1 }));
      } else {
        const winner = data.winner;
        setGameOverMessage(`${winner} wins!`);
        if (players.find(p => p.username === winner)) {
          setStats(prevStats => ({ ...prevStats, wins: prevStats.wins + 1 }));
        } else {
          setStats(prevStats => ({ ...prevStats, losses: prevStats.losses + 1 }));
        }
      }
      setBoard([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]]);
    });

    return () => {
      socket.off('board_update');
      socket.off('player_assignment');
      socket.off('game_over');
    };
  }, [stats, players, username]);

  useEffect(() => {
    localStorage.setItem(username, JSON.stringify(stats));
  }, [stats]);

  function handleCreateRoom() {
    if (username) {
      const generatedRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
      const chosenSymbol = 'X';
      setRoom(generatedRoom);
      socket.emit('join', { username: username, room: generatedRoom, symbol: chosenSymbol, playWithAI: playWithAI });
    } else {
      alert("Please enter a username to create a room.");
    }
  }
  

  function handleJoinRoom() {
    if (username && room) {
      socket.emit('join', { username: username, room: room });
    } else {
      alert("Please enter both a username and a room code.");
    }
  }
  
  function handleRestartGame() {
    setGameOverMessage('');
    socket.emit('restart', { room: room });
  }

  function handleNewGame() {
    setIsGameStarted(false);
    setRoom('');
    setBoard([[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]]);
    setPlayers([]);
    setGameOverMessage('');
  }

  function handleCellClick(row, col) {
    const player = players.find((p) => p.username === username);
    if (player) {
        socket.emit('make_move', { row: row, col: col, player: player.symbol, room: room });
    }
}


  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      {!isGameStarted ? (
        <div className="flex flex-col items-center space-y-4">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={playWithAI}
              onChange={() => setPlayWithAI(!playWithAI)}
            />
            <label>Play with AI</label>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleCreateRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Room
            </button>
            <input
              type="text"
              placeholder="Enter room code"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleJoinRoom}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="text-lg font-bold mb-2">
            {players.map(p => (
              <div key={p.username}>{p.username} ({p.symbol})</div>
            ))}
          </div>
          <div className="text-lg font-bold mb-4">
            Room Code: <span className="text-blue-500">{room}</span>
            <button
              className="ml-2 text-sm text-blue-700 underline"
              onClick={() => navigator.clipboard.writeText(room)}
            >
              Copy
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className="w-16 h-16 text-xl font-bold border border-gray-400"
                >
                  {cell}
                </button>
              ))
            )}
          </div>
          {gameOverMessage && (
            <div className="mt-4 text-red-500 font-semibold">{gameOverMessage}</div>
          )}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={handleRestartGame}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Restart Game
            </button>
            <button
              onClick={handleNewGame}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
