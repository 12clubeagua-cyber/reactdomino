/*
   ========================================================================
   POWERUPENGINE.JS - MOTOR DE POWER-UPS
   Gerencia a ativação e efeitos de modificadores de partida.
   ========================================================================
*/

window.PowerupEngine = {
    activeEffects: [],

    spawn: (boardPosition) => {
        // Lógica de spawn do power-up na mesa
        const powerup = {
            id: Math.random().toString(36).substr(2, 9),
            type: ['PEEK', 'SKIP', 'DOUBLE'][Math.floor(Math.random() * 3)],
            pos: boardPosition
        };
        window.STATE.powerups.push(powerup);
    },

    activate: (type, targetPIdx) => {
        // Aplica o efeito no motor do jogo
        if (type === 'PEEK') {
            window.Renderer.drawHands(true);
            setTimeout(() => window.Renderer.drawHands(false), 3000);
        }
        window.Dashboard.setMessage(`POWER-UP: ${type}!`, 'active');
    }
};
