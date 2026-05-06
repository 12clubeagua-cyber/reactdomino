/*
   ========================================================================
   I18NMANAGER.JS - GESTOR DE INTERNACIONALIZACAO
   Gerencia traducoes e troca de idioma dinamicamente.
   ========================================================================
*/

window.I18nManager = {
    lang: window.safeGetStorage('domino_lang', 'pt'),
    dicts: {
        'pt': { 'start_title': 'domino', 'play': 'Jogar', 'settings': 'Configuracoes' },
        'en': { 'start_title': 'domino', 'play': 'Play', 'settings': 'Settings' },
        'es': { 'start_title': 'domino', 'play': 'Jugar', 'settings': 'Ajustes' }
    },

    setLang: (l) => {
        window.I18nManager.lang = l;
        window.safeSetStorage('domino_lang', l);
        window.I18nManager.apply();
    },

    apply: () => {
        const dict = window.I18nManager.dicts[window.I18nManager.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerText = dict[key];
        });
    }
};
