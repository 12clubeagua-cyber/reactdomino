/* tslint:disable */
/* eslint-disable */

export class GameLogic {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Lógica de pontuação baseada na soma das peças (Hardcore Strategy)
     */
    static calculate_hand_score(hand: Uint8Array): number;
    /**
     * Verifica se uma peça pode ser jogada em uma das extremidades.
     */
    static can_play(tile: Tile, extremes: Uint8Array): boolean;
    /**
     * Retorna o valor que ficará na nova extremidade após a jogada.
     */
    static get_new_extreme(tile: Tile, current_extreme: number): number;
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
    readonly __wbg_get_tile_v1: (a: number) => number;
    readonly __wbg_get_tile_v2: (a: number) => number;
    readonly __wbg_set_tile_v1: (a: number, b: number) => void;
    readonly __wbg_set_tile_v2: (a: number, b: number) => void;
    readonly __wbg_tile_free: (a: number, b: number) => void;
    readonly gamelogic_calculate_hand_score: (a: number, b: number) => number;
    readonly gamelogic_can_play: (a: number, b: number, c: number) => number;
    readonly gamelogic_get_new_extreme: (a: number, b: number) => number;
    readonly tile_new: (a: number, b: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
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
