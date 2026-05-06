/*
   ========================================================================
   TILESKINMANAGER.JS - GESTOR DE SKINS DE PEÇAS
   Gerencia a personalização visual dos dominós.
   ========================================================================
*/

window.TileSkinManager = {
    skins: ['default', 'wood-grain', 'carbon-fiber', 'marble-tile'],
    
    init: function() {
        const savedSkin = window.safeGetStorage('domino_tile_skin', 'default');
        window.TileSkinManager.apply(savedSkin);
    },

    apply: function(skin) {
        // Aplica a classe skin ao body para uso via CSS
        document.body.setAttribute('data-tile-skin', skin);
        window.safeSetStorage('domino_tile_skin', skin);
    }
};

window.TileSkinManager.init();
