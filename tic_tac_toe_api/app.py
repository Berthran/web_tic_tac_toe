from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit
import string
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

# Store game data for each room
games = {}

def generate_room_code(length=6):
    """Generate a random room code consisting of uppercase letters and digits."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@app.route('/')
def index():
    return render_template('home.html')

# A function to create a new game board
def create_game_board():
    return [[" ", " ", " "] for _ in range(3)]

# Handler for creating or joining a game room
@socketio.on('join')
def on_join(data):
    room = data['room']
    username = data['username']
    ai = data.get('ai', None)
    join_room(room)
    
    # Initialize game if it doesn't exist
    if room not in games:
        games[room] = {
            'board': create_game_board(),
            'current_player': 'X',
            'players': [{'username': username, 'symbol': 'X'}],  # First player is 'X'
            'turns': 0,
            'game_over': False
        }
        emit('player_assignment', {'player': 'X', 'username': username}, room=request.sid)  # Notify the first player
    elif len(games[room]['players']) == 1:
        for i in games[room]['players']:
            if i['username'] == username:
                emit('room_full', 'Player already exist', room=request.sid)
        games[room]['players'].append({'username': username, 'symbol': 'O'})
        emit('player_assignment', {'player': 'O', 'username': username}, room=request.sid)
    else:
        emit('room_full', 'The room is full. Please join another room.', room=request.sid)
        return  # Prevent further processing

    emit('board_update', {'board': games[room]['board'], 'players': games[room]['players']}, room=room)

@socketio.on('restart')
def on_restart(data):
    room = data['room']
    join_room(room)
    
    games[room] = {
        'board': create_game_board(),
        'current_player': 'X',
        'players': games[room]['players'],  # Keep the same players
        'turns': 0,
        'game_over': False,
        'status': 'on_going'
    }

    emit('board_update', {'board': games[room]['board'], 'players': games[room]['players']}, room=room)

# Handler for making a move
@socketio.on('make_move')
def on_move(data):
    room = data['room']
    row = data['row']
    col = data['col']
    player = data['player']
    game = games.get(room)

    if game and not game['game_over']:
        current_player = game['current_player']
        if player == current_player and game['board'][row][col] == " ":
            game['board'][row][col] = current_player
            game['turns'] += 1
            check_winner(game, current_player)
            game['current_player'] = 'O' if current_player == 'X' else 'X'

            emit('board_update', {'board': game['board'], 'players': game['players']}, room=room)

            if game['game_over']:
                winner = current_player if game['turns'] < 9 else 'Tie'
                emit('game_over', {'winner': winner}, room=room)

# Function to check if the current player won the game
def check_winner(game, current_player):
    board = game['board']
    # Check rows, columns, and diagonals for a win
    for i in range(3):
        if board[i][0] == board[i][1] == board[i][2] != " ":
            game['game_over'] = True
            return
        if board[0][i] == board[1][i] == board[2][i] != " ":
            game['game_over'] = True
            return
    if board[0][0] == board[1][1] == board[2][2] != " " or board[0][2] == board[1][1] == board[2][0] != " ":
        game['game_over'] = True

    if game['turns'] == 9 and not game['game_over']:
        game['game_over'] = True


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')
