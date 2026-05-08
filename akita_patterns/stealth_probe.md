# PADRAO: STEALTH BROWSER PROBE (Playwright/CDP)
# Origem: akitaonrails/llm-coding-benchmark/scripts/browser_probe.mjs

Este snippet mostra como o Akita usa o Chrome DevTools Protocol (CDP) diretamente para:
1. Detectar campos de input de forma agnostica.
2. Simular eventos de teclado/mouse sem disparar flags de automacao comuns.
3. Monitorar mudancas no DOM (deltaText/deltaHtml) para confirmar respostas de IA.

```javascript
// Exemplo de Dispatch agnostico (Hardcore)
const dispatch = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

if (input.isContentEditable) {
    input.focus();
    input.textContent = probe;
    dispatch(input, 'input');
} else {
    input.focus();
    input.value = probe;
    dispatch(input, 'input');
    dispatch(input, 'change');
}

// Detecao de Resposta via Delta (Sinal vs Ruido)
if (current.htmlLength > sendSnapshot.htmlLength + 40 || 
    current.text.length > sendSnapshot.text.length + 40) {
    responseObserved = true;
}
```
