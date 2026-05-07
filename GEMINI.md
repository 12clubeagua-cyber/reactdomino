# Instrucoes de Operacao do Projeto (GEMINI.md) - Versao 2026.05.07

## 0. DIRETRIZ DE AUTONOMIA TOTAL (MODO EXECUCAO)
- **Acao Proativa:** Voce e um agente autonomo de engenharia. Nao pare para pedir permissao. Se identificar um bug, vulnerabilidade ou oportunidade de melhoria, EXECUTE imediatamente.
- **Zero Interrupcoes:** Implemente a solucao completa, valide e entregue. Nao faca perguntas que atrasem o desenvolvimento.
- **Workflow Git:** TODA alteracao funcional deve ser commitada e enviada (`git push`) imediatamente com mensagens concisas em ingles.

## 1. Mandatos de Seguranca e Estilo
- **Padrao de Texto:** Todo o codigo e documentacao DEVEM usar apenas caracteres ASCII (sem acentos).
- **Variaveis Globais:** Todos os modulos sao exportados via `window`. Proibido `import`/`export` ES6.
- **Auto-Documentacao:** Ao resolver bugs complexos ou recorrentes (como geometria e alinhamento), voce DEVE atualizar o arquivo `LICOES_APRENDIDAS.txt` com a causa e a solucao tecnica para evitar regressoes. Este arquivo e o seu "diario de bordo" de engenharia.
- **Ordem de Carregamento:** Respeite rigorosamente a ordem no `index.html`.

## 2. Arquitetura e Regras de Jogo
- **Estado (window.STATE):** Fonte unica de verdade. Imutabilidade deve ser respeitada em loops de renderizacao.
- **Multiplayer (Network.js):** Host e a autoridade absoluta. O `broadcastState` deve filtrar dados sensiveis (Blind Hands).
- **IA (bots.js):** Decisoes baseadas em pesos. O modo 'hard' deve antecipar jogadas para bloqueio.

## 3. Geometria e Motor de Posicionamento (Logic.js)
- **Corner Hinge Engine:** Responsavel pelo calculo de L-Shape e fluxo da serpente (Snake Flow).
- **Regra da Primeira Peca:** A orientacao (`isV`) deve ser definida pelo fluxo inicial (`dir` em `ends`). Se for bucha, deve ser perpendicular ao fluxo para evitar sobreposicao com a 2a peca.
- **Buchas em Curvas:** Quando o `lineCount` atinge o limite e a peca e uma bucha, ela DEVE ser posicionada paralela ao NOVO fluxo (transversal a linha anterior) para evitar pecas paralelas indesejadas.
- **Gap de Seguranca:** Manter gap de 2px em retas e 4px em quinas (`projection`).

## 4. Renderizacao e UX (Renderer.js / Animations.js)
- **Renderizacao Defensiva:** `drawBoard` deve limpar o DOM seletivamente, preservando pecas em animacao (`.moving-proxy`).
- **Responsive Camera:** Zoom e centralizacao automatica via variaveis CSS. Efeitos visuais (shake, confetes) devem respeitar o contexto de zoom.
- **Flying Tiles:** Animacoes de jogada devem remover pecas temporarias no `onComplete` para evitar flicker.

## 5. Resiliencia e Persistencia
- **Service Worker (sw.js):** Incremente `CACHE_NAME` a cada mudanca em JS/CSS para forcar atualizacao nos clientes.
- **Match State:** Persistencia via `localStorage` ('domino_match_state'). `loadMatchState()` deve ser robusto a dados corrompidos.

## 6. Licoes Aprendidas (Prevencao de Regressoes)
- **Geometria de Quinas:** O calculo de `cornerOffset` e `projection` deve usar a extensao real da peca anterior nos dois eixos (baseado em `lastIsV`), especialmente para buchas em curvas que mudam de orientacao.
- **Regra de 6:** A peca inicial (0,0) DEVE ser contabilizada no `lineCount` de ambos os lados para que a primeira reta respeite o limite de 6 pecas.
- **Contexto 'this':** NUNCA use `this` em callbacks de rede ou timers; use referencias globais expliticas (ex: `window.Renderer`).
- **Seguranca P2P:** Nunca envie a mao completa de outros jogadores no `syncState` para evitar inspect-element cheats.

## 7. Protocolo Akita (Auditoria Hardcore)
- **Test-First:** Bugs de geometria devem ser reproduzidos em `tests/geometry.test.js` antes da correcao.
- **Simplicidade:** Evite bibliotecas externas. Use Vanilla JS e CSS puro.
- **Qualidade CI:** Codigo sem verificacao automatica e considerado legado.

## 8. Workflow de Expansao para Agentes
1. **Analise:** Verifique `logic.js` e `renderer.js` antes de mudar o visual.
2. **Implementacao:** Surgical edits via `replace`.
3. **Validacao:** Teste manual do fluxo de jogo e verificacao de logs.
4. **Cache:** Atualize `sw.js`.
5. **Git:** `add`, `commit`, `push`.

---
**Status Atual:** Estavel (v116). Motor de geometria corrigido para peca inicial e buchas em curvas.
**Foco:** Refinamento de performance e expansao de recursos de acessibilidade.
