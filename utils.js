/* 
   ========================================================================
   UTILS.JS - UTILS GERAIS
   ======================================================================== 
*/

/**
 * Persistencia Segura (Anti-Crash)
 */
window.safeSetStorage = function(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.error("Erro ao salvar localStorage (Storage full?):", e);
    }
};

window.safeGetStorage = function(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error("Erro ao ler localStorage:", e);
        return defaultValue;
    }
};

const pipsCache = {};

window.getPips = function(val, color) {
    const cacheKey = `${val}-${color || 'default'}`;
    if (pipsCache[cacheKey]) return pipsCache[cacheKey];

    if (val === 0) return ''; // Peca branca

    const layouts = {
        1: [5],
        2: [1, 9],
        3: [1, 5, 9],
        4: [1, 3, 7, 9],
        5: [1, 3, 5, 7, 9],
        6: [1, 3, 4, 6, 7, 9]
    };

    const activePips = layouts[val] || [];
    let html = '';
    const style = color ? `style="background:${color}"` : '';

    for (let i = 1; i <= 9; i++) {
        if (activePips.includes(i)) {
            html += `<div class="pip" ${style}></div>`;
        } else {
            html += `<div></div>`;
        }
    }
    
    pipsCache[cacheKey] = html;
    return html;
};