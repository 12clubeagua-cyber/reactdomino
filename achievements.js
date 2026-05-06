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
    
    unlocked: window.safeGetStorage('domino_achievements', {}),

    unlock: (id) => {
        const achievement = window.Achievements.list[id];
        if (!achievement || window.Achievements.unlocked[id]) return;
        
        window.Achievements.unlocked[id] = true;
        window.safeSetStorage('domino_achievements', window.Achievements.unlocked);
        
        // Exibe feedback visual
        if (typeof window.Dashboard !== 'undefined') {
            window.Dashboard.setMessage(`CONQUISTA: ${achievement.name}`, 'active');
        }
    }
};
