/**
 * REPRO_OPTION3.JS
 * Script de teste visual para validar as melhorias da Opção 3.
 */

window.testVisualJuice = function() {
    console.log("TEST: Iniciando bateria de testes visuais (Opção 3)...");

    // 1. Teste de Aura de Match Point
    console.log("TEST: Ativando Aura de Match Point (Simulação de 85 pontos)...");
    window.STATE.score = [85, 40];
    window.Renderer.drawHands(); // Deve ativar a aura no #game-area

    // 2. Teste de Reações dos Bots
    console.log("TEST: Disparando reações emocionais nos bots...");
    if (typeof window.botReact === 'function') {
        window.botReact(1, 'blocked');
        setTimeout(() => window.botReact(2, 'double_six'), 500);
        setTimeout(() => window.botReact(3, 'win_round'), 1000);
    }

    // 3. Teste de Partículas de Impacto
    console.log("TEST: Gerando partículas de impacto no centro da mesa...");
    if (typeof window.spawnImpactParticles === 'function') {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        window.spawnImpactParticles(centerX, centerY, true); // Bucha (mais partículas)
        setTimeout(() => window.spawnImpactParticles(centerX + 50, centerY, false), 500); // Normal
    }

    // 4. Teste de Confetes (Final de jogo)
    console.log("TEST: Disparando confetes de vitória...");
    if (typeof window.spawnConfetti === 'function') {
        window.spawnConfetti();
    }

    console.log("TEST: Verifique se as peças na mão possuem inclinação isométrica e sombras 3D.");
};

// Auto-executa após 2 segundos para dar tempo do jogo carregar se for injetado
setTimeout(window.testVisualJuice, 2000);
