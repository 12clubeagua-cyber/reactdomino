import requests
import xml.etree.ElementTree as ET
import re
import json
import os
import sys

# Ensure local site-packages are in path
sys.path.append(os.path.expanduser("~/.local/lib/python3.12/site-packages"))

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    print("youtube-transcript-api not found. Transcripts will be skipped.")
    YouTubeTranscriptApi = None

# Fabio Akita's Channels
BLOG_RSS = "https://www.akitaonrails.com/index.xml"
YOUTUBE_URL = "https://www.youtube.com/@Akitando/videos"

def get_transcript(video_id):
    if not YouTubeTranscriptApi:
        return ""
    print(f"  Fetching transcript for {video_id}...")
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        transcript = transcript_list.find_transcript(['pt', 'en'])
        data = transcript.fetch()
        # Data is a list of dicts: [{'text': '...', 'start': ..., 'duration': ...}, ...]
        return " ".join([t.get('text', '') if isinstance(t, dict) else getattr(t, 'text', '') for t in data])
    except Exception as e:
        print(f"  Could not get transcript for {video_id}: {e}")
        return ""

def scrape_blog():
    print("Scraping Blog RSS...")
    try:
        response = requests.get(BLOG_RSS, timeout=10)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        
        posts = []
        for item in root.findall(".//item"):
            title = item.find("title").text
            link = item.find("link").text
            pub_date = item.find("pubDate").text
            description = item.find("description").text if item.find("description") is not None else ""
            
            posts.append({
                "source": "blog",
                "title": title,
                "link": link,
                "date": pub_date,
                "summary": description[:200] + "..." if len(description) > 200 else description
            })
        print(f"Found {len(posts)} blog posts.")
        return posts
    except Exception as e:
        print(f"Error scraping blog: {e}")
        return []

import time

def scrape_youtube():
    start_time = time.time()
    print("Scraping YouTube (Video Titles & Transcripts)...")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
        response = requests.get(YOUTUBE_URL, headers=headers, timeout=15)
        response.raise_for_status()
        
        videos = []
        
        # Method 1: Try to parse ytInitialData JSON
        data_match = re.search(r'var ytInitialData = (\{.*?\});', response.text)
        if data_match:
            try:
                yt_data = json.loads(data_match.group(1))
                tabs = yt_data.get("contents", {}).get("twoColumnBrowseResultsRenderer", {}).get("tabs", [])
                video_tab = None
                for tab in tabs:
                    title = tab.get("tabRenderer", {}).get("title", "").lower()
                    if title in ["videos", "vídeos", "envios"]:
                        video_tab = tab
                        break
                
                if video_tab:
                    content = video_tab["tabRenderer"].get("content", {})
                    items = []
                    if "richGridRenderer" in content:
                        items = content["richGridRenderer"]["contents"]
                    elif "sectionListRenderer" in content:
                        items = content["sectionListRenderer"]["contents"]
                    
                    for item in items:
                        renderer = item.get("richItemRenderer", {}).get("content", {}).get("videoRenderer")
                        if not renderer:
                            renderer = item.get("gridVideoRenderer")
                        
                        if renderer:
                            video_id = renderer["videoId"]
                            title = renderer["title"]["runs"][0]["text"]
                            videos.append({
                                "source": "youtube",
                                "title": title,
                                "link": f"https://www.youtube.com/watch?v={video_id}",
                                "id": video_id
                            })
            except Exception as e:
                print(f"JSON parsing method failed: {e}")

        # Method 2: Brute force regex
        if not videos:
            print("Trying brute force regex extraction...")
            video_matches = re.finditer(r'"videoId":"([^"]+)".*?"title":\{"runs":\[\{"text":"([^"]+)"', response.text)
            for match in video_matches:
                v_id = match.group(1)
                v_title = match.group(2)
                if not any(v["id"] == v_id for v in videos):
                    videos.append({
                        "source": "youtube",
                        "title": v_title,
                        "link": f"https://www.youtube.com/watch?v={v_id}",
                        "id": v_id
                    })

        # Process the 10 most recent videos as requested
        limited_videos = videos[:10]
        for v in limited_videos:
            v["transcript"] = get_transcript(v["id"])

        end_time = time.time()
        print(f"Processed {len(limited_videos)} videos with transcripts in {end_time - start_time:.2f} seconds.")
        return limited_videos
    except Exception as e:
        print(f"Error scraping YouTube: {e}")
        return []

def main():
    all_content = []
    all_content.extend(scrape_blog())
    all_content.extend(scrape_youtube())
    
    # Save raw for backup
    with open("akita_raw_data.json", "w", encoding="utf-8") as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False)
    
    print("\n--- INICIANDO DESTILACAO DE CONHECIMENTO (AKITA ESSENCE) ---")
    print("Nota: Como agente, processarei cada item para extrair o essencial.")
    
    # In a real automated script, we would call an LLM API here.
    # Since I AM the agent, I will summarize the content in the next steps
    # and save the final 'akita_essence.json'.
    
    print("Processamento concluido. Verifique o akita_raw_data.json.")
    print("Pronto para destilar o conhecimento via Gemini CLI.")

if __name__ == "__main__":
    main()
