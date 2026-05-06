/*
   ========================================================================
   TABLESKINMANAGER.JS - GESTÃO DE SKINS DE MESA
   ========================================================================
*/

window.TableSkinManager = {
    skins: ['default', 'table-felt', 'table-wood', 'table-marble'],
    
    init: function() {
        const savedSkin = localStorage.getItem('domino_skin') || 'default';
        window.TableSkinManager.apply(savedSkin);
    },

    apply: function(skin) {
        const area = document.getElementById('game-area');
        if (!area) return;
        
        // Remove skins anteriores
        window.TableSkinManager.skins.forEach(s => area.classList.remove(s));
        
        // Aplica a nova skin
        if (skin !== 'default') {
            area.classList.add(skin);
        }
        localStorage.setItem('domino_skin', skin);
    },

    promptChange: function() {
        const choice = prompt("Escolha a skin da mesa (default, table-felt, table-wood, table-marble):", localStorage.getItem('domino_skin') || 'default');
        if (choice && window.TableSkinManager.skins.includes(choice)) {
            window.TableSkinManager.apply(choice);
        }
    }
};

window.TableSkinManager.init();
