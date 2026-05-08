/* @ts-self-types="./domino_core_wasm.d.ts" */

export class GameLogic {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameLogicFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gamelogic_free(ptr, 0);
    }
    /**
     * @param {number} v1
     * @param {number} v2
     * @param {number} _side
     * @param {number} last_x
     * @param {number} last_y
     * @param {number} _dir
     * @param {number} _line_count
     * @param {boolean} _is_double
     * @param {boolean} last_is_v
     * @param {number} _tile_w
     * @param {number} _tile_l
     * @returns {Placement}
     */
    static calculate_step(v1, v2, _side, last_x, last_y, _dir, _line_count, _is_double, last_is_v, _tile_w, _tile_l) {
        const ret = wasm.gamelogic_calculate_step(v1, v2, _side, last_x, last_y, _dir, _line_count, _is_double, last_is_v, _tile_w, _tile_l);
        return Placement.__wrap(ret);
    }
    /**
     * Pure validation logic
     * @param {number} v1
     * @param {number} v2
     * @param {number} e1
     * @param {number} e2
     * @returns {boolean}
     */
    static can_play(v1, v2, e1, e2) {
        const ret = wasm.gamelogic_can_play(v1, v2, e1, e2);
        return ret !== 0;
    }
    /**
     * Optimized move finder
     * @param {Uint8Array} hand
     * @param {number} e1
     * @param {number} e2
     * @returns {Int32Array}
     */
    static find_moves(hand, e1, e2) {
        const ptr0 = passArray8ToWasm0(hand, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gamelogic_find_moves(ptr0, len0, e1, e2);
        var v2 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v2;
    }
    /**
     * PHASE 3: HARDCORE AI SEARCH (Minimax with Alpha-Beta Pruning)
     * hand: [v1, v2, ...]
     * extremes: [e1, e2]
     * returns: [best_tile_idx, best_side]
     * @param {Uint8Array} hand
     * @param {Uint8Array} extremes
     * @param {number} difficulty
     * @returns {Int32Array}
     */
    static think(hand, extremes, difficulty) {
        const ptr0 = passArray8ToWasm0(hand, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(extremes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gamelogic_think(ptr0, len0, ptr1, len1, difficulty);
        var v3 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v3;
    }
}
if (Symbol.dispose) GameLogic.prototype[Symbol.dispose] = GameLogic.prototype.free;

export class Placement {
    static __wrap(ptr) {
        const obj = Object.create(Placement.prototype);
        obj.__wbg_ptr = ptr;
        PlacementFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PlacementFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_placement_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get is_v() {
        const ret = wasm.__wbg_get_placement_is_v(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get v1() {
        const ret = wasm.__wbg_get_placement_v1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get v2() {
        const ret = wasm.__wbg_get_placement_v2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get x() {
        const ret = wasm.__wbg_get_placement_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get y() {
        const ret = wasm.__wbg_get_placement_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {boolean} arg0
     */
    set is_v(arg0) {
        wasm.__wbg_set_placement_is_v(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set v1(arg0) {
        wasm.__wbg_set_placement_v1(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set v2(arg0) {
        wasm.__wbg_set_placement_v2(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set x(arg0) {
        wasm.__wbg_set_placement_x(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set y(arg0) {
        wasm.__wbg_set_placement_y(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Placement.prototype[Symbol.dispose] = Placement.prototype.free;

export class Tile {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TileFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_tile_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get v1() {
        const ret = wasm.__wbg_get_tile_v1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get v2() {
        const ret = wasm.__wbg_get_tile_v2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set v1(arg0) {
        wasm.__wbg_set_tile_v1(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set v2(arg0) {
        wasm.__wbg_set_tile_v2(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} v1
     * @param {number} v2
     */
    constructor(v1, v2) {
        const ret = wasm.tile_new(v1, v2);
        this.__wbg_ptr = ret;
        TileFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Tile.prototype[Symbol.dispose] = Tile.prototype.free;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_9c31b086c2b26051: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./domino_core_wasm_bg.js": import0,
    };
}

const GameLogicFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gamelogic_free(ptr, 1));
const PlacementFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_placement_free(ptr, 1));
const TileFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_tile_free(ptr, 1));

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedInt32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('domino_core_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
