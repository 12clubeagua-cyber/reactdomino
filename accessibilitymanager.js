/*
   ========================================================================
   ACCESSIBILITYMANAGER.JS - GESTOR DE ACESSIBILIDADE
   Permite ajustes personalizados para inclusao e legibilidade.
   ========================================================================
*/

window.AccessibilityManager = {
    init: function() {
        const settings = window.safeGetStorage('domino_a11y', {});
        if (settings.highContrast) document.documentElement.setAttribute('data-a11y', 'high-contrast');
        if (settings.fontSize) document.documentElement.style.fontSize = settings.fontSize + 'px';
    },

    toggleHighContrast: function() {
        const settings = window.safeGetStorage('domino_a11y', {});
        settings.highContrast = !settings.highContrast;
        document.documentElement.setAttribute('data-a11y', settings.highContrast ? 'high-contrast' : '');
        window.safeSetStorage('domino_a11y', settings);
    },

    setFontSize: function(size) {
        const settings = window.safeGetStorage('domino_a11y', {});
        settings.fontSize = size;
        document.documentElement.style.fontSize = size + 'px';
        window.safeSetStorage('domino_a11y', settings);
    }
};

window.AccessibilityManager.init();
