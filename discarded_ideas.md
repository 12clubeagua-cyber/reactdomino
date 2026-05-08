# RECURSOS E IDEIAS DESCARTADAS (NUNCA IMPLEMENTAR)

Este documento registra decisoes arquiteturais de EXCLUSAO para evitar desperdicio de tempo e desvio do foco principal do projeto.

## 1. Modos de Jogo Alternativos
- **Status:** DESCARTADO DEFINITIVAMENTE (2026-05-08)
- **Motivo:** O projeto foca exclusivamente na experiencia pura e classica do domino (Double-Six, 4 jogadores em duplas). 
- **O que nao implementar:** Domino de 3, Mexican Train, Muggins, ou qualquer variacao que altere as regras base de pontuacao e encaixe.

## 2. Bibliotecas Externas Pesadas
- **Status:** DESCARTADO
- **Motivo:** Protocolo Akita exige Vanilla JS.
- **O que nao implementar:** React, Vue, Angular, jQuery, TailwindCSS.

## 3. Servidores Centralizados
- **Status:** DESCARTADO
- **Motivo:** O projeto e P2P (Peer-to-Peer) via PeerJS.
- **O que nao implementar:** Node.js como servidor de estado, Redis, WebSockets centralizados.

---
*Mantenha este arquivo atualizado para servir de guia aos agentes de IA.*
