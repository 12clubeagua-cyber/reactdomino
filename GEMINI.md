# Instrucoes de Operacao do Projeto (GEMINI.md)

## 0. DIRETRIZ DE AUTONOMIA TOTAL (MODO EXECUCAO)
- **Acao Proativa:** Voce e um agente autonomo de engenharia. Nao pare para pedir permissao, opiniao ou confirmacao. Se identificar um bug, vulnerabilidade de rede ou oportunidade clara de polimento/melhoria estrutural, EXECUTE a correcao ou refatoracao imediatamente e entregue o codigo final.
- **Zero Interrupcoes:** E estritamente proibido terminar respostas com perguntas limitantes. Apenas implemente a melhoria, explique o que foi resolvido e forneca o codigo.
- **Liberdade de Otimizacao:** Voce tem permissao total para refatorar e polir a logica, desde que respeite rigorosamente as regras de arquitetura globais e a imutabilidade do `window.STATE`.
- **Workflow Git:** TODA alteracao funcional ou de documentacao deve ser imediatamente commitada e enviada para o repositorio remoto (`git push`). Use mensagens de commit concisas em ingles.

## 1. Mandatos de Seguranca e Estilo
- **Padrao de Texto:** Todo o codigo, comentarios, strings de log e documentacao DEVEM usar apenas caracteres ASCII. Proibido o uso de acentos ou caracteres especiais.
- **Variaveis Globais:** Todos os modulos (Renderer, Network, Logic, etc.) e o estado (STATE) sao exportados via `window`. Proibido o uso de imports/exports de ES6.
- **Ordem de Carregamento:** Respeite a ordem dos scripts no `index.html`. Modulos base (config, state, names, utils) devem vir primeiro.
- **Seguranca de Credenciais:** PROIBIDO hardcodear ou commitar chaves de API, IDs de PeerJS especificos ou segredos. Use o `config.js` como interface.
- **Auto-Documentacao:** Ao resolver um bug complexo, atualize a secao 'Licoes Aprendidas' deste arquivo com a regra tecnica adotada.

## 2. Arquitetura e Regras de Jogo
- **Estado (window.STATE):** Fonte unica de verdade. Nunca duplique estados em variaveis locais. Em multiplayer, o `window.STATE` local e submisso ao broadcast do Host.
- **Inicio de Partida (Referee.js):** Na 1a rodada, Bucha de Seis (6-6) comeca. Nas demais, o vencedor da rodada anterior comeca.
- **Jogo Trancado (Referee.js):** Se ninguem tiver jogada, ganha a dupla com a MENOR soma de pontos nas maos.
- **IA (bots.js):** Decisoes usam pesos (`calculateWeight`). Modo 'hard' simula a proxima jogada do oponente para aplicar bloqueios.

## 3. Geometria, Animacao e Viewport
- **Corner Hinge Engine (logic.js):** Calculo em `calculateTilePlacement` define curvas em L. Respeite o gap de 2px em `totalDist` e `projection`.
- **Responsive Camera (animations.js):** Zoom e centralizacao via `--cam-scale`, `--cam-x` e `--cam-y`. Garanta que efeitos visuais (shake, confetes) respeitem o zoom atual.
- **Visual Juice:** Efeitos 'shake', 'thinking-bubble' e confetes respeitam o contexto de camera.
- **Flying Tiles:** Remover peca 'proxy' (`.proxy-tile`) em `animateTile` via `requestAnimationFrame` apos `onComplete` para evitar flicker.
- **Viewport Mobile:** Use `dvh` (Dynamic Viewport Height) para containers principais. `html` e `body` devem ter `height: 100%`. Use `min-height: 0` em containers flexiveis para evitar overflow.

## 4. Interface, Rede e Resiliencia
- **Dashboard.js:** Gerencia placar e nomes. Depende de `Dashboard.init()` para injetar dimensoes das pecas via CSS (`--tile-width`).
- **Rede e Anti-Cheat (Multiplayer.js):** Host e autoridade absoluta. O `broadcastState` filtra as maos (Blind Hands) para evitar trapacas. Host DEVE validar matematicamente (`getMoves`) qualquer `play_request`.
- **Persistencia (FlowUI.js):** Estado salvo no `localStorage` sob a chave `'domino_match_state'`. Use `loadMatchState()` para retomar.
- **PWA e Cache:** Service Worker (`sw.js`). Alterou JS/CSS? Incremente o `CACHE_NAME` no `sw.js`.

## 5. Workflow de Verificacao Interna (Checklist)
1. Pips renderizando via CSS Grid?
2. Curvas mantem gap de 2px?
3. Multiplayer garante Ocultacao de Maos (Blind Hands) no payload P2P?
4. Baniu o `this` de loops/callbacks (use referencias globais)?
5. Interface usa `dvh` e `min-height: 0`?
6. O arquivo `sw.js` foi atualizado se houve mudanca funcional?

## 6. Licoes Aprendidas (Prevencao de Bugs)
- **Contexto 'this' em Callbacks:** NUNCA use `this` em timers ou eventos. Use referencia global (ex: `window.Renderer`).
- **Sintaxe em Arquivos Grandes:** Evite duplicacoes e blocos "fantasmas" ao final dos arquivos.
- **Visibilidade de Pips:** Destaque `.playable` usa bordas douradas e sombras, sem brilhos internos.
- **Vazamento de Dados (Blind Hands):** Nunca envie o `window.STATE` completo se contiver maos privadas. Use `getPublicState`.
- **Renderizacao Defensiva:** `Renderer.drawBoard` deve limpar pecas antigas (`.tile:not(.moving-proxy)`) para evitar fantasmas.
- **Seguranca de Acesso a Objetos:** Sempre verifique a existencia de uma chave (ex: `Achievements.list[id]`) antes de acessar suas propriedades para evitar erros de 'undefined'.
- **Estado de Atributos DOM:** Ao desativar recursos via atributos `data-*`, defina o valor como vazio ou remova-o explicitamente em vez de apenas ignorar a atualizacao.
- **Regressao e Auditoria:** Bugs complexos devem ser validados com scripts de teste unitario dedicados (`tests/*.test.js`) sob o Protocolo Akita.

# PROTOCOLO DE EXPANSAO E VALIDACAO
- **Ciclo de Evolucao:** Estabilidade (v6+) -> Expansao Funcional Autonoma.
- **QA Rigoroso:** Proibido sobrepor funcionalidades sem testes exaustivos da anterior.

## 8. Protocolo Akita (Hardcore Engineering)
- **Skill Ativa:** Use `activate_skill('akita-auditor')` para correcoes criticas e auditorias.
- **Test-First:** Todo bug fix DEVE comecar com um teste de reproducao que falha.
- **Anti-Hype:** Priorize simplicidade e bibliotecas nativas. Evite refatoracoes puramente esteticas.
- **Qualidade CI:** Codigo que nao pode ser verificado automaticamente e considerado legado.

# INICIACAO DE LOOP AUTONOMO DE ENGENHARIA (MODO INFINITO)
1. **DIAGNOSTICO SILENCIOSO:** Procure gargalos (Seguranca P2P > Performance > UX/UI > Arquitetura).
2. **EXECUCAO DIRETA:** Implemente sem pedir permissao.
3. **ATUALIZACAO DE CACHE:** Incremente `CACHE_NAME` no `sw.js`.
4. **DECLARACAO DE CONCLUSAO:**
   - " **Executado:** [Resumo de 1 linha]"
   - " **Proximo Alvo:** [Arquivo/Bug alvo]"
   - " Aguardando comando 'continue'."
