/*
   ========================================================================
   NEWSMANAGER.JS - GESTOR DE NOTICIAS
   Exibe novidades e avisos do sistema no lobby.
   ========================================================================
*/

window.NewsManager = {
    news: [
        { title: "Bem-vindo!", body: "O simulador de domino esta na versao 43." },
        { title: "Torneios", body: "Participe dos torneios e ganhe XP extra!" }
    ],

    showUI: () => {
        let html = '<div class="glass" style="position:fixed; top:20%; left:10%; width:80%; padding:20px; z-index:3000;">';
        html += '<h2>Noticias</h2>';
        window.NewsManager.news.forEach(n => {
            html += `<div><strong>${n.title}</strong><p>${n.body}</p></div><hr>`;
        });
        html += '<button class="btn-side" onclick="document.querySelector(\'.glass\').remove()">Fechar</button></div>';
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    }
};
