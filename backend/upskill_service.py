import google.generativeai as genai
import os
import json
import logging
from database import get_db

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_skill_analysis_and_plan(weak_skills, career_path, market_demand_context):
    """
    Generates a structured JSON with skill gap analysis and learning plan.
    """
    prompt = f"""
You are an expert career coach and technical mentor.

**User Data**:
- Weak skills (needs improvement): {weak_skills}
- Desired career path / major: {career_path}
- Market context (based on Omani job data): {market_demand_context}

**Instructions**:
1. **Skill Gap Analysis**: Write a concise paragraph (3‑4 sentences) explaining why improving these weak skills is critical for the user's career path, referencing market demands in Oman.
2. **Prioritized Skills**: Rank the weak skills in order of importance for this career path. Provide a brief reason for the priority order.
3. **Learning Plan**: For the top 3 prioritized skills, create a 4‑week learning path (total 4 weeks, not per skill). Each week must include:
   - topic (clear, specific)
   - description (what to learn and why)
   - learning_resource: a **specific, clickable URL** to a free YouTube tutorial or playlist that matches the weekly topic. **Do not just put "YouTube search" – find a real, high‑quality video/playlist URL.**
4. **Project Suggestion**: At the end of the 4 weeks, suggest one practical project that combines the learned skills.

Return ONLY a valid JSON object with this exact structure, no markdown, no extra text:
{{
  "skill_gap_analysis": "string",
  "prioritized_skills": [
    {{ "skill": "Skill A", "reason": "short reason" }},
    {{ "skill": "Skill B", "reason": "short reason" }},
    {{ "skill": "Skill C", "reason": "short reason" }}
  ],
  "weeks": [
    {{ "week": 1, "topic": "...", "description": "...", "learning_resource": "https://..." }},
    {{ "week": 2, "topic": "...", "description": "...", "learning_resource": "https://..." }},
    {{ "week": 3, "topic": "...", "description": "...", "learning_resource": "https://..." }},
    {{ "week": 4, "topic": "...", "description": "...", "learning_resource": "https://..." }}
  ],
  "suggested_project": {{
    "title": "string",
    "description": "short description"
  }}
}}
"""
    try:
        response = model.generate_content(prompt)
        # Clean potential markdown fences
        raw = response.text.strip()
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.endswith("```"):
            raw = raw[:-3]
        plan_data = json.loads(raw)
        return plan_data
    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        return None
