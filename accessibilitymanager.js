/*
   ========================================================================
   ACCESSIBILITYMANAGER.JS - GESTOR DE ACESSIBILIDADE
   Permite ajustes personalizados para inclusao e legibilidade.
   ========================================================================
*/

window.AccessibilityManager = {
    init: function() {
        const settings = window.safeGetStorage('domino_a11y', { highContrast: false, fontSize: 16 });
        const a11yVal = settings.highContrast ? 'high-contrast' : '';
        document.documentElement.setAttribute('data-a11y', a11yVal);
        if (settings.fontSize) document.documentElement.style.fontSize = settings.fontSize + 'px';
        
        // Inicializa o leitor de tela se houver conteiner
        this.announcer = document.getElementById('a11y-announcer');
    },

    /**
     * Anuncia uma mensagem para leitores de tela usando aria-live.
     */
    announce: function(message) {
        if (!this.announcer) this.announcer = document.getElementById('a11y-announcer');
        if (this.announcer) {
            this.announcer.innerText = ''; // Limpa para forcar a leitura se for a mesma mensagem
            setTimeout(() => {
                this.announcer.innerText = message;
            }, 50);
        }
    },

    toggleHighContrast: function() {
        const settings = window.safeGetStorage('domino_a11y', { highContrast: false });
        settings.highContrast = !settings.highContrast;
        document.documentElement.setAttribute('data-a11y', settings.highContrast ? 'high-contrast' : '');
        window.safeSetStorage('domino_a11y', settings);
        
        const status = settings.highContrast ? 'Ativado' : 'Desativado';
        this.announce(`Alto contraste ${status}`);
    },

    setFontSize: function(size) {
        const settings = window.safeGetStorage('domino_a11y', { fontSize: 16 });
        settings.fontSize = size;
        document.documentElement.style.fontSize = size + 'px';
        window.safeSetStorage('domino_a11y', settings);
        this.announce(`Tamanho da fonte ajustado para ${size} pixels`);
    }
};

window.AccessibilityManager.init();
