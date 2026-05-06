/*
   ========================================================================
   RANKMANAGER.JS - GESTOR DE RANKING LOCAL
   Mantem o historico dos 10 melhores resultados.
   ========================================================================
*/

window.RankManager = {
    STORAGE_KEY: 'domino_ranking',
    LIMIT: 10,

    get: () => {
        return window.safeGetStorage(window.RankManager.STORAGE_KEY, []);
    },

    add: (playerName, score) => {
        const ranking = window.RankManager.get();
        ranking.push({ name: playerName, score: score, date: new Date().toLocaleDateString() });
        
        // Ordena por maior pontuacao
        ranking.sort((a, b) => b.score - a.score);
        
        // Mantem apenas o limite
        const newRanking = ranking.slice(0, window.RankManager.LIMIT);
        window.safeSetStorage(window.RankManager.STORAGE_KEY, JSON.stringify(newRanking));
    },

    showUI: () => {
        const ranking = window.RankManager.get();
        let html = '<div class="glass" style="position:fixed; top:20%; left:10%; width:80%; padding:20px; z-index:3000;">';
        html += '<h2>Top 10 Jogadores</h2><ol>';
        ranking.forEach(r => {
            html += `<li>${r.name}: ${r.score} pts (${r.date})</li>`;
        });
        html += '</ol><button class="btn-side" onclick="document.querySelector(\'.glass\').remove()">Fechar</button></div>';
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    }
};
