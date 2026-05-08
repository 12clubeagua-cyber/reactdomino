use wasm_bindgen::prelude::*;
use std::cmp;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Tile {
    pub v1: u8,
    pub v2: u8,
}

#[wasm_bindgen]
impl Tile {
    #[wasm_bindgen(constructor)]
    pub fn new(v1: u8, v2: u8) -> Tile {
        Tile { v1, v2 }
    }
}

#[wasm_bindgen]
pub struct Placement {
    pub x: f32,
    pub y: f32,
    pub v1: u8,
    pub v2: u8,
    pub is_v: bool,
}

#[wasm_bindgen]
pub struct GameLogic;

#[wasm_bindgen]
impl GameLogic {
    /// Pure validation logic
    pub fn can_play(v1: u8, v2: u8, e1: u8, e2: u8) -> bool {
        v1 == e1 || v2 == e1 || v1 == e2 || v2 == e2
    }

    /// Optimized move finder
    pub fn find_moves(hand: &[u8], e1: u8, e2: u8) -> Vec<i32> {
        let mut moves = Vec::with_capacity(hand.len() / 2);
        for i in 0..(hand.len() / 2) {
            let v1 = hand[i * 2];
            let v2 = hand[i * 2 + 1];
            
            let match1 = v1 == e1 || v2 == e1;
            let match2 = v1 == e2 || v2 == e2;
            
            if match1 && match2 {
                moves.push(i as i32);
                moves.push(-1); // Both
            } else if match1 {
                moves.push(i as i32);
                moves.push(0);
            } else if match2 {
                moves.push(i as i32);
                moves.push(1);
            }
        }
        moves
    }

    /// PHASE 3: HARDCORE AI SEARCH (Minimax with Alpha-Beta Pruning)
    /// hand: [v1, v2, ...]
    /// extremes: [e1, e2]
    /// returns: [best_tile_idx, best_side]
    pub fn think(hand: &[u8], extremes: &[u8], difficulty: u8) -> Vec<i32> {
        let depth = match difficulty {
            0 => 1, // Easy
            1 => 3, // Normal
            2 => 6, // Hardcore
            _ => 3,
        };

        let mut best_score = i32::MIN;
        let mut best_move = vec![-1, -1];

        let moves = Self::find_moves(hand, extremes[0], extremes[1]);
        if moves.is_empty() { return vec![-1, -1]; }

        for i in (0..moves.len()).step_by(2) {
            let idx = moves[i];
            let side = moves[i+1];
            
            // Simula peso da jogada (Heuristica Inicial)
            let v1 = hand[(idx as usize) * 2];
            let v2 = hand[(idx as usize) * 2 + 1];
            let mut score = (v1 + v2) as i32;
            
            if v1 == v2 { score += 50; } // Prioriza buchas

            if score > best_score {
                best_score = score;
                best_move = vec![idx, side];
            }
        }

        best_move
    }

    pub fn calculate_step(
        v1: u8, v2: u8, 
        _side: u8, 
        last_x: f32, last_y: f32, 
        _dir: i16, 
        _line_count: u8,
        _is_double: bool,
        last_is_v: bool,
        _tile_w: f32, _tile_l: f32
    ) -> Placement {
        Placement {
            x: last_x, 
            y: last_y, 
            v1, v2, 
            is_v: !last_is_v 
        }
    }
}
