let socket = io();
        let player;
        let room;

        socket.on('player_assignment', function(data) {
            player = data.player;
            alert('You are player ' + player + ' (' + data.username + ')');
        });

        socket.on('room_full', function(message) {
            alert(message);
        });

        socket.on('board_update', function(data) {
            updateBoard(data.board);
            displayPlayers(data.players);
        });

        socket.on('game_over', function(data) {
            let message = data.winner === 'Tie' ? 'The game is a tie!' : 'Player ' + data.winner + ' wins!';
            alert(message);
        });

        function createRoom() {
            let username = document.getElementById('username').value;
            room = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generates a random 6-character room code

            if (username) {
                socket.emit('join', {username: username, room: room});
                document.getElementById('room').value = room; // Display the generated room code in the input field
                document.getElementById('board').style.display = 'block';
                document.getElementById('restartBtn').style.display = 'block';
            } else {
                alert("Please enter a username to create a room.");
            }
        }

        function joinRoom() {
            let username = document.getElementById('username').value;
            room = document.getElementById('room').value;

            if (username && room) {
                socket.emit('join', {username: username, room: room});
                document.getElementById('board').style.display = 'block';
                document.getElementById('restartBtn').style.display = 'block';
            } else {
                alert("Please enter both a username and a room code.");
            }
        }

            function computerPlay() {
                let username = document.getElementById('username').value;
                room = 'computer_game';

                if (username) {
                    socket.emit('join', {username: username, room: room, ai: 'ai'});
                    document.getElementById('board').style.display = 'block';
                    document.getElementById('restartBtn').style.display = 'block';
                } else {
                    alert("What's your name?.");
                }
            }
        function updateBoard(board) {
        let boardDiv = document.getElementById('board');
        boardDiv.innerHTML = '';  // Clear previous board

        // Create a container for the board to display as a grid
        const boardContainer = document.createElement('div');
        boardContainer.classList.add('board-container');
        boardDiv.appendChild(boardContainer);

        for (let i = 0; i < board.length; i++) {
            const rowDiv = document.createElement('div'); // Create a div for each row
            rowDiv.classList.add('board-row');
            boardContainer.appendChild(rowDiv); // Add row to the board container

            for (let j = 0; j < board[i].length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('game-cell');
                cell.textContent = board[i][j]; // Set the cell text to the current board value

                // Click event to make a move
                cell.onclick = (function(i, j) {
                    return function() {
                        socket.emit('make_move', {row: i, col: j, player: player, room: room});
                };
            })(i, j);

            rowDiv.appendChild(cell); // Add cell to the current row
        }
    }
}


        function displayPlayers(players) {
            let playersDiv = document.getElementById('players');
            playersDiv.innerHTML = '<strong>Players:</strong><br>';
            players.forEach(function(player) {
                playersDiv.innerHTML += player.username + ' (' + player.symbol + ')<br>';
            });
        }

        function restartGame() {
            socket.emit('restart', {room: room});
        }