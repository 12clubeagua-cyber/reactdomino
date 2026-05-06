/*
   ========================================================================
   THEMEMANAGER.JS - GESTÃO DE TEMAS VISUAIS
   ========================================================================
*/

window.ThemeManager = {
    themes: ['dark', 'light', 'vintage'],
    init: function() {
        const savedTheme = window.safeGetStorage('domino_theme', 'dark');
        window.ThemeManager.apply(savedTheme);
    },

    apply: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        window.safeSetStorage('domino_theme', theme);
    },

    prompt: function() {
        const choice = prompt("Escolha o tema (dark, light, vintage):", window.safeGetStorage('domino_theme', 'dark'));
        if (choice) window.ThemeManager.apply(choice);
    }
            window.ThemeManager.apply(choice);
        }
    }
};

window.ThemeManager.init();
