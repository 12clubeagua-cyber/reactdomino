import asyncio
from playwright.async_api import async_playwright
import json
import time
import os
import sys
import random

# Ensure local site-packages are in path
sys.path.append(os.path.expanduser("~/.local/lib/python3.12/site-packages"))

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    YouTubeTranscriptApi = None

YOUTUBE_URL = "https://www.youtube.com/@Akitando/videos"

# --- STEALTH FUNCTIONS (Inspiradas no Protocolo Akita/frank_investigator) ---

async def apply_stealth(page):
    """Aplica patches de JS para esconder o Playwright do BotGuard."""
    await page.add_init_script("""
        // 1. Remove navigator.webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

        // 2. Spoof plugins (bots costumam ter 0)
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

        // 3. Spoof languages
        Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] });

        // 4. WebGL Vendor/Renderer Spoof (evita 'SwiftShader' ou 'VMWare')
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
            if (parameter === 37446) return 'Intel(R) Iris(TM) Plus Graphics 640'; // UNMASKED_RENDERER_WEBGL
            return getParameter.apply(this, arguments);
        };
    """)

async def human_scroll(page):
    """Scroll com velocidade variável e micro-pausas."""
    print("Iniciando scroll humano stealth...")
    for i in range(5):
        # Distancia de scroll aleatoria entre 1500 e 2500
        dist = random.randint(1500, 2500)
        await page.mouse.wheel(0, dist)
        # Espera aleatoria para carregar (mais organico)
        wait = random.uniform(2.0, 4.5)
        await asyncio.sleep(wait)
        print(f"  Scroll {i+1}/5 concluido. Pausa de {wait:.2f}s...")

async def get_video_links(page):
    print("Extraindo metadados via Curadoria de Impacto...")
    video_data = await page.evaluate("""
        () => {
            const items = Array.from(document.querySelectorAll('a[href*="/watch?v="]'));
            const results = [];
            items.forEach(a => {
                const title = (a.innerText || "").trim().split('\\n')[0];
                if (!title || title.length < 5) return;
                
                const link = a.href;
                const id = link.split('v=')[1]?.split('&')[0];
                if (!id) return;

                const container = a.closest('ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer');
                let viewsStr = "0";
                if (container) {
                    const text = container.innerText;
                    const match = text.match(/([\\d,\\.]+)\\s*(mi|mil|k|visualiza|views)/i);
                    if (match) viewsStr = match[0];
                }

                let views = 0;
                const cleanStr = viewsStr.toLowerCase().replace(',', '.');
                const num = parseFloat(cleanStr);
                if (cleanStr.includes('mi')) views = num * 1000000;
                else if (cleanStr.includes('mil') || cleanStr.includes('k')) views = num * 1000;
                else views = num;

                results.push({ title, link, id, views, views_text: viewsStr });
            });
            return results;
        }
    """)
    
    seen_ids = set()
    unique_videos = []
    for v in video_data:
        if v['id'] not in seen_ids:
            seen_ids.add(v['id'])
            unique_videos.append(v)
            
    return sorted(unique_videos, key=lambda x: x['views'], reverse=True), unique_videos

def fetch_transcript(video_id):
    if not YouTubeTranscriptApi: return ""
    try:
        api = YouTubeTranscriptApi()
        ts = api.list(video_id).find_transcript(['pt', 'en']).fetch()
        return " ".join([t.get('text', '') if isinstance(t, dict) else getattr(t, 'text', '') for t in ts])
    except: return ""

async def main():
    start_time = time.time()
    async with async_playwright() as p:
        print("Lançando Hardened Browser (Protocolo Akita)...")
        # Flags criticas para evitar deteção automatica
        browser = await p.chromium.launch(headless=True, args=[
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox"
        ])
        
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        await apply_stealth(page)
        
        print(f"Navegando furtivamente para {YOUTUBE_URL}...")
        await page.goto(YOUTUBE_URL, wait_until="networkidle")
        await asyncio.sleep(random.uniform(3, 6))
        
        await human_scroll(page)
        
        top_impact, all_recent = await get_video_links(page)
        print(f"Total encontrado: {len(all_recent)} videos.")
        
        # Seleção Curada: Top 10 Popularidade + 5 Novos
        curated = top_impact[:10]
        recent_ids = {v['id'] for v in curated}
        for v in all_recent[:5]:
            if v['id'] not in recent_ids: curated.append(v)
        
        print(f"Processando {len(curated)} videos selecionados por relevância...")
        for i, v in enumerate(curated):
            print(f"  [{i+1}/{len(curated)}] {v['title']} ({v['views_text']})")
            v["transcript"] = fetch_transcript(v["id"])
            
        await browser.close()
        
    output = {
        "metadata": {"total": len(all_recent), "curated": len(curated), "time": round(time.time() - start_time, 2)},
        "videos": curated
    }
    
    with open("akita_full_scan.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n--- STEALTH PIPELINE COMPLETO ({output['metadata']['time']}s) ---")

if __name__ == "__main__":
    asyncio.run(main())
