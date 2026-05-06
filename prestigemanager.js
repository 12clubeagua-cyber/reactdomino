/*
   ========================================================================
   PRESTIGEMANAGER.JS - GESTOR DE PRESTÍGIO
   Define e exibe emblemas baseados no nível do jogador.
   ========================================================================
*/

window.PrestigeManager = {
    badges: {
        1: { name: 'Novato', icon: '🌱' },
        2: { name: 'Bronze', icon: '🥉' },
        3: { name: 'Prata', icon: '🥈' },
        4: { name: 'Ouro', icon: '🥇' },
        5: { name: 'Platina', icon: '💎' }
    },

    getBadge: (level) => {
        return window.PrestigeManager.badges[level] || { name: 'Lenda', icon: '👑' };
    },

    renderBadge: (level) => {
        const badge = window.PrestigeManager.getBadge(level);
        return `<span title="${badge.name}" style="margin-left:5px;">${badge.icon}</span>`;
    }
};
