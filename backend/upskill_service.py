import google.generativeai as genai
import os
import json
import logging
import httpx
from database import get_db
from dotenv import load_dotenv
load_dotenv()
logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# ─────────────────────────────────────────────────────────────
# CURATED COURSE MAP
# Verified, free, high-quality resources per skill.
# These are the fallback when APIs are unavailable.
# ─────────────────────────────────────────────────────────────
CURATED_COURSES = {
    # Cloud Computing
    "Cloud Platforms": [
        {"title": "AWS Cloud Practitioner Essentials", "provider": "AWS Training", "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", "free": True},
        {"title": "Google Cloud Fundamentals", "provider": "Google Cloud Skills Boost", "url": "https://cloudskillsboost.google/paths/11", "free": True},
    ],
    "Virtualization": [
        {"title": "Virtualization Explained", "provider": "IBM Technology (YouTube)", "url": "https://www.youtube.com/watch?v=FZR0rG3HKIk", "free": True},
        {"title": "VMware Learning Zone", "provider": "VMware", "url": "https://www.vmware.com/learning.html", "free": True},
    ],
    "Containers": [
        {"title": "Docker Getting Started", "provider": "Docker Official Docs", "url": "https://docs.docker.com/get-started/", "free": True},
        {"title": "Kubernetes Basics", "provider": "Kubernetes.io", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "free": True},
    ],
    "Deployment and CI/CD": [
        {"title": "CI/CD Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=scEDHsr3APg", "free": True},
        {"title": "GitHub Actions Docs", "provider": "GitHub", "url": "https://docs.github.com/en/actions", "free": True},
    ],
    "Cloud Security": [
        {"title": "AWS Security Fundamentals", "provider": "AWS Training", "url": "https://aws.amazon.com/training/digital/aws-security-fundamentals/", "free": True},
    ],
    "Distributed Systems": [
        {"title": "Distributed Systems Course", "provider": "MIT OpenCourseWare", "url": "https://ocw.mit.edu/courses/6-824-distributed-computer-systems-engineering-spring-2006/", "free": True},
    ],
    "Scalability Concepts": [
        {"title": "System Design Primer", "provider": "GitHub", "url": "https://github.com/donnemartin/system-design-primer", "free": True},
    ],
    # Cyber Security
    "Network Security": [
        {"title": "Cybersecurity Fundamentals", "provider": "IBM SkillsBuild", "url": "https://skillsbuild.org/adult-learners/explore-learning/cybersecurity", "free": True},
        {"title": "Network Security Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=qiQR5rTSshw", "free": True},
    ],
    "Cryptography": [
        {"title": "Cryptography I", "provider": "Coursera (Stanford - audit free)", "url": "https://www.coursera.org/learn/crypto", "free": True},
        {"title": "Cryptography Explained", "provider": "Khan Academy", "url": "https://www.khanacademy.org/computing/computer-science/cryptography", "free": True},
    ],
    "Ethical Hacking / Pen Testing": [
        {"title": "Ethical Hacking Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=3Kq1MIfTWCE", "free": True},
        {"title": "OWASP Testing Guide", "provider": "OWASP", "url": "https://owasp.org/www-project-web-security-testing-guide/", "free": True},
    ],
    "Risk Assessment": [
        {"title": "NIST Cybersecurity Framework", "provider": "NIST", "url": "https://www.nist.gov/cyberframework", "free": True},
    ],
    "Security Policies and Governance": [
        {"title": "IT Security and Governance", "provider": "ISACA Resources", "url": "https://www.isaca.org/resources/it-audit", "free": True},
    ],
    "Incident Response": [
        {"title": "Incident Response Course", "provider": "CISA", "url": "https://www.cisa.gov/resources-tools/training/incident-response-training", "free": True},
    ],
    "Vulnerability Analysis": [
        {"title": "Vulnerability Management", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=_GzE99AmAQU", "free": True},
    ],
    "Authentication and Access Control": [
        {"title": "NIST Digital Identity Guidelines", "provider": "NIST", "url": "https://pages.nist.gov/800-63-3/", "free": True},
    ],
    # Data Science and AI
    "Python / R Programming": [
        {"title": "Python for Everybody", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/specializations/python", "free": True},
        {"title": "Python Tutorial", "provider": "Python.org Official Docs", "url": "https://docs.python.org/3/tutorial/", "free": True},
    ],
    "Data Analysis": [
        {"title": "Data Analysis with Python", "provider": "freeCodeCamp Certification", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "free": True},
        {"title": "Pandas Documentation", "provider": "Pandas", "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", "free": True},
    ],
    "Machine Learning": [
        {"title": "Machine Learning Specialization", "provider": "Coursera - Andrew Ng (audit free)", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "free": True},
        {"title": "ML Crash Course", "provider": "Google for Developers", "url": "https://developers.google.com/machine-learning/crash-course", "free": True},
    ],
    "Deep Learning Basics": [
        {"title": "Deep Learning Specialization", "provider": "Coursera - Andrew Ng (audit free)", "url": "https://www.coursera.org/specializations/deep-learning", "free": True},
        {"title": "TensorFlow Tutorials", "provider": "TensorFlow.org", "url": "https://www.tensorflow.org/tutorials", "free": True},
    ],
    "Data Visualization": [
        {"title": "Data Visualization with Python", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/learn/python-for-data-visualization", "free": True},
        {"title": "Tableau Public Training", "provider": "Tableau", "url": "https://www.tableau.com/learn/training", "free": True},
    ],
    "Statistics and Probability": [
        {"title": "Statistics and Probability", "provider": "Khan Academy", "url": "https://www.khanacademy.org/math/statistics-probability", "free": True},
    ],
    "SQL and Data Handling": [
        {"title": "SQL Tutorial", "provider": "W3Schools", "url": "https://www.w3schools.com/sql/", "free": True},
        {"title": "PostgreSQL Tutorial", "provider": "PostgreSQL.org", "url": "https://www.postgresql.org/docs/current/tutorial.html", "free": True},
    ],
    "Model Evaluation": [
        {"title": "Scikit-learn Model Evaluation", "provider": "scikit-learn Docs", "url": "https://scikit-learn.org/stable/modules/model_evaluation.html", "free": True},
    ],
    # Information System
    "Database Management": [
        {"title": "Databases and SQL for Data Science", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/learn/sql-data-science", "free": True},
        {"title": "SQL and Databases Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "free": True},
    ],
    "Business Process Analysis": [
        {"title": "Business Analysis Fundamentals", "provider": "IBM SkillsBuild", "url": "https://skillsbuild.org/adult-learners/explore-learning/business-analysis", "free": True},
    ],
    "ERP Systems": [
        {"title": "SAP Learning Hub (Free Tier)", "provider": "SAP", "url": "https://learning.sap.com/", "free": True},
    ],
    "IT Project Management": [
        {"title": "Project Management Fundamentals", "provider": "Google Project Management Certificate (audit free)", "url": "https://www.coursera.org/professional-certificates/google-project-management", "free": True},
        {"title": "PMBOK Guide Overview", "provider": "PMI", "url": "https://www.pmi.org/standards/pmbok", "free": True},
    ],
    "Systems Analysis and Design": [
        {"title": "Systems Analysis and Design", "provider": "MIT OpenCourseWare", "url": "https://ocw.mit.edu/courses/15-564-information-technology-i-fall-2003/", "free": True},
    ],
    "Decision Support Systems": [
        {"title": "Business Intelligence and Analytics", "provider": "IBM SkillsBuild", "url": "https://skillsbuild.org/adult-learners/explore-learning/data-science", "free": True},
    ],
    # Network Computing
    "Networking Fundamentals (OSI, TCP/IP)": [
        {"title": "Computer Networking Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=IPvYjXCsTg8", "free": True},
        {"title": "Cisco Networking Basics", "provider": "Cisco NetAcad (free)", "url": "https://www.netacad.com/courses/networking/networking-basics", "free": True},
    ],
    "Routing and Switching": [
        {"title": "Cisco CCNA Prep", "provider": "Cisco NetAcad (free)", "url": "https://www.netacad.com/courses/networking/ccna-switching-routing-wireless-essentials", "free": True},
    ],
    "Network Configuration": [
        {"title": "Cisco Packet Tracer Tutorials", "provider": "Cisco NetAcad", "url": "https://skillsforall.com/course/getting-started-cisco-packet-tracer", "free": True},
    ],
    "Troubleshooting Networks": [
        {"title": "Network Troubleshooting", "provider": "Cisco NetAcad", "url": "https://www.netacad.com/", "free": True},
    ],
    "Network Security Basics": [
        {"title": "Network Security Course", "provider": "Cisco NetAcad (free)", "url": "https://www.netacad.com/courses/cybersecurity/network-security", "free": True},
    ],
    "Wireless Networks": [
        {"title": "Wireless Networking Basics", "provider": "Cisco NetAcad", "url": "https://www.netacad.com/", "free": True},
    ],
    "Protocol Analysis": [
        {"title": "Wireshark Tutorial for Beginners", "provider": "David Bombal (YouTube)", "url": "https://www.youtube.com/watch?v=lb1Dw0elw0Q", "free": True},
    ],
    # Software Engineering
    "Programming (Java, Python, C++)": [
        {"title": "CS50 Introduction to Computer Science", "provider": "Harvard (edX free audit)", "url": "https://cs50.harvard.edu/x/", "free": True},
        {"title": "Java Programming and Software Engineering", "provider": "Coursera Duke (audit free)", "url": "https://www.coursera.org/specializations/java-programming", "free": True},
    ],
    "Data Structures and Algorithms": [
        {"title": "Data Structures and Algorithms Specialization", "provider": "Coursera UCSD (audit free)", "url": "https://www.coursera.org/specializations/data-structures-algorithms", "free": True},
        {"title": "DSA Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=8hly31xKli0", "free": True},
    ],
    "Software Design Patterns": [
        {"title": "Design Patterns in Object Oriented Programming", "provider": "Christopher Okhravi (YouTube Playlist)", "url": "https://www.youtube.com/playlist?list=PLrhzvIcii6GNjpARtzwnABHAoUF47qqAT", "free": True},
        {"title": "Refactoring Guru - Design Patterns", "provider": "Refactoring.Guru", "url": "https://refactoring.guru/design-patterns", "free": True},
    ],
    "Object-Oriented Programming (OOP)": [
        {"title": "Java OOP Tutorial", "provider": "Oracle Java Tutorials", "url": "https://docs.oracle.com/javase/tutorial/java/concepts/", "free": True},
        {"title": "OOP in Python", "provider": "Real Python", "url": "https://realpython.com/python3-object-oriented-programming/", "free": True},
    ],
    "Version Control (Git)": [
        {"title": "Git and GitHub Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "free": True},
        {"title": "Pro Git Book (Free)", "provider": "git-scm.com", "url": "https://git-scm.com/book/en/v2", "free": True},
    ],
    "Testing (Unit / Integration)": [
        {"title": "Software Testing Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=u6QfIXgjwGQ", "free": True},
        {"title": "Python unittest Documentation", "provider": "Python.org", "url": "https://docs.python.org/3/library/unittest.html", "free": True},
    ],
    "Software Architecture": [
        {"title": "Software Architecture and Design", "provider": "Georgia Tech (Udacity free)", "url": "https://www.udacity.com/course/software-architecture-design--ud821", "free": True},
        {"title": "Microservices Explained", "provider": "Martin Fowler", "url": "https://martinfowler.com/articles/microservices.html", "free": True},
    ],
    "Debugging and Problem Solving": [
        {"title": "Debugging Tutorial", "provider": "Python.org Docs", "url": "https://docs.python.org/3/library/pdb.html", "free": True},
    ],
    # Web and Mobile Technologies
    "HTML": [
        {"title": "HTML Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=pQN-pnXPaVg", "free": True},
        {"title": "MDN HTML Learning Path", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML", "free": True},
    ],
    "CSS": [
        {"title": "CSS Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=OXGznpKZ_sA", "free": True},
        {"title": "MDN CSS Learning Path", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS", "free": True},
    ],
    "JavaScript": [
        {"title": "JavaScript Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg", "free": True},
        {"title": "The Odin Project - JavaScript", "provider": "The Odin Project", "url": "https://www.theodinproject.com/paths/full-stack-javascript", "free": True},
    ],
    "Frontend Frameworks (React)": [
        {"title": "React Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "free": True},
        {"title": "React Official Tutorial", "provider": "React.dev", "url": "https://react.dev/learn", "free": True},
    ],
    "Backend (Node.js / APIs)": [
        {"title": "Node.js Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=f2EqECiTBL8", "free": True},
        {"title": "Node.js Official Docs", "provider": "Node.js", "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", "free": True},
    ],
    "Databases (SQL / NoSQL)": [
        {"title": "MongoDB University (Free)", "provider": "MongoDB", "url": "https://learn.mongodb.com/", "free": True},
        {"title": "SQL Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "free": True},
    ],
    "Mobile Development Basics": [
        {"title": "Android Development for Beginners", "provider": "Google (free)", "url": "https://developer.android.com/courses/android-basics-compose/course", "free": True},
        {"title": "React Native Tutorial", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=0-S5a0eXPoc", "free": True},
    ],
    "REST APIs": [
        {"title": "REST API Full Course", "provider": "freeCodeCamp (YouTube)", "url": "https://www.youtube.com/watch?v=-MTSQjw5DrM", "free": True},
        {"title": "MDN Web APIs Guide", "provider": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction", "free": True},
    ],
    "UI/UX Basics": [
        {"title": "Google UX Design Certificate", "provider": "Coursera Google (audit free)", "url": "https://www.coursera.org/professional-certificates/google-ux-design", "free": True},
        {"title": "Nielsen Norman Group Articles", "provider": "NN/g", "url": "https://www.nngroup.com/articles/", "free": True},
    ],
}

def get_curated_resources(skill_name: str) -> list:
    """Returns curated course list for a skill. Falls back to partial match if exact not found."""
    if skill_name in CURATED_COURSES:
        return CURATED_COURSES[skill_name]
    # Try partial match
    skill_lower = skill_name.lower()
    for key, val in CURATED_COURSES.items():
        if skill_lower in key.lower() or key.lower() in skill_lower:
            return val
    return []


async def search_youtube(skill_name: str, youtube_api_key: str) -> dict:
    """Search YouTube Data API v3 for a tutorial video on this skill."""
    if not youtube_api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": f"{skill_name} tutorial for beginners full course",
                    "type": "video",
                    "videoDuration": "long",
                    "order": "relevance",
                    "maxResults": 1,
                    "key": youtube_api_key
                }
            )
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                if items:
                    video_id = items[0]["id"]["videoId"]
                    title = items[0]["snippet"]["title"]
                    channel = items[0]["snippet"]["channelTitle"]
                    return {
                        "title": title,
                        "provider": f"{channel} (YouTube)",
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "free": True,
                        "source": "YouTube API"
                    }
    except Exception as e:
        logger.error(f"YouTube API error for skill '{skill_name}': {e}")
    return None


def generate_skill_analysis_and_plan(weak_skills: list, strong_skills: list, career_path: str, market_demand_context: str) -> dict:
    """
    Generates a structured skill gap analysis + 4-week learning plan using Gemini.
    Now takes both weak AND strong skills for a complete analysis.
    """

    # Build resource hints so Gemini uses real URLs, not hallucinated ones
    resource_hints = {}
    for skill in weak_skills[:4]:
        skill_name = skill if isinstance(skill, str) else skill.get("name", "")
        resources = get_curated_resources(skill_name)
        if resources:
            resource_hints[skill_name] = resources[0]["url"]

    weak_skill_names = [s if isinstance(s, str) else s.get("name", "") for s in weak_skills]
    strong_skill_names = [s if isinstance(s, str) else s.get("name", "") for s in strong_skills]

    prompt = f"""
You are an expert career coach and technical mentor for IT graduates in Oman.

**User Profile:**
- IT Specialization / Career Path: {career_path}
- Strong skills (already Verified/Proficient): {strong_skill_names}
- Weak skills (Needs Improvement or Beginner): {weak_skill_names}
- Market context (Oman IT job market): {market_demand_context}

**Verified resource URLs to use (use these exact URLs, do not invent URLs):**
{json.dumps(resource_hints, indent=2)}

**Your task — Return ONLY a valid JSON object with this EXACT structure, no markdown, no extra text:**

{{
  "skill_gap_analysis": {{
    "summary": "3-4 sentence paragraph explaining the overall gap between current skills and market needs in Oman",
    "strengths": ["list of 2-3 specific strength observations based on strong skills"],
    "improvement_areas": ["list of 2-3 specific areas that need work"],
    "career_trajectories": [
      {{"title": "Job Title 1", "match": "High/Medium/Low", "reason": "short reason based on their skill profile"}},
      {{"title": "Job Title 2", "match": "High/Medium/Low", "reason": "short reason"}},
      {{"title": "Job Title 3", "match": "High/Medium/Low", "reason": "short reason"}}
    ]
  }},
  "prioritized_skills": [
    {{"skill": "Most Important Weak Skill", "reason": "why it is the top priority for their career path in Oman", "market_demand": "High/Medium/Low"}},
    {{"skill": "Second Skill", "reason": "reason", "market_demand": "High/Medium/Low"}},
    {{"skill": "Third Skill", "reason": "reason", "market_demand": "High/Medium/Low"}}
  ],
  "weeks": [
    {{"week": 1, "skill_focus": "Skill Name", "topic": "Specific topic title", "description": "What to study and why it matters for their career", "learning_resource": "USE ONE OF THE VERIFIED URLS PROVIDED ABOVE or the exact url from resource_hints", "resource_title": "Title of the resource", "estimated_hours": 8}},
    {{"week": 2, "skill_focus": "Skill Name", "topic": "...", "description": "...", "learning_resource": "USE VERIFIED URL", "resource_title": "...", "estimated_hours": 8}},
    {{"week": 3, "skill_focus": "Skill Name", "topic": "...", "description": "...", "learning_resource": "USE VERIFIED URL", "resource_title": "...", "estimated_hours": 8}},
    {{"week": 4, "skill_focus": "Skill Name", "topic": "...", "description": "...", "learning_resource": "USE VERIFIED URL", "resource_title": "...", "estimated_hours": 8}}
  ],
  "suggested_project": {{
    "title": "Project title",
    "description": "2-3 sentence description combining the learned skills into one practical project relevant to Oman's IT market",
    "skills_practiced": ["skill1", "skill2", "skill3"],
    "difficulty": "Beginner/Intermediate/Advanced",
    "estimated_hours": 20
  }},
  "certifications": [
    {{"name": "Certification name", "provider": "Provider", "url": "real URL", "free": true, "relevance": "why this cert matters for their career path"}}
  ]
}}
"""

    try:
        response = gemini_model.generate_content(prompt)
        raw = response.text.strip()
        if raw.startswith("```json"):
            raw = raw[7:]
        if raw.startswith("```"):
            raw = raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]
        plan_data = json.loads(raw.strip())

        # ── Post-process: replace any week's learning_resource with
        #    a verified curated URL if the one Gemini gave looks fake
        for week in plan_data.get("weeks", []):
            skill_focus = week.get("skill_focus", "")
            current_url = week.get("learning_resource", "")
            # If URL doesn't start with https or is a YouTube search URL, replace it
            if not current_url.startswith("https://") or "youtube.com/results" in current_url:
                curated = get_curated_resources(skill_focus)
                if curated:
                    week["learning_resource"] = curated[0]["url"]
                    week["resource_title"] = curated[0]["title"]

        return plan_data

    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        return None


async def build_full_plan_with_resources(user_email: str) -> dict:
    """
    Main function called by the POST endpoint.
    Fetches user data, runs analysis, enriches each week with
    YouTube video + curated courses, and returns the complete plan.
    """
    db = get_db()
    user = db["users"].find_one({"email": user_email.strip().lower()})
    if not user:
        return None

    career_path = user.get("major", "IT")
    skills = user.get("skills", [])

    # Separate weak and strong skills
    weak_skills = []
    strong_skills = []

    for s in skills:
        if isinstance(s, str):
            weak_skills.append({"name": s, "level": "Unknown"})
            continue
        status = s.get("status", "")
        level = s.get("level", "")
        progress = s.get("progress", 0)
        if status in ["Needs Improvement", "Pending", "Not tested"] or level == "Beginner" or progress < 55:
            weak_skills.append(s)
        else:
            strong_skills.append(s)

    if not weak_skills:
        # If all skills are strong, still generate a plan for advancement
        weak_skills = skills[:3] if skills else []

    # Build market demand context from market_analytics collection
    market_doc = db["market_analytics"].find_one(sort=[("fetched_at", -1)])
    if market_doc:
        top_skills = market_doc.get("skill_demand", [])[:5]
        market_demand_context = (
            f"Top demanded skills in Oman IT market: "
            + ", ".join([f"{s['skill']} ({s['percentage']}% of jobs)" for s in top_skills])
        )
    else:
        market_demand_context = (
            "Oman's IT market prioritizes: Python, JavaScript, Cloud/AWS, Cybersecurity, "
            "React, SQL, and DevOps skills based on current job postings."
        )

    # Generate plan with Gemini
    plan_data = generate_skill_analysis_and_plan(
        weak_skills=weak_skills,
        strong_skills=strong_skills,
        career_path=career_path,
        market_demand_context=market_demand_context
    )

    if not plan_data:
        return None

    # Enrich each week with curated courses + YouTube video
    youtube_key = os.getenv("YOUTUBE_API_KEY")

    for week in plan_data.get("weeks", []):
        skill_focus = week.get("skill_focus", week.get("topic", ""))

        # 1. Add curated courses list
        week["curated_courses"] = get_curated_resources(skill_focus)

        # 2. Add YouTube video via API (real search, not hallucinated)
        yt_result = await search_youtube(skill_focus, youtube_key)
        if yt_result:
            week["youtube_video"] = yt_result
            # If the main learning_resource URL is still a YouTube search, replace with real video
            if "youtube.com/results" in week.get("learning_resource", ""):
                week["learning_resource"] = yt_result["url"]
                week["resource_title"] = yt_result["title"]

    # Add certification resources
    for cert in plan_data.get("certifications", []):
        skill_name = cert.get("name", "").split()[0]
        curated = get_curated_resources(skill_name)
        if curated and not cert.get("url", "").startswith("https://"):
            cert["url"] = curated[0]["url"]

    # Add metadata
    plan_data["generated_at"] = __import__('datetime').datetime.utcnow().isoformat()
    plan_data["career_path"] = career_path
    plan_data["weak_skills_count"] = len(weak_skills)
    plan_data["strong_skills_count"] = len(strong_skills)

    # Save to user document
    db["users"].update_one(
        {"email": user_email.strip().lower()},
        {"$set": {"upskill_plan": plan_data}}
    )

    return plan_data