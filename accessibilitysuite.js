/*
   ========================================================================
   ACCESSIBILITYSUITE.JS - SUÍTE DE ACESSIBILIDADE
   Permite ajustes granulares de UI e movimento.
   ========================================================================
*/

window.AccessibilitySuite = {
    settings: JSON.parse(localStorage.getItem('domino_a11y_suite') || '{"reducedMotion": false, "uiScale": 1}'),

    apply: () => {
        if (window.AccessibilitySuite.settings.reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
        document.documentElement.style.setProperty('--ui-scale', window.AccessibilitySuite.settings.uiScale);
    },

    toggleMotion: () => {
        window.AccessibilitySuite.settings.reducedMotion = !window.AccessibilitySuite.settings.reducedMotion;
        localStorage.setItem('domino_a11y_suite', JSON.stringify(window.AccessibilitySuite.settings));
        window.AccessibilitySuite.apply();
    },

    setScale: (scale) => {
        window.AccessibilitySuite.settings.uiScale = scale;
        localStorage.setItem('domino_a11y_suite', JSON.stringify(window.AccessibilitySuite.settings));
        window.AccessibilitySuite.apply();
    }
};

window.AccessibilitySuite.apply();
