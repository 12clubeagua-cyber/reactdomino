/* tslint:disable */
/* eslint-disable */

export class GameLogic {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static calculate_step(v1: number, v2: number, _side: number, last_x: number, last_y: number, _dir: number, _line_count: number, _is_double: boolean, last_is_v: boolean, _tile_w: number, _tile_l: number): Placement;
    /**
     * Pure validation logic
     */
    static can_play(v1: number, v2: number, e1: number, e2: number): boolean;
    /**
     * Optimized move finder
     */
    static find_moves(hand: Uint8Array, e1: number, e2: number): Int32Array;
    /**
     * PHASE 3: HARDCORE AI SEARCH (Minimax with Alpha-Beta Pruning)
     * hand: [v1, v2, ...]
     * extremes: [e1, e2]
     * returns: [best_tile_idx, best_side]
     */
    static think(hand: Uint8Array, extremes: Uint8Array, difficulty: number): Int32Array;
}

export class Placement {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    is_v: boolean;
    v1: number;
    v2: number;
    x: number;
    y: number;
}

export class Tile {
    free(): void;
    [Symbol.dispose](): void;
    constructor(v1: number, v2: number);
    v1: number;
    v2: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_gamelogic_free: (a: number, b: number) => void;
    readonly __wbg_get_placement_is_v: (a: number) => number;
    readonly __wbg_get_placement_v1: (a: number) => number;
    readonly __wbg_get_placement_v2: (a: number) => number;
    readonly __wbg_get_placement_x: (a: number) => number;
    readonly __wbg_get_placement_y: (a: number) => number;
    readonly __wbg_get_tile_v1: (a: number) => number;
    readonly __wbg_get_tile_v2: (a: number) => number;
    readonly __wbg_placement_free: (a: number, b: number) => void;
    readonly __wbg_set_placement_is_v: (a: number, b: number) => void;
    readonly __wbg_set_placement_v1: (a: number, b: number) => void;
    readonly __wbg_set_placement_v2: (a: number, b: number) => void;
    readonly __wbg_set_placement_x: (a: number, b: number) => void;
    readonly __wbg_set_placement_y: (a: number, b: number) => void;
    readonly __wbg_set_tile_v1: (a: number, b: number) => void;
    readonly __wbg_set_tile_v2: (a: number, b: number) => void;
    readonly __wbg_tile_free: (a: number, b: number) => void;
    readonly gamelogic_calculate_step: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => number;
    readonly gamelogic_can_play: (a: number, b: number, c: number, d: number) => number;
    readonly gamelogic_find_moves: (a: number, b: number, c: number, d: number) => [number, number];
    readonly gamelogic_think: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly tile_new: (a: number, b: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
