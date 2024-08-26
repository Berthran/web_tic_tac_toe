use std::{collections::{HashMap, HashSet}, io};

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

struct Game {
    allocated_position: HashSet<u8>,
    state: GameState,
    x_position: Vec<String>,
    o_position: Vec<String>,
    map: HashMap<u8, String>,
}

impl Game {
    pub fn new() -> Game {
        Game {
            allocated_position: HashSet::new(),
            state: GameState::Start,
            x_position: Vec::new(),
            o_position: Vec::new(),
            map: HashMap::from([
                (1, "TL".to_string()),
                (2, "TC".to_string()),
                (3, "TR".to_string()),
                (4, "ML".to_string()),
                (5, "MC".to_string()),
                (6, "ML".to_string()),
                (7, "BL".to_string()),
                (8, "BC".to_string()),
                (9, "BR".to_string()),
            ]),
        }
    }

    pub fn assign_position(&mut self, position: u8, x_or_o: &XorO) -> Option<GameState> {
        // Position has to be less than 9, Must not be allocated, Allocated position must be less
        // than 9
        if position > 9 || self.allocated_position.contains(&position) || self.allocated_position.len() == 9 {
            return None; 
        }

        self.allocated_position.insert(position);
        self.state = self.get_game_state();

        match x_or_o {
            XorO::X => {
                self.x_position.push(self.map.get(&position).unwrap().to_string());
                self.x_position.sort();
            },
            XorO::O => {
                self.o_position.push(self.map.get(&position).unwrap().to_string());
                self.o_position.sort();
            }
        }

        Some(self.check_for_possible_win())
    }


    pub fn get_game_state(&self) -> GameState {
        match self.allocated_position.len() {
            0 => GameState::Start,
            1..=8 => GameState::Ongoing,
            _ => GameState::End,
        }
    }        

    pub fn check_for_possible_win(&self) -> GameState {
        if self.x_position.len() < 3 && self.x_position.len() < 3 {
            return GameState::Ongoing;
        }

        let count_x_b = get_count_first(&self.x_position, "B");
        let count_x_t = get_count_first(&self.x_position, "T");
        let count_x_m = get_count_first(&self.x_position, "M");
        let count_x_l = get_count_second(&self.x_position, "L");
        let count_x_r = get_count_second(&self.x_position, "R");
        let count_x_c = get_count_second(&self.x_position, "C");
        if count_x_b == 3 || count_x_t == 3 || count_x_r == 3 || count_x_l == 3 || count_x_m == 3 || count_x_c == 3 {
            println!("Line X");
            return GameState::XWin;
        }

        let count_o_b = get_count_first(&self.o_position, "B");
        let count_o_t = get_count_first(&self.o_position, "T");
        let count_o_m = get_count_first(&self.o_position, "M");
        let count_o_l = get_count_second(&self.o_position, "L");
        let count_o_r = get_count_second(&self.o_position, "R");
        let count_o_c = get_count_second(&self.o_position, "C");
        if count_o_b == 3 || count_o_t == 3 || count_o_r == 3 || count_o_l == 3 || count_o_m == 3 || count_o_c == 3 {
            println!("Line O");
            return GameState::OWin;
        }

        if self.x_position.contains(&"TL".to_string()) && self.x_position.contains(&"MC".to_string()) && self.x_position.contains(&"BR".to_string()) {
            println!("Cross X");
            return GameState::XWin;
        }

        if self.x_position.contains(&"TR".to_string()) && self.x_position.contains(&"MC".to_string()) && self.x_position.contains(&"BL".to_string()) {
            println!("Cross X");
            return GameState::XWin;
        }

        if self.o_position.contains(&"TL".to_string()) && self.o_position.contains(&"MC".to_string()) && self.o_position.contains(&"BR".to_string()) {
            println!("Cross O");
            return GameState::OWin;
        }

        if self.o_position.contains(&"TR".to_string()) && self.o_position.contains(&"MC".to_string()) && self.o_position.contains(&"BL".to_string()) {
            println!("Cross O");
            return GameState::OWin;
        }

        if self.allocated_position.len() == 9 {
            return GameState::Draw;
        }

        GameState::Ongoing

    }

    pub fn check_for_row_column_win(list: &Vec<String>, x_or_o: &XorO) -> GameState {
        let first_value = "TMB";
        let second_value = "LCR";

        for character in first_value.chars() {
            let count = list.iter()
                .filter(|&x| x.as_bytes()[0] == character as u8)
                .count();
            println!("Count1 {}", count);

            if count == 3 {
                match x_or_o {
                    XorO::X => return GameState::XWin,
                    XorO::O => return GameState::OWin,
                }
            }
        }

        for character in second_value.chars() {
            let count = list.iter().filter(|&x| x.as_bytes()[1] == character as u8).count();
            
            println!("Count2 {}", count);
            if count == 3 {
                match x_or_o {
                    XorO::X => return GameState::XWin,
                    XorO::O => return GameState::OWin,
                }
            }
        }

        GameState::Ongoing
    }

}

fn main() {
    println!("->Welcome to the game of Tic-Tac-Toee!!");
    println!("->To start game, Enter mode: 1 to play with computer, 2 to play with somone: ");

    let mode = read_input().parse::<u8>().expect("Unable to parse mode of play");

    if mode == 1 {
        println!("-> Pick a player (X or O): ");
    } else {
        println!("-> First Player (X or O): ");
    }

    let first_player = read_input().parse::<char>().expect("Unable to parse player");
    let (first_player, second_player) = match first_player {
        'X' => (XorO::X, XorO::O),
        _ => (XorO::O, XorO::X),
    };
    
    println!("-> Start Game");

    let mut game = Game::new();

    while game.get_game_state() != GameState::End {
        println!("-> First Player, Enter position");
        let position = read_input().parse::<u8>().expect("Unable to parse position");
        let game_state = game.assign_position(position, &first_player).unwrap();
        if game_state != GameState::Ongoing {
            break;
        }
        println!("-> Second Player, Enter position");
        let position = read_input().parse::<u8>().expect("Unable to parse position");
        let game_state = game.assign_position(position, &second_player).unwrap();
        if game_state != GameState::Ongoing {
            break;
        }
    }

    game.check_for_possible_win();
    println!("{:?} {:?} {:?}", game.x_position, game.o_position, Game::check_for_row_column_win(&game.x_position, &first_player));

 }


fn read_input() -> String {
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Unable to read input");
    input.trim().to_string()
}

fn get_count_first(list: &Vec<String>, value: &str) -> u8 {
    let mut count = 0;
    for position in list {
        if position.chars().next() == value.chars().next() {
            count += 1;
        }
    }

    count
}

fn get_count_second(list: &Vec<String>, value: &str) -> u8 {
    let mut count = 0;
    for position in list {
        if position.chars().last() == value.chars().next() {
            count += 1;
        }
    }

    count
}
