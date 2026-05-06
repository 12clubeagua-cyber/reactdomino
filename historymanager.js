/*
   ========================================================================
   HISTORYMANAGER.JS - GESTOR DE HISTÓRICO
   Persiste os resultados das partidas para análise posterior.
   ========================================================================
*/

window.HistoryManager = {
    STORAGE_KEY: 'domino_history',

    logMatch: function(scoreA, scoreB, result) {
        const history = window.safeGetStorage(window.HistoryManager.STORAGE_KEY, []);
        history.push({
            scoreA,
            scoreB,
            result,
            date: new Date().toLocaleString()
        });
        window.safeSetStorage(window.HistoryManager.STORAGE_KEY, JSON.stringify(history.slice(-20))); // Mantém os últimos 20
    },

    showUI: function() {
        const history = window.safeGetStorage(window.HistoryManager.STORAGE_KEY, []);
        let html = '<div class="glass" style="position:fixed; top:20%; left:10%; width:80%; padding:20px; z-index:3000;">';
        html += '<h2>Historico de Partidas</h2><ul>';
        history.reverse().forEach(match => {
            html += `<li>${match.date} | ${match.scoreA} x ${match.scoreB} - ${match.result}</li>`;
        });
        html += '</ul><button class="btn-side" onclick="document.querySelector(\'.glass\').remove()">Fechar</button></div>';
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    }
};
