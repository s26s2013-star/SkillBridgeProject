import os
import json
import logging
import google.generativeai as genai
from googleapiclient.discovery import build
from typing import List, Dict

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Basic fallback plan in case of API failure
def get_fallback_plan(skills: List[str]):
    plan = {
        "duration": f"{len(skills)} Weeks",
        "weeks": []
    }
    for i, skill in enumerate(skills):
        week_num = i + 1
        plan["weeks"].append({
            "week": week_num,
            "topic": f"Mastering {skill}",
            "description": f"Focus on understanding the core principles and practical applications of {skill}.",
            "courses": [
                {
                    "title": f"Intro to {skill} on YouTube",
                    "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial",
                    "source": "YouTube (Search)"
                }
            ]
        })
    return plan

def search_youtube_courses(topic: str, api_key: str):
    """Search for relevant YouTube playlists or videos for a given topic."""
    if not api_key:
        return []
    
    try:
        youtube = build("youtube", "v3", developerKey=api_key)
        # Search for playlists first as they are usually structured courses
        request = youtube.search().list(
            q=f"{topic} course free",
            part="snippet",
            maxResults=3,
            type="playlist",
            relevanceLanguage="en"
        )
        response = request.execute()
        
        courses = []
        for item in response.get("items", []):
            courses.append({
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/playlist?list={item['id']['playlistId']}",
                "source": "YouTube Playlist",
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"]
            })
            
        # If no playlists found, search for videos
        if not courses:
            request = youtube.search().list(
                q=f"{topic} crash course",
                part="snippet",
                maxResults=3,
                type="video"
            )
            response = request.execute()
            for item in response.get("items", []):
                courses.append({
                    "title": item["snippet"]["title"],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    "source": "YouTube Video",
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"]
                })
        
        return courses
    except Exception as e:
        logger.error(f"YouTube search failed for topic '{topic}': {e}")
        return []

def generate_upskill_plan(weak_skills: List[str]):
    """Generates a personalized upskill plan using Gemini and YouTube."""
    gemini_key = os.environ.get("GEMINI_API_KEY")
    youtube_key = os.environ.get("YOUTUBE_API_KEY")
    
    if not weak_skills:
        return {"error": "No weak skills identified."}

    # Determine duration based on user preference
    num_skills = len(weak_skills)
    if num_skills <= 4:
        weeks_count = 4
    elif num_skills <= 7:
        weeks_count = 6
    else:
        weeks_count = 8

    if not gemini_key:
        logger.warning("GEMINI_API_KEY not found. Returning fallback plan.")
        return get_fallback_plan(weak_skills)

    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert technical career coach. Create a structured, personalized {weeks_count}-week learning roadmap to help a student improve the following skills:

{numbered_skill_list_with_scores}

Guidelines:
- Order the weeks logically (foundational skills first).
- For each week, provide:
  - topic: clear and specific (e.g., "Docker Containerization Basics")
  - description: short 2‑sentence summary of what to learn and why it matters
  - search_query: a concise search phrase for YouTube/Coursera (e.g., "Docker tutorial for beginners")

Return ONLY a valid JSON object with the following structure, no markdown, no extra text:
{
  "duration": "{weeks_count} weeks",
  "weeks": [
    {
      "week": 1,
      "topic": "...",
      "description": "...",
      "search_query": "..."
    }
  ]
}
        """
        
        response = model.generate_content(prompt)
        # Clean response text from potential markdown block
        raw_text = response.text.replace('```json', '').replace('```', '').strip()
        plan_data = json.loads(raw_text)
        
        # Enrich each week with YouTube course links
        for week in plan_data.get("weeks", []):
            topic = week.get("topic")
            week["courses"] = search_youtube_courses(topic, youtube_key)
            
            # If no courses found, provide a fallback link
            if not week["courses"]:
                 week["courses"] = [{
                    "title": f"Search for {topic} on YouTube",
                    "url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}",
                    "source": "YouTube (Search)"
                }]
        
        return plan_data

    except Exception as e:
        logger.error(f"Plan generation failed: {e}")
        return get_fallback_plan(weak_skills)
