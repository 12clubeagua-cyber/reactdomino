import json
import os
import sys

# Este script simula a destilacao de alto sinal que eu (Gemini) realizo.
# Ele le o akita_full_scan.json e gera o akita_essence.json.

def distill_text(text, max_chars=500):
    # Como este script roda no shell, ele prepara os dados.
    # A destilacao REAL de "alto sinal" e feita por mim (agente) 
    # ao processar as mensagens, mas este script estruturara o JSON final.
    if not text:
        return "Sem transcricao disponivel."
    
    # Placeholder de destilacao (sera substituido pela minha analise de IA)
    # No fluxo manual, eu processaria isso. No fluxo automatico, 
    # usamos o resumo inicial da transcricao.
    return text[:max_chars] + "..."

def main():
    raw_file = "akita_full_scan.json"
    essence_file = "akita_essence.json"
    
    if not os.path.exists(raw_file):
        print(f"Erro: {raw_file} nao encontrado.")
        return

    with open(raw_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    essence_list = []
    
    for v in data.get("videos", []):
        # Aqui simulamos a regra do Agente Extrator
        essence = {
            "title": v["title"],
            "id": v["id"],
            "link": v["link"],
            "essence": distill_text(v["transcript"])
        }
        essence_list.append(essence)
    
    with open(essence_file, "w", encoding="utf-8") as f:
        json.dump(essence_list, f, indent=2, ensure_ascii=False)
    
    print(f"Destilacao concluida: {len(essence_list)} itens processados.")

if __name__ == "__main__":
    main()
