use wasm_bindgen::prelude::*;

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
pub struct GameLogic;

#[wasm_bindgen]
impl GameLogic {
    /// Verifica se uma peça pode ser jogada em uma das extremidades.
    pub fn can_play(tile: Tile, extremes: &[u8]) -> bool {
        if extremes.is_empty() {
            return true;
        }
        tile.v1 == extremes[0] || tile.v2 == extremes[0] || 
        tile.v1 == extremes[1] || tile.v2 == extremes[1]
    }

    /// Retorna o valor que ficará na nova extremidade após a jogada.
    pub fn get_new_extreme(tile: Tile, current_extreme: u8) -> i32 {
        if tile.v1 == current_extreme {
            tile.v2 as i32
        } else if tile.v2 == current_extreme {
            tile.v1 as i32
        } else {
            -1 // Jogada inválida
        }
    }

    /// Lógica de pontuação baseada na soma das peças (Hardcore Strategy)
    pub fn calculate_hand_score(hand: &[u8]) -> u32 {
        // Assume hand is [v1, v2, v1, v2, ...]
        hand.iter().map(|&x| x as u32).sum()
    }
}
