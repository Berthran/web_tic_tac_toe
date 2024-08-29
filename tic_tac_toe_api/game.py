#!/usr/bin/python3

game_board = [
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", " ", " "]
]


playerX = "X"
playerO = "O"

currentPlayer = playerX

turns = 0

game_over = False


def get_board(game_board):
    i, j = 0, 0
    print(f"**** {currentPlayer}'s turn ****".rjust(25))
    for rows in game_board:
        i += 1
        print(f"{'________+': <4}" * 3)
        for cols in rows:
            j += 1
            print(f'{"|": <4}{cols: <4}|', end='')
        print(f'\t({i} - {j})')
        i = j
    print(f"{'________+': <4}" * 3)


def check_winner():
    global turns, game_over, currentPlayer

    turns += 1

    for i in range(3):
        # Check rows
        if game_board[i][0] == game_board[i][1] == game_board[i][2] != " ":
            currentPlayer = f'{game_board[i][0]} wins'
            game_over = True
            return

        # Check columns
        if game_board[0][i] == game_board[1][i] == game_board[2][i] != " ":
            currentPlayer = f'{game_board[0][i]} wins'
            game_over = True
            return

    # Check diagonals
    if game_board[0][0] == game_board[1][1] == game_board[2][2] != " ":
        currentPlayer = f'{game_board[0][0]} wins'
        game_over = True
        return
 
    if game_board[0][2] == game_board[1][1] == game_board[2][0] != " ":
        currentPlayer = f'{game_board[0][2]} wins'
        game_over = True
        return

    # Check for tie
    if turns == 9:
        game_over = True
        currentPlayer = "A tie"


def set_matrix(row, col):
    global currentPlayer

    if game_board[row][col] != " ":
        print("Space already taken\n")
        get_board(game_board)
        return
    
    game_board[row][col] = currentPlayer

    if currentPlayer == playerO:
        currentPlayer = playerX
    else:
        currentPlayer = playerO

    check_winner()


def main():
    while game_over != True:
        get_board(game_board)
        try:
            num = int(input(f"\n{currentPlayer} waiting for your number(1-9): "))
            if num in range(1, 4):
                set_matrix(0, col=(num-1))
            elif num in range(4, 7):
                set_matrix(1, col=(num - 4))
            elif num in range(7, 10):
                set_matrix(2, col=(num - 7))
            else:
                print("Only numbers are allowed\n")
        except ValueError or IndexError:
            print("Invalid input. Please enter a number between 1 and 9.\n")            
        
    get_board(game_board)
    print(currentPlayer)


if __name__ == "__main__":
    main()

