/* 
   ========================================================================
   CONFIG.JS - CONFIGURACOES GERAIS E CONSTANTES (VERSAO BLINDADA)
   Centraliza todos os parametros de equilibrio, visual e audio do jogo.
   Utiliza Object.freeze para garantir a imutabilidade dos dados globais.
   ======================================================================== 
*/

window.CONFIG = Object.freeze({
  
    // 1. COMPORTAMENTO DOS BOTS (IA)
    BOT: {
        MIN_DELAY: 600,         // Aumentado levemente para parecer mais humano
        MAX_DELAY: 1200,        // Da tempo do jogador ler o que o bot fez
        THINKING_MSG: " PENSANDO..."
    },

    // 2. REGRAS E PROPORCOES DO JOGO
    GAME: {
        // Dimensoes Fisicas das Pecas
        TILE_W: 40,            // Largura (lado curto) - Aumentado para visibilidade
        TILE_L: 80,            // Comprimento (lado longo) - Aumentado para visibilidade
        
        // Tempos de Fluxo (UX)
        RESULT_DISPLAY_TIME: 3, // Exibicao do placar final (segundos)
        PASS_DISPLAY_TIME: 1200, // Tempo do brilho de "Passou a vez"
        START_DELAY: 800,       // Pausa para o cerebro processar a mao nova
        
        // Camera e Tabuleiro (Snake)
        SNAKE_MAX_SCALE: 2.5,   // Permite zoom maior para dispositivos mobile
        
        /* 
           AJUSTE DE CURVA:
           Retirado limitador de 6 pecas por linha.
        */
        MAX_VERT: 12,            
        MAX_HORIZ: 12            
    },

    // 3. SINTESE DE AUDIO (WEB AUDIO API)
    AUDIO: {
        CLACK_FREQ: 800,       // Frequencia do impacto (agudo)
        PASS_FREQ: 220,        // Frequencia do passe (mais grave/alerta)
        DUR: 0.08              // Bipes mais curtos soam mais "secos" e profissionais
    }
});