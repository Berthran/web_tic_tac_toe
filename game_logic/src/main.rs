use std::{
    collections::{HashMap, HashSet},
    io,
};

enum XorO {
    X,
    O,
}

#[derive(PartialEq, Debug)]
enum GameState {
    Start,
    Ongoing,
    End,
    XWin,
    OWin,
    Draw,
}

struct Game<'a> {
    allocated_position: HashSet<u8>,
    state: GameState,
    x_position: Vec<&'a str>,
    o_position: Vec<&'a str>,
    map: HashMap<u8, &'a str>,
}

impl<'a> Game<'a> {
    pub fn new() -> Game<'a> {
        Game {
            allocated_position: HashSet::new(),
            state: GameState::Start,
            x_position: Vec::new(),
            o_position: Vec::new(),
            // T-> Top, M -> Middle, B -> Bottom, L -> Left, C -> Center, R -> Right
            map: HashMap::from([
                (1, "TL"),
                (2, "TC"),
                (3, "TR"),
                (4, "ML"),
                (5, "MC"),
                (6, "MR"),
                (7, "BL"),
                (8, "BC"),
                (9, "BR"),
            ]),
        }
    }

    pub fn assign_position(&mut self, position: u8, x_or_o: &XorO) {
        // Position has to be less than 9, Must not be allocated, Allocated position must be less
        // than 9
        if position > 9
            || self.allocated_position.contains(&position)
            || self.allocated_position.len() == 9
        {
            return;
        }

        self.allocated_position.insert(position);

        match x_or_o {
            XorO::X => {
                self.x_position.push(self.map.get(&position).unwrap());
            }
            XorO::O => {
                self.o_position.push(self.map.get(&position).unwrap());
            }
        }

        self.state = self.check_for_possible_win(x_or_o);
    }

    pub fn check_for_possible_win(&self, x_or_o: &XorO) -> GameState {
        if self.x_position.len() < 3 && self.x_position.len() < 3 {
            return GameState::Ongoing;
        }

        if self.allocated_position.len() == 9 {
            return GameState::Draw;
        }

        match x_or_o {
            XorO::X => {
                let row_state = Game::check_for_row_column_win(&self.x_position);
                let cross_state = Game::check_for_cross_win(&self.x_position);

                if row_state == GameState::End || cross_state == GameState::End {
                    return GameState::XWin;
                }
            }
            XorO::O => {
                let row_state = Game::check_for_row_column_win(&self.o_position);
                let cross_state = Game::check_for_cross_win(&self.o_position);

                if row_state == GameState::End || cross_state == GameState::End {
                    return GameState::OWin;
                }
            }
        }

        GameState::Ongoing
    }

    pub fn check_for_row_column_win(list: &[&str]) -> GameState {
        let first_value = "TMB";
        let second_value = "LCR";

        for character in first_value.chars() {
            let count = list.iter().filter(|&x| x.starts_with(character)).count();

            if count == 3 {
                return GameState::End;
            }
        }

        for character in second_value.chars() {
            let count = list.iter().filter(|&x| x.ends_with(character)).count();

            if count == 3 {
                return GameState::End;
            }
        }

        GameState::Ongoing
    }

    pub fn check_for_cross_win(list: &[&str]) -> GameState {
        if list.contains(&"TL") && list.contains(&"MC") && list.contains(&"BR") {
            return GameState::End;
        }

        if list.contains(&"TR") && list.contains(&"MC") && list.contains(&"BL") {
            return GameState::End;
        }

        GameState::Ongoing
    }
}

fn main() {
    println!("->Welcome to the game of Tic-Tac-Toee!!");
    println!("->To start game, Enter mode: 1 to play with computer, 2 to play with somone: ");

    let mode = read_input()
        .parse::<u8>()
        .expect("Unable to parse mode of play");

    if mode == 1 {
        println!("-> Pick a player (X or O): ");
    } else {
        println!("-> First Player (X or O): ");
    }

    let first_player = read_input()
        .parse::<char>()
        .expect("Unable to parse player");
    let (first_player, second_player) = match first_player {
        'X' => (XorO::X, XorO::O),
        _ => (XorO::O, XorO::X),
    };

    println!("-> Start Game");

    let mut game = Game::new();

    while game.state != GameState::End {
        println!("-> First Player, Enter position");
        let position = read_input()
            .parse::<u8>()
            .expect("Unable to parse position");
        game.assign_position(position, &first_player);
        if game.state != GameState::Ongoing {
            break;
        }
        println!("-> Second Player, Enter position");
        let position = read_input()
            .parse::<u8>()
            .expect("Unable to parse position");
        game.assign_position(position, &second_player);
        if game.state != GameState::Ongoing {
            break;
        }
    }

    println!(
        "{:?} {:?} {:?}",
        game.x_position, game.o_position, game.state
    );
}

fn read_input() -> String {
    let mut input = String::new();
    io::stdin()
        .read_line(&mut input)
        .expect("Unable to read input");
    input.trim().to_string()
}
