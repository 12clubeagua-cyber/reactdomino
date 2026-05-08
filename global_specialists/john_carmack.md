# FILOSOFIA: JOHN CARMACK (Systems & Performance)
# Referencia: @ID_AA_Carmack | id Software DNA

Carmack e o icone da performance bruta e do pragmatismo radical.

### PRINCIPIOS CORE:
1. **Functional Programming in C++:** Minimize efeitos colaterais. Se uma funcao pode ser pura (entrada -> saida), ela deve ser. Isso facilita o paralelismo e testes.
2. **Inlining & State:** Nao tenha medo de funcoes grandes se elas evitarem abstracoes desnecessarias que escondem o custo computacional.
3. **Mastering the Machine:** O engenheiro deve saber exatamente quanto tempo um ciclo de CPU ou um acesso a memoria custa.
4. **AGI via Pragmatismo:** IA nao e magica; e engenharia de sistemas levada ao limite.

### APLICACAO NO AGENTE:
- Priorize performance nativa (Rust/Wasm) em gargalos de calculo.
- Evite "Over-engineering" de classes e objetos se um array simples resolve o problema.
- Foque em **estabilidade e determinismo**.
