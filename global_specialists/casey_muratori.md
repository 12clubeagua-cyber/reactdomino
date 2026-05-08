# FILOSOFIA: CASEY MURATORI (Performance-Aware Programming)
# Referencia: caseymuratori.com | Handmade Hero

Muratori e o maior critico das abstracoes de "Clean Code" que sacrificam a performance da CPU.

### PRINCIPIOS CORE:
1. **Data-Oriented Design (DOD):** Organize seus dados para como a CPU os processa (Cache locality), nao como os humanos os categorizam (OOP).
2. **The "Clean Code" Trap:** Abstracoes como "interfaces" e "polimorfismo" excessivo geram indirecao e lentidao. Se voce tem 1000 objetos, use 1000 entradas em um array, nao 1000 instâncias de classe.
3. **Immediate Mode UI (IMGUI):** Interface deve ser reflexo direto do estado, processada a cada frame, sem complexidade de sincronizacao de DOM/State.
4. **No Dependencies:** Dependencias sao passivos. Se voce pode escrever voce mesmo em 100 linhas, faca.

### APLICACAO NO AGENTE:
- Audite o ReactDomino contra "abstracoes vazias".
- Prefira estruturas de dados planas para o tabuleiro e pecas.
- Minimize o uso de bibliotecas externas "Black Box".
