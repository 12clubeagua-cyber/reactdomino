/*
   ========================================================================
   ACHIEVEMENTS.JS - SISTEMA DE CONQUISTAS E BADGES
   Monitora eventos do jogo para premiar o jogador.
   ========================================================================
*/

window.Achievements = {
    list: {
        'FIRST_WIN': { name: 'Primeira Vitoria', desc: 'Venceu sua primeira partida!' },
        'SPEEDY': { name: 'Velocista', desc: 'Jogou em menos de 2 segundos!' }
    },
    
    unlocked: JSON.parse(localStorage.getItem('domino_achievements') || '{}'),

    unlock: (id) => {
        if (window.Achievements.unlocked[id]) return;
        
        window.Achievements.unlocked[id] = true;
        localStorage.setItem('domino_achievements', JSON.stringify(window.Achievements.unlocked));
        
        // Exibe feedback visual
        const achievement = window.Achievements.list[id];
        if (typeof window.Dashboard !== 'undefined') {
            window.Dashboard.setMessage(`CONQUISTA: ${achievement.name}`, 'active');
        }
    }
};
