/*
   ========================================================================
   THEMEMANAGER.JS - GESTÃO DE TEMAS VISUAIS
   ========================================================================
*/

window.ThemeManager = {
    themes: ['dark', 'light', 'vintage'],
    
    init: function() {
        const savedTheme = localStorage.getItem('domino_theme') || 'dark';
        window.ThemeManager.apply(savedTheme);
    },

    apply: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('domino_theme', theme);
    },

    promptChange: function() {
        const choice = prompt("Escolha o tema (dark, light, vintage):", localStorage.getItem('domino_theme') || 'dark');
        if (choice && window.ThemeManager.themes.includes(choice)) {
            window.ThemeManager.apply(choice);
        }
    }
};

window.ThemeManager.init();
