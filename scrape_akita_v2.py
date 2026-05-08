import asyncio
from playwright.async_api import async_playwright
import json
import time
import os
import sys

# Ensure local site-packages are in path
sys.path.append(os.path.expanduser("~/.local/lib/python3.12/site-packages"))

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    YouTubeTranscriptApi = None

YOUTUBE_URL = "https://www.youtube.com/@Akitando/videos"

async def scroll_to_bottom(page):
    print("Iniciando scroll humano para carregar videos...")
    last_height = await page.evaluate("document.documentElement.scrollHeight")
    while True:
        # Scroll suave para parecer humano
        await page.mouse.wheel(0, 2000)
        await asyncio.sleep(2) # Espera carregar
        new_height = await page.evaluate("document.documentElement.scrollHeight")
        if new_height == last_height:
            # Tenta mais uma vez so pra garantir
            await asyncio.sleep(3)
            new_height = await page.evaluate("document.documentElement.scrollHeight")
            if new_height == last_height:
                break
        last_height = new_height
        print(f"  Scroll: {last_height}px alcancados...")

async def get_video_links(page):
    print("Extraindo links de videos...")
    # Tenta seletores comuns do YouTube
    selectors = ["a#video-title-link", "a#video-title", "a.yt-simple-endpoint"]
    videos = []
    seen_ids = set()
    
    for selector in selectors:
        elements = await page.query_selector_all(selector)
        for el in elements:
            title = await el.get_attribute("title")
            if not title:
                title = await el.inner_text()
            
            href = await el.get_attribute("href")
            if href and "/watch?v=" in href:
                video_id = href.split("v=")[1].split("&")[0]
                if video_id not in seen_ids:
                    seen_ids.add(video_id)
                    videos.append({
                        "title": title.strip(),
                        "link": f"https://www.youtube.com/watch?v={video_id}",
                        "id": video_id
                    })
    return videos

def fetch_transcript(video_id):
    if not YouTubeTranscriptApi:
        return ""
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        transcript = transcript_list.find_transcript(['pt', 'en'])
        data = transcript.fetch()
        return " ".join([t.get('text', '') if isinstance(t, dict) else getattr(t, 'text', '') for t in data])
    except Exception as e:
        return ""

async def main():
    start_time = time.time()
    async with async_playwright() as p:
        print("Abrindo browser completo (Chromium)...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        print(f"Navegando para {YOUTUBE_URL}...")
        await page.goto(YOUTUBE_URL, wait_until="networkidle")
        
        # Simular scroll para carregar videos antigos
        await scroll_to_bottom(page)
        
        videos = await get_video_links(page)
        print(f"Total de videos encontrados: {len(videos)}")
        
        # Processar os 10 primeiros para o teste do usuario
        test_videos = videos[:10]
        results = []
        
        print(f"\nIniciando extração de legendas para 10 videos...")
        for i, v in enumerate(test_videos):
            print(f"  [{i+1}/10] {v['title']}")
            v["transcript"] = fetch_transcript(v["id"])
            results.append(v)
            
        await browser.close()
        
    end_time = time.time()
    
    output = {
        "metadata": {
            "total_videos_found": len(videos),
            "processed_count": len(results),
            "duration_seconds": round(end_time - start_time, 2)
        },
        "videos": results
    }
    
    with open("akita_full_scan.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        
    print(f"\n--- SCAN COMPLETO FINALIZADO ---")
    print(f"Tempo total: {output['metadata']['duration_seconds']} segundos")
    print(f"Arquivo salvo: akita_full_scan.json")

if __name__ == "__main__":
    asyncio.run(main())
