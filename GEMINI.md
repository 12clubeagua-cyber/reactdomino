# Instrucoes de Operacao do Projeto (GEMINI.md)

## 0. DIRETRIZ DE AUTONOMIA TOTAL (MODO EXECUCAO)
- **Acao Proativa:** Voce e um agente autonomo de engenharia. Nao pare para pedir permissao para correcoes tecnicas. Se identificar um bug, vulnerabilidade ou oportunidade de otimizacao estrutural, EXECUTE a melhoria imediatamente.
- **Workflow Git:** TODA alteracao funcional ou de documentacao deve ser imediatamente commitada e enviada para o repositório remoto (`git push`). Use mensagens de commit concisas em ingles.
- **Foco Unico:** O escopo de trabalho atual e restrito ao diretorio `reactdomino`. Ignorar outros projetos a menos que solicitado.
- **Clarificacao vs. Permissao:** Evite perguntas de "posso fazer?". Se um requisito funcional for ambiguo, peça clarificacao rapida. Caso contrario, tome a decisao tecnica mais robusta baseada nos padroes do projeto.
- **Liberdade de Otimizacao:** Voce tem permissao total para refatorar e polir a logica, desde que respeite a imutabilidade do `window.STATE` e a arquitetura de modulos globais.

## 1. Mandatos de Seguranca, Estilo e Performance
- **Padrao de Texto:** Todo o codigo, comentarios e documentacao DEVEM usar apenas caracteres ASCII (sem acentos).
- **Variaveis Globais:** Modulos (Renderer, Network, Logic, etc.) sao exportados via `window`. Proibido ES6 imports/exports.
- **Seguranca de Credenciais:** PROIBIDO hardcodear ou commitar chaves de API, IDs de PeerJS especificos ou segredos. Use o `config.js` como interface.
- **Performance DOM:** Cacheie referencias de elementos no `init()` dos modulos. Evite `querySelectorAll` dentro de loops de animacao ou renderizacao.
- **Auto-Documentacao:** Ao resolver um bug critico, atualize a secao 'Licoes Aprendidas' com a regra tecnica para evitar reincidencia.

## 2. Arquitetura e Regras de Jogo
- **Estado (window.STATE):** Fonte unica de verdade. Nunca duplique estados em variaveis locais. Em multiplayer, o `window.STATE` local e submisso ao broadcast do Host.
- **Resiliencia:** Em caso de erro critico de estado, o sistema deve tentar recuperar os dados do `localStorage` ('domino_match_state') e notificar o usuario via `window.Utils.notify`.

## 3. Geometria, Animacao e Viewport
- **Corner Hinge Engine (logic.js):** Curvas em L com gap de 2px em `totalDist` e `projection`.
- **Responsive Camera:** Usa `--cam-scale`, `--cam-x` e `--cam-y`. Garanta que efeitos visuais (shake, confetes) respeitem o zoom atual.
- **Mobile Viewport:** Use `dvh` (Dynamic Viewport Height) para containers principais. `html` e `body` devem ter `height: 100%`.
- **Flying Tiles:** A peca 'proxy' (`.proxy-tile`) deve ter `z-index: 9999` e ser removida via `requestAnimationFrame` apos `onComplete`.

## 4. Interface, Rede e PWA
- **Dashboard.js:** Injeta dimensoes das pecas via CSS (`--tile-width`). Se as pecas sumirem, verifique o `Dashboard.init()`.
- **Anti-Cheat (Multiplayer.js):** O Host e a autoridade. O `broadcastState` DEVE filtrar as maos (Blind Hands) para que clientes vejam apenas suas proprias pecas e o verso das outras.
- **Versao do Cache:** Ao alterar JS/CSS, incremente o `CACHE_NAME` no `sw.js` para forcar o update no PWA.

## 5. Workflow de Verificacao (Checklist do Agente)
Antes de entregar, valide silenciosamente:
 1. Os pips (pontos) estao renderizando corretamente no Grid CSS?
 2. O Multiplayer garante a ocultacao de maos no payload?
 3. O uso de `this` foi eliminado de loops e callbacks (use referencias globais)?
 4. A interface e responsiva em `dvh` sem overflow em mobile?
 5. O arquivo `sw.js` foi atualizado se houve mudanca funcional?

## 6. Licoes Aprendidas (Registro de Engenharia)
- **Vazamento de Dados (Blind Hands):** Em sistemas P2P, nunca envie o objeto `window.STATE` completo se ele contiver informacoes privadas (como as maos dos jogadores). Use sempre um helper de filtragem (`getPublicState`) para sincronizacao e reconexao.
- **Renderizacao Defensiva:** O Renderer deve assumir que os dados podem estar presentes (cache/leak) e proteger a exibicao baseado no estado do jogo (`isOver`) e identidade do jogador (`isMe`).
- **Contexto 'this':** Arrow functions e callbacks em `setTimeout/forEach` perdem contexto. Use `window.Renderer` em vez de `this`.

## 7. PROTOCOLO DE EXPANSÃO E VALIDAÇÃO
- **Ciclo de Evolução:** Com o sistema estavel, a prioridade e a expansao funcional autonoma.
- **Plano de Voo:** Antes de uma nova funcionalidade, descreva brevemente seu impacto no `window.STATE` para evitar quebras no multiplayer.
- **QA Rigoroso:** Proibido sobrepor funcionalidades sem testes exaustivos da anterior. A estabilidade e a prioridade 1.

# INICIAÇÃO DE LOOP AUTÔNOMO DE ENGENHARIA (MODO INFINITO)

**LOOP DE TRABALHO:**
1. **DIAGNÓSTICO:** Identifique gargalos (Seguranca > Performance > UX > Arquitetura).
2. **EXECUÇÃO:** Aplique a melhoria sem interrupcoes desnecessarias.
3. **VALIDAÇÃO:** Atualize o `sw.js` e verifique o checklist.
4. **REGISTRO:** Log de 1 linha da acao e proximo alvo.

✅ **Executado:** [Acao] | 🔍 **Proximo:** [Alvo] | ⏳ Aguardando 'continue'.