/*
   ========================================================================
   POWERUPSPAWNER.JS - GERADOR DE POWER-UPS NO TABULEIRO
   Controla o aparecimento de modificadores táticos na mesa.
   ========================================================================
*/

window.PowerupSpawner = {
    spawnInterval: 5, // A cada 5 jogadas

    spawn: () => {
        if (!window.STATE || !window.STATE.positions.length) return;
        
        // Escolhe um ponto aleatório do tabuleiro (simulado)
        const randomIndex = Math.floor(Math.random() * window.STATE.positions.length);
        const position = window.STATE.positions[randomIndex];
        
        const powerup = {
            id: Date.now(),
            type: ['DOUBLE_POINTS', 'SKIP_TURN'][Math.floor(Math.random() * 2)],
            pos: position
        };
        
        window.STATE.powerups.push(powerup);
        window.Dashboard.setMessage("UM POWER-UP APARECEU!", "active");
    }
};
