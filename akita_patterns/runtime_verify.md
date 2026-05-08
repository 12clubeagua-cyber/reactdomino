# PADRAO: RUNTIME VERIFICATION (Docker/Sandboxing)
# Origem: akitaonrails/llm-coding-benchmark/scripts/analyze_results_runtime.py

Este snippet demonstra a estrategia de validacao de seguranca e performance:
1. Boot de aplicacoes Rails em sandbox Docker isolado.
2. Timeout rigoroso em cada etapa (Build, Bundle, Run).
3. Verificacao de 'Health' via HTTP probe antes de rodar testes.

```python
# Timeout Rigoroso (Hardcore Engineering)
def run_command(command, cwd, env, timeout_seconds, stdout_path, stderr_path):
    try:
        exit_code = process.wait(timeout=timeout_seconds)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGTERM) # Encerra grupo de processos
        process.wait(timeout=10) # Grace period
```
