/*
   ========================================================================
   TUTORIALMANAGER.JS - ASSISTENTE DE INTEGRAÇÃO
   Guia novos jogadores com dicas contextuais.
   ========================================================================
*/

window.TutorialManager = {
    STORAGE_KEY: 'domino_tutorial_done',

    show: (text, elementId) => {
        if (localStorage.getItem(window.TutorialManager.STORAGE_KEY)) return;

        const el = document.getElementById(elementId);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const tip = document.createElement('div');
        tip.className = 'glass thinking-bubble';
        tip.innerText = text;
        tip.style.cssText = `position:fixed; top:${rect.bottom + 10}px; left:${rect.left}px; z-index:5000; padding:10px; transform:none;`;
        
        document.body.appendChild(tip);
        setTimeout(() => tip.remove(), 4000);
    },

    complete: () => {
        localStorage.setItem(window.TutorialManager.STORAGE_KEY, 'true');
    }
};
