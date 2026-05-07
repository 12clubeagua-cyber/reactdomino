# CONHECIMENTO TECNICO E PESQUISA - REACTDOMINO (2026)

Este documento registra o conhecimento tecnico, pesquisas no GitHub e melhores praticas do mercado aplicadas ao projeto.

## 1. INTELIGENCIA ARTIFICIAL (IA) AVANCADA
Baseado na analise de projetos de referencia (ex: manalejandro/dominoes), a IA foi elevada do nivel basico (pesos de pecas) para o nivel estrategico.

- **Bloqueio Estrategico:** A IA agora monitora as falhas dos oponentes. Se um jogador passou em um naipe (ex: 4), os bots priorizam manter as pontas do tabuleiro com esse valor para forcar novos passes.
- **Minimax Simplificado:** Uso de pesos dinamicos que variam conforme o estagio do jogo (early game foca em diversidade, end game foca em descartar pontos altos).
- **Personalidades:** Implementacao de comportamentos distintos (Aggressive, Defensive, Random) que afetam a escolha da jogada.

## 2. PERFORMANCE NATIVA (BEST PRACTICES 2026)
Pesquisas em documentacoes modernas (MDN/WebDev 2026) levaram a implementacao de:

- **Particle Pooling:** Em vez de instanciar elementos DOM para cada faisca/particula, o sistema reutiliza objetos de um pool global. Isso elimina o "GC Jank" (engasgos do coletor de lixo).
- **O(1) Memory Lookup:** A memoria dos bots para pecas jogadas foi migrada de busca em arrays (O(N)) para objetos `Set` (O(1)), garantindo latencia zero mesmo em mesas complexas.
- **Fixed Timestep Animation:** O motor de animacao (`animations.js`) usa um Delta Time fixo para garantir que a suavidade seja consistente em telas de 60Hz, 120Hz ou 240Hz.

## 3. ARQUITETURA DE DADOS
Inspirado por sistemas ECS (Entity Component System):

- **Data-Oriented State:** O `window.STATE` e a fonte unica de verdade. Toda a interface e derivada de uma "snapshot" do estado, facilitando a sincronizacao multiplayer.
- **Zero-Allocation Loops:** Minimizacao da criacao de objetos dentro de loops de renderizacao para manter a memoria estável.

## 4. REFERENCIAS DE MERCADO (GITHUB)
Principais projetos analisados para refinamento:
1. **Dominoes-Online (Next.js/Canvas):** Inspirou a logica de validacao de quinas.
2. **Dominoes-Game-Solver (Python/Minimax):** Base para as heuristicas de bloqueio.
3. **NodeDomino (Socket.io):** Referencia para o protocolo de mensagens P2P resiliente.

## 5. ACESSIBILIDADE (A11Y)
Conforme diretrizes WCAG 2.2 de 2026:
- **ARIA Live Regions:** Uso do `announcer` para narrar eventos de jogo para deficientes visuais.
- **Keyboard Parity:** 100% das acoes (escolher lado, jogar, emote) sao executaveis via teclado.

---
*Documento gerado e mantido pelo Gemini CLI - Maio de 2026.*
