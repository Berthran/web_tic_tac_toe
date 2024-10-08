from flask import Flask, request
from flask_socketio import SocketIO, join_room, emit
from flask_cors import CORS
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'

CORS(app, origins=['http://localhost:5173'])

socketio = SocketIO(app, cors_allowed_origins='http://localhost:5173')

def create_game_board():
    return [[" ", " ", " "] for _ in range(3)]

games = {}
scores = {}

def initialize_scores(room, players):
    scores[room] = {player['username']: 0 for player in players}
    scores[room]['Tie'] = 0

@socketio.on('join')
def on_join(data):
    room = data['room']
    username = data['username']
    play_with_ai = data.get('playWithAI', False)
    join_room(room)

    if room not in games:
        symbol = 'X'
        ai_symbol = 'O'
        
        games[room] = {
            'board': create_game_board(),
            'current_player': symbol,
            'players': [{'username': username, 'symbol': symbol}],
            'turns': 0,
            'game_over': False,
            'play_with_ai': play_with_ai,
            'room': room
        }
        initialize_scores(room, games[room]['players'])
        emit('player_assignment', {'player': symbol, 'username': username}, room=request.sid)
        
        if play_with_ai:
            games[room]['players'].append({'username': 'AI', 'symbol': ai_symbol})
            emit('player_assignment', {'player': ai_symbol, 'username': 'AI'}, room=request.sid)
        emit('board_update', {'board': games[room]['board'], 'players': games[room]['players']}, room=room)
    else:
        if len(games[room]['players']) < 2 and not play_with_ai:
            symbol = 'O'
            games[room]['players'].append({'username': username, 'symbol': symbol})
            emit('player_assignment', {'player': symbol, 'username': username}, room=request.sid)
            emit('board_update', {'board': games[room]['board'], 'players': games[room]['players']}, room=room)
        else:
            emit('error', {'message': 'Room is full or AI game is selected.'}, room=request.sid)

@socketio.on('restart')
def on_restart(data):
    room = data['room']
    
    game = games[room]
    game['board'] = create_game_board()
    game['current_player'] = game['players'][0]['symbol']
    game['turns'] = 0
    game['game_over'] = False

    emit('board_update', {'board': game['board'], 'players': game['players']}, room=room)
    emit('score_update', {'scores': scores[room]}, room=room)

@socketio.on('make_move')
def make_move(data):
    row = data['row']
    col = data['col']
    player = data['player']
    room = data['room']
    
    game = games.get(room)
    board = game['board']

    if board[row][col] == ' ' and not game['game_over']:
        current_player = game['current_player']
        if player == current_player:
            board[row][col] = player
            emit('board_update', {'board': board, 'players': game['players']}, room=room)
            game['current_player'] = 'O' if player == 'X' else 'X'
            game['turns'] += 1
            check_winner(game)
            
            if game['play_with_ai'] and player == 'X' and not game['game_over']:
                ai_make_move(room)

def check_winner(game):
    board = game['board']
    players = game['players']
    symbols = [player['symbol'] for player in players]

    for symbol in symbols:
        if any([
            all(board[row][col] == symbol for col in range(3)) for row in range(3)
        ]) or any([
            all(board[row][col] == symbol for row in range(3)) for col in range(3)
        ]) or all(board[i][i] == symbol for i in range(3)) or all(board[i][2 - i] == symbol for i in range(3)):
            emit('game_over', {'winner': next(player['username'] for player in players if player['symbol'] == symbol)}, room=game['room'])
            game['game_over'] = True
            return

    if game['turns'] >= 9:
        emit('game_over', {'winner': 'Tie'}, room=game['room'])
        game['game_over'] = True

def ai_make_move(room):
    game = games[room]
    board = game['board']
    empty_cells = [(row, col) for row in range(3) for col in range(3) if board[row][col] == ' ']
    
    if not empty_cells:
        return
    
    row, col = random.choice(empty_cells)
    symbol = 'O'
    board[row][col] = symbol
    emit('board_update', {'board': board, 'players': game['players']}, room=room)
    game['current_player'] = 'X'
    game['turns'] += 1

    check_winner(game)

if __name__ == '__main__':
    socketio.run(app, host='localhost')
