/*
   ========================================================================
   REPLAYMANAGER.JS - GESTOR DE HISTÓRICO E REPRODUÇÃO
   Registra o log das partidas e gerencia a navegação de reprodução.
   ========================================================================
*/

window.ReplayManager = {
    history: [],

    record: (type, data) => {
        window.ReplayManager.history.push({ type, data, timestamp: Date.now() });
    },

    clear: () => {
        window.ReplayManager.history = [];
    },

    play: async (data = null) => {
        const history = data || [...window.ReplayManager.history];
        if (history.length === 0) return;

        window.startRound();
        for (const event of history) {
            await new Promise(resolve => setTimeout(resolve, 800));
            if (event.type === 'play') {
                window.play(event.data.pIdx, event.data.tIdx, event.data.side);
            } else if (event.type === 'pass') {
                window.doPass(event.data.pIdx);
            }
        }
        window.Dashboard.setMessage("REPLAY FINALIZADO!");
    },

    getShareableLink: () => {
        const json = JSON.stringify(window.ReplayManager.history);
        const encoded = btoa(unescape(encodeURIComponent(json)));
        return `${window.location.origin}${window.location.pathname}?replay=${encoded}`;
    },

    loadFromUrl: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const replayData = urlParams.get('replay');
        if (replayData) {
            try {
                const decoded = JSON.parse(decodeURIComponent(escape(atob(replayData))));
                window.Dashboard.setMessage("CARREGANDO REPLAY...");
                setTimeout(() => window.ReplayManager.play(decoded), 2000);
            } catch (e) {
                console.error("Erro ao carregar replay:", e);
            }
        }
    }
};

