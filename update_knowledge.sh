#!/bin/bash
# Pipeline de Conhecimento Akita: Scrap -> Distill -> Save -> Git Push

echo "--- INICIANDO PIPELINE DE CONHECIMENTO AKITA ---"

# 1. Scraping (Full Browser + Transcripts)
echo "Passo 1: Scraping YouTube e Blog..."
python3 scrape_akita_v3.py

# 2. Destilacao (High Signal Extraction)
echo "Passo 2: Destilando conhecimento (Essencia)..."
python3 distill_essence.py

# 3. Git Workflow (Sincronizacao)
echo "Passo 3: Sincronizando com GitHub..."
git add akita_full_scan.json akita_essence.json akita_raw_data.json youtube_debug.png
git commit -m "feat(knowledge): update akita knowledge base $(date +'%Y-%m-%d %H:%M')"
git pull --rebase
git push

echo "--- PIPELINE FINALIZADO COM SUCESSO ---"
