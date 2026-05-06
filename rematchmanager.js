/*
   ========================================================================
   REMATCHMANAGER.JS - GESTOR DE REVANCHE
   Gerencia a votacao e o inicio automatico de novas rodadas.
   ========================================================================
*/

window.RematchManager = {
    votes: {},

    request: () => {
        if (typeof window.Network !== 'undefined') {
            window.Network.request({ type: 'rematch_request', pIdx: window.myPlayerIdx });
        }
        window.Dashboard.setMessage("Votando pela revanche...");
    },

    receiveVote: (pIdx) => {
        window.RematchManager.votes[pIdx] = true;
        const totalVotes = Object.keys(window.RematchManager.votes).length;
        
        if (totalVotes >= 2) { // Exemplo: 2 pessoas ja iniciam a revanche
            window.Dashboard.setMessage("REVANCHE ACEITA!", "active");
            setTimeout(window.startRound, 1500);
            window.RematchManager.votes = {};
        }
    }
};
