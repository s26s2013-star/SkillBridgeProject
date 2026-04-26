from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
import random
import spacy
import nltk
from nltk.stem import WordNetLemmatizer
import os
import json
import re

# Initialize NLP
try:
    nlp = spacy.load("en_core_web_md")
except:
    # Fallback if model not found - though we checked it in research
    nlp = spacy.load("en_core_web_sm")

nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()

def calculate_nlp_score(user_answers: List[str], scenario_keywords: List[List[str]]):
    """
    70% Semantic Similarity / 30% Keyword Match
    """
    total_score = 0
    per_scenario_data = []

    for i, answer in enumerate(user_answers):
        if not answer.strip() or len(answer.strip()) < 10:
            per_scenario_data.append({"score": 0, "feedback": "Answer too short or empty."})
            continue

        doc = nlp(answer)
        keywords = scenario_keywords[i]
        
        # 1. Semantic Score (70%)
        # Create a concept string from keywords to compare against
        concept_doc = nlp(" ".join(keywords))
        semantic_sim = doc.similarity(concept_doc)
        semantic_score = semantic_sim * 100 * 0.7

        # 2. Keyword Match (30%)
        # Lemmatize both answer and keywords for better matching
        answer_lemmas = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]
        match_count = 0
        matched_kws = []
        for kw in keywords:
            kw_lemma = lemmatizer.lemmatize(kw.lower())
            if kw_lemma in answer_lemmas:
                match_count += 1
                matched_kws.append(kw)
        
        keyword_score = (match_count / len(keywords)) * 100 * 0.3
        
        scenario_total = min(100, semantic_score + keyword_score)
        
        # Ruthless Strictness adjustment
        if scenario_total < 30:
            scenario_total = 0
            feedback = "Response lacked professional depth and keyword alignment. Score set to 0%."
        elif scenario_total < 60:
            feedback = f"Fundamental understanding shown. Lacks key concepts: {', '.join([k for k in keywords if k not in matched_kws][:2])}."
        else:
            feedback = f"Strong demonstration of {matched_kws[0] if matched_kws else 'core concepts'}."

        per_scenario_data.append({
            "score": round(scenario_total, 2),
            "feedback": feedback,
            "matched_keywords": matched_kws
        })
        total_score += scenario_total

    avg_score = total_score / len(user_answers) if user_answers else 0
    return round(avg_score, 2), per_scenario_data

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    major: str = ""
    role: str = "student"

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    email: str
    name: str
    major: str = ""
    experience: int = 0
    location: str = ""
    open_to_relocate: bool = False
    job_type: str = ""
    skills: List[Any] = []

class AssessmentSubmission(BaseModel):
    email: str
    skill_name: str
    submission: str
    expected_keywords: List[str] = []

class QuizSubmission(BaseModel):
    email: str
    skill_name: str
    answers: List[int]

class MultiAssessmentSubmission(BaseModel):
    email: str
    skill_name: str
    answers: List[str]
    expected_keywords: List[List[str]] = []

class AssessmentResult(BaseModel):
    userId: str
    skillId: str
    answers: str
    aiScore: int
    status: str = "completed"
    completedAt: str

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    import json
    body = await request.body()
    print(f"\n--- 422 Validation Error ---")
    print(f"Path: {request.url.path}")
    print(f"Errors: {json.dumps(exc.errors(), indent=2)}")
    print(f"Body: {body.decode('utf-8', errors='ignore')}")
    print(f"---------------------------\n")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body_received": body.decode('utf-8', errors='ignore')},
    )

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/skills")
def get_skills(major: Optional[str] = None):
    db = get_db()
    skills_collection = db["skills"]

    query: Dict[str, Any] = {}
    if major:
        query["$or"] = [
            {"major": {"$regex": major, "$options": "i"}},
            {"skill_name": {"$regex": major, "$options": "i"}},
            {"category": {"$regex": major, "$options": "i"}}
        ]

    skills_cursor = skills_collection.find(query)
    skills_list = []
    for skill in skills_cursor:
        skill["_id"] = str(skill["_id"])
        skills_list.append(skill)
        
    # Injected Core Soft Skills
    core_soft_skills = [
        {"skill_name": "Communication", "category": "Soft", "major": "General"},
        {"skill_name": "Teamwork", "category": "Soft", "major": "General"},
        {"skill_name": "Problem Solving", "category": "Soft", "major": "General"},
        {"skill_name": "Time Management", "category": "Soft", "major": "General"},
        {"skill_name": "Adaptability", "category": "Soft", "major": "General"}
    ]
    
    for ss in core_soft_skills:
        if not any(s["skill_name"].lower() == ss["skill_name"].lower() for s in skills_list):
            ss["_id"] = f"injected_{ss['skill_name'].lower()}"
            skills_list.append(ss)
            
    return skills_list

@app.get("/api/specializations")
def get_specializations():
    db = get_db()
    skills_collection = db["skills"]
    distinct_majors = skills_collection.distinct("major")
    
    clean_majors = []
    for major in distinct_majors:
        if isinstance(major, str) and major.strip():
            trimmed = major.strip()
            if trimmed not in clean_majors and trimmed.lower() != "general":
                clean_majors.append(trimmed)
                
    return sorted(clean_majors)

@app.get("/api/skills/by-specialization")
def get_skills_by_specialization(major: str):
    db = get_db()
    skills_collection = db["skills"]
    major_clean = major.strip()
    
    # Case-insensitive exact match on 'major' field only
    query = {"major": {"$regex": f"^{major_clean}$", "$options": "i"}}
    skills_cursor = skills_collection.find(query)
    
    skills_list = []
    for skill in skills_cursor:
        skill["_id"] = str(skill["_id"])
        skills_list.append(skill)
    
    # Injected Core Soft Skills for every specialization
    core_soft_skills = [
        {"skill_name": "Communication", "category": "Soft", "major": major_clean},
        {"skill_name": "Teamwork", "category": "Soft", "major": major_clean},
        {"skill_name": "Problem Solving", "category": "Soft", "major": major_clean},
        {"skill_name": "Time Management", "category": "Soft", "major": major_clean},
        {"skill_name": "Adaptability", "category": "Soft", "major": major_clean}
    ]
    
    for ss in core_soft_skills:
        if not any(s["skill_name"].lower() == ss["skill_name"].lower() for s in skills_list):
            ss["_id"] = f"injected_{ss['skill_name'].lower()}_{major_clean.replace(' ', '_')}"
            skills_list.append(ss)
            
    # Fallback: if nothing found with exact match, try contains match
    if not skills_list:
        query_fallback = {"major": {"$regex": major_clean, "$options": "i"}}
        for skill in skills_collection.find(query_fallback):
            skill["_id"] = str(skill["_id"])
            skills_list.append(skill)
        
    return skills_list

@app.get("/api/skills/for-user")
def get_skills_for_user_optimized(email: str):
    db = get_db()

    user_doc = db["users"].find_one({"email": email.strip().lower()})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    major = user_doc.get("major", "").strip()
    result = {"major": major, "skills": []}

    soft_skills_bank = [
        {
            "name": "Communication",
            "type": "Soft",
            "shortDescription": "Articulate ideas clearly and listen actively in a professional setting.",
            "details": {
                "importance": "Critical for team alignment, client relations, and conflict resolution.",
                "intermediate": "Can handle difficult conversations and present complex ideas logically.",
                "advanced": "Master of persuasion, negotiation, and high-impact executive communication.",
                "components": ["Active Listening", "Public Speaking", "Writing proficiency"],
                "assessment": "Evaluate via verbal/written case studies."
            }
        },
        {
            "name": "Teamwork",
            "type": "Soft",
            "shortDescription": "Collaborate effectively with diverse groups to achieve shared goals.",
            "details": {
                "importance": "The backbone of agile and scalable IT environments.",
                "intermediate": "Actively facilitates sub-group collaboration and supports peers.",
                "advanced": "Builds high-performing cultures and manages cross-functional team dynamics.",
                "components": ["Conflict Resolution", "Reliability", "Supportive Leadership"],
                "assessment": "Evaluate via situational collaboration scenarios."
            }
        },
        {
            "name": "Problem Solving",
            "type": "Soft",
            "shortDescription": "Analyze complex issues and implement creative, logical solutions.",
            "details": {
                "importance": "Essential for debugging, architecture design, and strategic planning.",
                "intermediate": "Identifies root causes quickly and proposes multi-faceted solutions.",
                "advanced": "Anticipates systemic problems and designs robust preventative frameworks.",
                "components": ["Critical Thinking", "Creativity", "Analytical Reasoning"],
                "assessment": "Evaluate via logic-based technical and soft skill case studies."
            }
        },
        {
            "name": "Time Management",
            "type": "Soft",
            "shortDescription": "Prioritize tasks and manage schedules to meet deadlines efficiently.",
            "details": {
                "importance": "Critical for maintaining project velocity and personal productivity.",
                "intermediate": "Successfully manages multiple competing priorities without missing deadlines.",
                "advanced": "Optimizes entire workflows and mentors others on high-leverage work.",
                "components": ["Prioritization", "Delegation", "Planning"],
                "assessment": "Evaluate via workload management scenarios."
            }
        },
        {
            "name": "Adaptability",
            "type": "Soft",
            "shortDescription": "Remain flexible and productive in the face of changing environments.",
            "details": {
                "importance": "Vital in the fast-paced, ever-evolving tech landscape.",
                "intermediate": "Quickly learns new tools and processes with minimal friction.",
                "advanced": "Thrives in ambiguity and leads teams through significant pivot periods.",
                "components": ["Flexibility", "Growth Mindset", "Resilience"],
                "assessment": "Evaluate via change-management case studies."
            }
        }
    ]

    for s in soft_skills_bank:
        result["skills"].append({
            "id": f"std-soft-{s['name'].lower()}",
            "name": s["name"],
            "type": s["type"],
            "shortDescription": s["shortDescription"],
            "details": s["details"]
        })

    if not major or major == "Not specified":
        return result

    query = {"major": {"$regex": f"^{major}$", "$options": "i"}}
    skills_cursor = list(db["skills"].find(query))
    if not skills_cursor:
        query_fallback = {"major": {"$regex": major, "$options": "i"}}
        skills_cursor = list(db["skills"].find(query_fallback))

    for s in skills_cursor:
        if any(existing["name"].lower() == s.get("skill_name", "").lower() for existing in result["skills"]):
            continue
        result["skills"].append({
            "id": str(s["_id"]),
            "name": s.get("skill_name", ""),
            "type": s.get("category", "Technical"),
            "shortDescription": s.get("beginner_criteria", ""),
            "details": {
                "importance": s.get("beginner_criteria", ""),
                "intermediate": s.get("intermediate_criteria", ""),
                "advanced": s.get("advanced_criteria", ""),
                "components": s.get("key_components", []),
                "assessment": s.get("assessment_description", ""),
                "source": s.get("source", "")
            }
        })

    return result
        
    # 2. Fetch specific fields for skills matching the major
    query = {"major": {"$regex": f"^{major}$", "$options": "i"}}
    skills_cursor = list(db["skills"].find(query))
    
    # Fallback partial match if exact match yields nothing
    if not skills_cursor:
        query_fallback = {"major": {"$regex": major, "$options": "i"}}
        skills_cursor = list(db["skills"].find(query_fallback))
        
    # 3. Format into minimal optimized structure matching frontend requirements
    for s in skills_cursor:
        result["skills"].append({
            "id": str(s["_id"]),
            "name": s.get("skill_name", ""),
            "type": s.get("category", "Technical"),
            "shortDescription": s.get("beginner_criteria", ""),
            "details": {
                "importance": s.get("beginner_criteria", ""),
                "intermediate": s.get("intermediate_criteria", ""),
                "advanced": s.get("advanced_criteria", ""),
                "components": s.get("key_components", []),
                "assessment": s.get("assessment_description", ""),
                "source": s.get("source", "")
            }
        })
        
    # Inject Core Soft Skills
    core_ss_names = ["Communication", "Teamwork", "Problem Solving", "Time Management", "Adaptability"]
    for name in core_ss_names:
        if not any(s["name"].lower() == name.lower() for s in result["skills"]):
            result["skills"].append({
                "id": f"injected_{name.lower()}",
                "name": name,
                "type": "Soft",
                "shortDescription": "Core professional competency evaluated via multi-scenario research bank.",
                "details": {
                    "importance": f"{name} is critical for professional success and team synergy.",
                    "intermediate": "Can handle complex interpersonal scenarios and group dynamics.",
                    "advanced": "Leads by example, mentors others, and optimizes organizational processes.",
                    "components": ["Scenario Analysis", "Behavioral Response", "Strategic Thinking"],
                    "assessment": "Multi-scenario text or voice evaluation based on research standards.",
                    "source": "SkillBridge Research Bank"
                }
            })
            
    return result

@app.get("/api/jobs")
def get_jobs(industry: Optional[str] = None, category: Optional[str] = None):
    db = get_db()
    job_market_collection = db["job_market"]
    
    query: Dict[str, Any] = {}
    
    # Filter by industry if provided
    if industry:
        query["Industry"] = {"$regex": industry, "$options": "i"}
        
    # If the user specifically filters by 'category', we can try to match it against Job_Title, Industry, or Job_Type
    if category:
        query["$or"] = [
            {"Industry": {"$regex": category, "$options": "i"}},
            {"Job_Title": {"$regex": category, "$options": "i"}},
            {"Job_Type": {"$regex": category, "$options": "i"}}
        ]
        
    jobs_cursor = job_market_collection.find(query)
    
    jobs_list = []
    for job in jobs_cursor:
        job["_id"] = str(job["_id"])
        jobs_list.append(job)
        
    return jobs_list

@app.post("/api/register")
def register_user(user: UserRegister):
    db = get_db()
    users_collection = db["users"]
    
    email_clean = user.email.lower().strip()
    if users_collection.find_one({"email": email_clean}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    role_clean = user.role.lower().strip()
    if role_clean in ["employer", "employee"]:
        role_clean = "graduate"
        
    new_user = {
        "name": user.name.strip(),
        "email": email_clean,
        "password": user.password,
        "major": user.major.strip() if user.major and user.major.strip() else "Not specified",
        "role": role_clean,
        "location": "Not specified",
        "experience": 0,
        "job_type": "Not specified",
        "skills": []
    }
    
    result = users_collection.insert_one(new_user)
    
    return {
        "message": "Registration successful", 
        "user_id": str(result.inserted_id)
    }

@app.post("/api/login")
def login_user(user: UserLogin):
    db = get_db()
    users_collection = db["users"]
    
    email_clean = user.email.lower().strip()
    db_user = users_collection.find_one({"email": email_clean, "password": user.password})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return {
        "message": "Login successful",
        "token": "dummy-jwt-token",
        "user": {
            "id": str(db_user["_id"]),
            "name": db_user.get("name"),
            "email": db_user.get("email"),
            "major": db_user.get("major"),
            "role": db_user.get("role", "student")
        }
    }

@app.get("/api/user/profile")
def get_user_profile(email: str):
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "major": user.get("major", ""),
        "role": user.get("role", "student"),
        "experience": user.get("experience", 0),
        "location": user.get("location", ""),
        "open_to_relocate": user.get("open_to_relocate", False),
        "job_type": user.get("job_type", ""),
        "skills": user.get("skills", [])
    }

@app.put("/api/user/profile")
def update_user_profile(profile_update: UserProfileUpdate):
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": profile_update.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {
        "name": profile_update.name,
        "major": profile_update.major,
        "experience": profile_update.experience,
        "location": profile_update.location,
        "open_to_relocate": profile_update.open_to_relocate,
        "job_type": profile_update.job_type,
        "skills": profile_update.skills
    }
    
    users_collection.update_one({"email": profile_update.email}, {"$set": update_data})
    
    return {"message": "Profile updated successfully"}

@app.post("/api/user/assessment")
def submit_assessment(sub: AssessmentSubmission):
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": sub.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Dynamic Heuristic Logic
    submission_text = sub.submission.strip().lower()
    char_count = len(submission_text)
    
    # Base score on length (up to 40%, expecting ~300 chars for a good answer)
    length_score = min(40, int((char_count / 300) * 40)) if char_count > 0 else 0
    
    # Keyword score (up to 60%)
    keyword_score = 0
    matched_keywords = []
    if sub.expected_keywords:
        for kw in sub.expected_keywords:
            if kw.lower() in submission_text:
                matched_keywords.append(kw)
        
        match_ratio = len(matched_keywords) / len(sub.expected_keywords)
        keyword_score = int(match_ratio * 60)
    else:
        keyword_score = 40 if char_count > 100 else 10
        
    total_score = length_score + keyword_score
    
    is_valid = total_score >= 60
    status = "Verified" if is_valid else "Pending"
    calculated_level = "Advanced" if total_score >= 85 else ("Intermediate" if total_score >= 60 else "Beginner")
    
    suggestion = f"Your proficiency score is {total_score}%. "
    if not is_valid:
        suggestion += "Keep practicing. Focus on providing more detailed, real-world examples in your answers."
    else:
        if matched_keywords:
            suggestion += f"Great job! You demonstrated strong knowledge by covering key concepts like: {', '.join(matched_keywords[:3])}."
        else:
            suggestion += "Great job! You provided a solid, structurally sound answer."

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == sub.skill_name.lower():
            if isinstance(s, str):
                skills[i] = {
                    "name": s, "status": status, "progress": total_score,
                    "level": calculated_level, "suggestion": suggestion
                }
            else:
                current_skill = dict(s)
                current_skill.update({
                    "status": status,
                    "progress": total_score,
                    "level": calculated_level,
                    "suggestion": suggestion
                })
                skills[i] = current_skill
            updated = True
            break
    
    if not updated:
        skills.append({
            "name": sub.skill_name, "status": status, "progress": total_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": sub.email}, {"$set": {"skills": skills}})
    return {"status": status, "suggestion": suggestion, "score": total_score, "level": calculated_level}

@app.post("/api/assessment/result")
def save_short_assessment_result(result: AssessmentResult):
    db = get_db()
    assessments_collection = db["assessments"]
    
    doc = result.dict() if hasattr(result, 'dict') else result.model_dump()
    assessments_collection.insert_one(doc)
    return {"message": "Assessment saved successfully"}

@app.post("/api/assessment/upload")
async def upload_assessment_file(
    userId: str = Form(...),
    skillName: str = Form(...),
    file: UploadFile = File(...)
):
    db = get_db()
    uploads_collection = db["file_uploads"]
    
    file_info = {
        "userId": userId,
        "skill": skillName,
        "file_name": file.filename,
        "upload_date": datetime.utcnow().isoformat(),
        "status": "uploaded"
    }
    
    uploads_collection.insert_one(file_info)
    return {"message": "File uploaded successfully", "file_name": file.filename}

@app.post("/api/user/assessment/upload_evaluate")
async def evaluate_uploaded_file(
    email: str = Form(...),
    skill_name: str = Form(...),
    file: UploadFile = File(...)
):
    import os
    import json
    
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    contents = await file.read()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    
    total_score = 40
    calculated_level = "Beginner"
    suggestion = "AI evaluation skipped. No GEMINI_API_KEY found in the environment."
    status = "Pending"
    
    if api_key:
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Decode file contents safely
            text_content = contents.decode('utf-8', errors='ignore')
            
            prompt = f"""
You are an expert technical assessor.
Evaluate the following work sample for the skill: {skill_name}.
Read the uploaded file content and return your evaluation in a structured JSON format.

{text_content}

Return ONLY a valid JSON object matching this schema exactly, with NO markdown formatting, NO backticks, and NO extra text:
{{
  "score": integer between 0 and 100,
  "level": "Beginner" or "Intermediate" or "Advanced",
  "feedback": "A concise paragraph explaining strengths, weaknesses, and areas for improvement."
}}
"""
            response = model.generate_content(prompt)
            
            # Clean possible markdown formatting
            raw_text = response.text.replace('```json', '').replace('```', '').strip()
            ai_data = json.loads(raw_text)
            
            total_score = int(ai_data.get("score", 40))
            calculated_level = ai_data.get("level", "Beginner")
            suggestion = ai_data.get("feedback", "AI evaluation completed.")
            
            total_score = min(max(total_score, 0), 100)
            is_valid = total_score >= 60
            status = "Verified" if is_valid else "Pending"
            
        except Exception as e:
            suggestion = f"AI Evaluation encountered an error: {str(e)}"
            total_score = 40
            calculated_level = "Beginner"
            status = "Pending"

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == skill_name.lower():
            if isinstance(s, str):
                skills[i] = {
                    "name": s, "status": status, "progress": total_score,
                    "level": calculated_level, "suggestion": suggestion
                }
            else:
                current_skill = dict(s)
                current_skill.update({
                    "status": status,
                    "progress": total_score,
                    "level": calculated_level,
                    "suggestion": suggestion
                })
                skills[i] = current_skill
            updated = True
            break
            
    if not updated:
        skills.append({
            "name": skill_name, "status": status, "progress": total_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": email}, {"$set": {"skills": skills}})
    
    return {
        "status": status, 
        "suggestion": suggestion, 
        "score": total_score, 
        "level": calculated_level
    }

@app.get("/api/assessment/results")
def get_user_assessments(userId: str):
    db = get_db()
    assessments_collection = db["assessments"]
    
    records = list(assessments_collection.find({"userId": userId, "status": "completed"}))
    for r in records:
        r["_id"] = str(r["_id"])
    return records

@app.get("/api/assessment/quiz-questions")
async def get_quiz_questions(skill_name: str, category: str = "Technical"):
    import os
    import json
    
    db = get_db()
    quizzes_collection = db["skill_quizzes"]
    
    existing_quiz = quizzes_collection.find_one({"skill_name": {"$regex": f"^{skill_name}$", "$options": "i"}})
    
    if existing_quiz and "questions" in existing_quiz and len(existing_quiz["questions"]) == 10:
        return {"skill_name": skill_name, "questions": existing_quiz["questions"]}
        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        dummy = [f"I have a reliable understanding of {skill_name} fundamentals." for i in range(10)]
        return {"skill_name": skill_name, "questions": dummy}
        
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        type_instruction = ""
        example_instruction = ""
        if category.lower() == "soft":
            type_instruction = "This is a SOFT skill. The statements must focus on behavior, situational awareness, interpersonal dynamics, and communication."
            example_instruction = '["I actively listen to colleagues to ensure I fully understand their perspective before responding.", "I navigate miscommunications constructively without assigning blame."]'
        else:
            type_instruction = "This is a TECHNICAL skill. The statements must focus on practical logic, tool understanding, debugging ability, and technical execution."
            example_instruction = f'["I can comfortably debug complex logic issues in {skill_name}.", "I understand and apply industry standard best practices when utilizing {skill_name}."]'
        
        prompt = f"""
Generate exactly 10 UNIQUE, non-repetitive self-assessment statements evaluating proficiency in the skill: '{skill_name}'.
{type_instruction}
The statements should be written in the first person (e.g., "I can...", "I do...").
They must scale from beginner fundamentals to advanced concepts to accurately test depth of knowledge. Do not use generic filler questions.
Return ONLY a raw JSON array of exactly 10 strings. No markdown, no HTML, no extra text.
Example format:
{example_instruction}
"""
        response = model.generate_content(prompt)
        raw_text = response.text.replace('```json', '').replace('```', '').strip()
        questions = json.loads(raw_text)
        
        if len(questions) < 10:
            while len(questions) < 10:
                questions.append(f"I am comfortable applying {skill_name} in practical scenarios {len(questions)+1}.")
        elif len(questions) > 10:
            questions = questions[:10]
            
        quizzes_collection.insert_one({"skill_name": skill_name, "questions": questions})
        return {"skill_name": skill_name, "questions": questions}
        
    except Exception as e:
        print(f"Error generating quiz: {e}")
        dummy = [f"I have practical experience with core mechanics of {skill_name}." for i in range(10)]
        return {"skill_name": skill_name, "questions": dummy}

@app.post("/api/user/assessment/quiz_evaluate")
async def evaluate_quiz_submission(data: QuizSubmission):
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    scores = data.answers
    if not isinstance(scores, list) or len(scores) != 10:
        scores = [0] * 10
        
    total_score = sum(scores)
    total_score = min(max(total_score, 0), 100)
    
    is_valid = total_score >= 60
    status = "Verified" if is_valid else "Pending"
    calculated_level = "Advanced" if total_score >= 85 else ("Intermediate" if total_score >= 60 else "Beginner")
    
    suggestion = f"Completed 10-statement AI Quiz. Score calculated natively based on weighted responses."
    
    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == data.skill_name.lower():
            if isinstance(s, str):
                skills[i] = {
                    "name": s, "status": status, "progress": total_score,
                    "level": calculated_level, "suggestion": suggestion
                }
            else:
                current_skill = dict(s)
                current_skill.update({
                    "status": status,
                    "progress": total_score,
                    "level": calculated_level,
                    "suggestion": suggestion
                })
                skills[i] = current_skill
            updated = True
            break
            
    if not updated:
        skills.append({
            "name": data.skill_name, "status": status, "progress": total_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": data.email}, {"$set": {"skills": skills}})
    
    return {
        "status": status, 
        "suggestion": suggestion, 
        "score": total_score, 
        "level": calculated_level
    }



@app.post("/api/user/assessment/text_evaluate")
async def evaluate_text_assessment(
    email: str = Form(...),
    skill_name: str = Form(...),
    question: str = Form(...),
    expected_keywords: str = Form(""),
    submission_text: str = Form(...)
):
    db = get_db()
    users_collection = db["users"]

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    import os
    import json
    
    if len(submission_text.split()) < 10:
        total_score = 0
        calculated_level = "Beginner"
        suggestion = "Submission too short or meaningless. Please provide highly descriptive, scenario-based answers."
        status = "Pending"
    else:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            total_score = 40
            calculated_level = "Beginner"
            suggestion = "AI evaluation skipped. Missing API Key."
            status = "Pending"
        else:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                prompt = f"""
                You are an expert HR and technical recruiter. Evaluate this soft skills submission for: {skill_name}.
                
                Questions/Scenarios:
                {question}
                
                Applicant's Answers:
                {submission_text}
                
                Expected Themes/Keywords: {expected_keywords}
                
                Score strictly. Meaningless, empty, short, shallow, or irrelevant answers must score very low. 
                Strong, detailed, scenario-based answers showing emotional intelligence score higher.
                Calculate:
                Semantic Relevance (0-100)
                Keyword Matching (0-100)
                Final Score = (Semantic Relevance * 0.7) + (Keyword Matching * 0.3)
                Level = "Advanced" if >= 85, "Intermediate" if >= 60, else "Beginner"
                
                Return ONLY a JSON object exactly matching this schema (NO MARKDOWN or backticks):
                {{
                  "semantic_relevance": 50,
                  "keyword_matching": 20,
                  "final_score": 40,
                  "level": "Beginner",
                  "feedback": "Concise paragraph evaluating the behavioral response."
                }}
                """
                response = model.generate_content(prompt)
                raw_text = response.text.replace('```json', '').replace('```', '').strip()
                ai_data = json.loads(raw_text)
                
                total_score = int(ai_data.get("final_score", 0))
                calculated_level = ai_data.get("level", "Beginner")
                suggestion = ai_data.get("feedback", "No feedback provided.")
                
                total_score = min(max(total_score, 0), 100)
                is_valid = total_score >= 60
                status = "Verified" if is_valid else "Pending"
            except Exception as e:
                total_score = 40
                calculated_level = "Beginner"
                suggestion = f"AI Evaluation error: {str(e)}"
                status = "Pending"

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == skill_name.lower():
            if isinstance(s, str):
                skills[i] = {
                    "name": s, "status": status, "progress": total_score,
                    "level": calculated_level, "suggestion": suggestion
                }
            else:
                current_skill = dict(s)
                current_skill.update({
                    "status": status, "progress": total_score,
                    "level": calculated_level, "suggestion": suggestion
                })
                skills[i] = current_skill
            updated = True
            break

    if not updated:
        skills.append({
            "name": skill_name, "status": status, "progress": total_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": email}, {"$set": {"skills": skills}})
    return {
        "status": status,
        "suggestion": suggestion,
        "score": total_score,
        "level": calculated_level
    }

@app.post("/api/user/assessment/voice_evaluate_multi")
async def evaluate_voice_assessment_multi(
    email: str = Form(...),
    skill_name: str = Form(...),
    expected_keywords: str = Form(""),
    file0: UploadFile = File(None),
    file1: UploadFile = File(None),
    file2: UploadFile = File(None)
):
    import os

    db = get_db()
    users_collection = db["users"]

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key missing")

    files = [f for f in [file0, file1, file2] if f is not None]
    if not files:
        raise HTTPException(status_code=400, detail="No recordings provided")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        full_transcript = []
        for idx, f in enumerate(files):
            contents = await f.read()
            audio_part = {"mime_type": f.content_type or "audio/webm", "data": contents}
            prompt = f"Transcribe answer for Scenario {idx+1}. Output ONLY the text."
            response = model.generate_content([audio_part, prompt])
            full_transcript.append(f"[Scenario {idx+1}] {response.text.strip()}")

        combined_text = "\n\n".join(full_transcript)
        
        import json
        if len(combined_text.split()) < 10:
            total_score = 0
            calculated_level = "Beginner"
            suggestion = f"Transcripts:\n{combined_text}\n\nAudio transcription was too short, silent, or meaningless."
            status = "Pending"
        else:
            prompt = f"""
            You are an expert HR and technical recruiter. Evaluate this soft skills TRANSCRIBED VOICE submission for: {skill_name}.
            
            Applicant's Transcribed Answers:
            {combined_text}
            
            Expected Themes/Keywords: {expected_keywords}
            
            Score strictly. Meaningless, short, shallow, or irrelevant answers must score very low. 
            Strong, detailed, scenario-based answers showing emotional intelligence score higher.
            Calculate:
            Semantic Relevance (0-100)
            Keyword Matching (0-100)
            Final Score = (Semantic Relevance * 0.7) + (Keyword Matching * 0.3)
            Level = "Advanced" if >= 85, "Intermediate" if >= 60, else "Beginner"
            
            Return ONLY a JSON object exactly matching this schema (NO MARKDOWN or backticks):
            {{
              "final_score": 40,
              "level": "Beginner",
              "feedback": "Concise paragraph evaluating the behavioral response."
            }}
            """
            eval_resp = model.generate_content(prompt)
            raw_text = eval_resp.text.replace('```json', '').replace('```', '').strip()
            ai_data = json.loads(raw_text)
            
            total_score = int(ai_data.get("final_score", 0))
            calculated_level = ai_data.get("level", "Beginner")
            ai_feedback = ai_data.get("feedback", "No feedback provided.")
            
            suggestion = f"Transcripts:\n{combined_text}\n\nAI Feedback:\n{ai_feedback}"
            total_score = min(max(total_score, 0), 100)
            is_valid = total_score >= 60
            status = "Verified" if is_valid else "Pending"
    except Exception as e:
        suggestion = f"Multi-Voice Evaluation Error: {str(e)}"
        total_score = 40
        calculated_level = "Beginner"
        status = "Pending"

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == skill_name.lower():
            skill_update = {
                "name": skill_name, "status": status, "progress": total_score,
                "level": calculated_level, "suggestion": suggestion
            }
            skills[i] = skill_update
            updated = True
            break

    if not updated:
        skills.append({
            "name": skill_name, "status": status, "progress": total_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": email}, {"$set": {"skills": skills}})
    return {
        "status": status, "suggestion": suggestion,
        "score": total_score, "level": calculated_level
    }

@app.get("/api/technical-questions")
def get_technical_questions(skill_name: str, major: Optional[str] = None):
    db = get_db()
    tech_qs_collection = db["technical_questions"]
    
    query = {"skill_name": {"$regex": f"^{skill_name.strip()}$", "$options": "i"}}
    if major:
        query["major"] = {"$regex": f"^{major.strip()}$", "$options": "i"}
        
    questions_cursor = tech_qs_collection.find(query).sort("question_number", 1).limit(3)
    
    questions_list = []
    for q in questions_cursor:
        safe_options = []
        for opt in q.get("options", []):
            safe_options.append({
                "option_text": opt.get("option_text", "")
            })
        random.shuffle(safe_options)
            
        questions_list.append({
            "skill_name": q.get("skill_name"),
            "question_number": q.get("question_number"),
            "question_text": q.get("question_text"),
            "options": safe_options
        })
        
    return {"skill_name": skill_name, "questions": questions_list}

class TechAssessmentAnswer(BaseModel):
    question_number: int
    selected_option_text: str

class TechAssessmentSubmission(BaseModel):
    major: Optional[str] = None
    skill_name: str
    answers: List[TechAssessmentAnswer]

@app.post("/api/technical-assessment/score")
def score_technical_assessment(submission: TechAssessmentSubmission):
    db = get_db()
    tech_qs_collection = db["technical_questions"]
    
    # 1. Validation: Reject if answers are not exactly 3
    if len(submission.answers) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 answers must be provided.")
        
    # 2. Validation: Reject duplicate question_number
    req_question_numbers = [ans.question_number for ans in submission.answers]
    if len(set(req_question_numbers)) != 3:
        raise HTTPException(status_code=400, detail="Answers contain duplicate question numbers.")
        
    query = {"skill_name": {"$regex": f"^{submission.skill_name.strip()}$", "$options": "i"}}
    if submission.major and submission.major.strip():
        query["major"] = {"$regex": f"^{submission.major.strip()}$", "$options": "i"}
        
    # 3. Read the questions for that skill
    questions_cursor = list(tech_qs_collection.find(query))
    
    # 4. Validation: Reject if the skill does not have exactly 3 questions
    if len(questions_cursor) != 3:
        raise HTTPException(
            status_code=400, 
            detail=f"This skill requires exactly 3 questions in the catalog, but {len(questions_cursor)} were found."
        )
        
    total_score = 0
    per_question_scores = []
    
    # 5. Logical scoring
    for ans in submission.answers:
        matched_q = next((q for q in questions_cursor if q.get("question_number") == ans.question_number), None)
        if not matched_q:
            raise HTTPException(status_code=400, detail=f"Invalid question number: {ans.question_number}")
            
        # 6. Validation: Match selected_option_text with stored options
        matched_opt = next((o for o in matched_q.get("options", []) if o.get("option_text") == ans.selected_option_text), None)
        if not matched_opt:
            raise HTTPException(status_code=400, detail=f"Invalid option text for question {ans.question_number}")
            
        score = int(matched_opt.get("score", 1))
        total_score += score
        per_question_scores.append({
            "question_number": ans.question_number, 
            "selected_option_text": ans.selected_option_text,
            "score": score
        })
        
    max_score = 9
    percentage = (total_score / max_score) * 100
    
    # 7. Level mapping based on total_score
    if 1 <= total_score <= 3:
        level = "Beginner"
    elif 4 <= total_score <= 6:
        level = "Intermediate"
    elif 7 <= total_score <= 9:
        level = "Advanced"
    else:
        # Fallback for 0 or unexpected values
        level = "Beginner"
        
    # 8. Optimized Response
    return {
        "major": submission.major or matched_q.get("major", "Cloud Computing"),
        "skill_name": submission.skill_name,
        "total_score": total_score,
        "max_score": max_score,
        "percentage": round(percentage, 2),
        "level": level,
        "per_question_scores": per_question_scores
    }


@app.post("/api/technical-assessment/case-study")
async def evaluate_case_study(
    skill_name: str = Form(...),
    case_study_text: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    import os
    import json
    import re
    
    def get_fallback_evaluation(text: str, skill: str, base_error: str = "") -> dict:
        # Remove standard frontend headers to evaluate actual user input
        clean_text = text
        headers = [
            "Problem Understanding:",
            "Root Cause / Challenge Analysis:",
            "Proposed Technical Solution:",
            "Implementation Steps:",
            "Testing, Edge Cases, and Improvements:"
        ]
        for h in headers:
            clean_text = clean_text.replace(h, "")
        clean_text = clean_text.strip()
        
        score = 0
        feedback = ""
        
        if not clean_text:
            score = 0
            feedback = "Answer is empty. Please provide a detailed case study answer."
        else:
            words = clean_text.split()
            if len(clean_text) < 80:
                score = 10
                feedback = "Answer is too short to accurately assess technical depth."
            elif len(words) > 0 and (len(set(words)) / len(words)) < 0.3:
                score = 10
                feedback = "Answer contains too much repetition and lacks substantive technical explanation."
            else:
                max_word_len = max((len(w) for w in words), default=0)
                if max_word_len > 30 and "http" not in clean_text.lower():
                    score = 10
                    feedback = "Answer appears to contain gibberish or nonsensical text."
                else:
                    common_tech_terms = {
                        "api", "database", "server", "code", "function", "system", "data", "user", "error", 
                        "test", "implement", "design", "architecture", "security", "performance", "client", 
                        "network", "cloud", "bug", "issue", "مشكلة", "حل", "برمجة", "خادم", "بيانات", 
                        "نظام", "خطأ", "تطبيق", "شبكة"
                    }
                    text_lower = clean_text.lower()
                    skill_lower = skill.lower()
                    
                    has_skill_mention = skill_lower in text_lower
                    has_tech_term = any(term in text_lower for term in common_tech_terms)
                    
                    if not (has_skill_mention or has_tech_term):
                        score = 25
                        feedback = "Answer does not appear to mention relevant technical terms for the skill/scenario. It is too generic or unrelated."
                    else:
                        score = 40
                        feedback = "Answer evaluated via heuristic rules due to AI unavailability. Contains basic technical elements but needs deeper review."
                        
        if base_error:
            feedback = f"AI Error ({base_error}). " + feedback
            
        section_score = score // 5
        return {
            "problem_identification": section_score,
            "solution_appropriateness": section_score,
            "technical_depth": section_score,
            "practical_application": section_score,
            "clarity_and_evidence": section_score,
            "case_study_percentage": score,
            "level": "Beginner",
            "feedback": feedback
        }

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_fallback_evaluation(case_study_text, skill_name, "No API Key configured")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        file_content = ""
        if file:
            try:
                contents = await file.read()
                file_content = f"\n\n--- Supporting Evidence File Content ---\n{contents.decode('utf-8', errors='ignore')}"
            except Exception as e:
                print(f"File read error: {e}")

        prompt = f"""
        You are a senior technical architect. Evaluate the following case study answer for the skill: {skill_name}.
        
        Answer Text:
        {case_study_text}
        {file_content}
        
        Evaluate the submission against these 5 criteria (max 20 points each):
        1. problem_identification: Did they accurately define the technical challenge?
        2. solution_appropriateness: Is the proposed solution logical and correct?
        3. technical_depth: Did they show deep understanding of the concepts?
        4. practical_application: Is it a realistic, implementable approach?
        5. clarity_and_evidence: Is the answer well-structured and supported (even if no file was uploaded)?
        
        Important: Do NOT penalize the user simply for not uploading a file. If the text answer is strong and articulate, they can still score highly on 'clarity_and_evidence'.
        
        Return ONLY a raw JSON object with NO markdown formatting, NO backticks, NO extra text.
        Schema:
        {{
          "problem_identification": integer(0-20),
          "solution_appropriateness": integer(0-20),
          "technical_depth": integer(0-20),
          "practical_application": integer(0-20),
          "clarity_and_evidence": integer(0-20),
          "case_study_percentage": integer(0-100),
          "level": "Beginner" | "Intermediate" | "Advanced",
          "feedback": "string"
        }}
        """
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
            response = model.generate_content(prompt)
        except Exception as e:
            print(f"Failed with gemini-1.5-flash-latest, falling back to gemini-1.5-flash. Error: {e}")
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
        text = response.text
        
        # Robust JSON extraction: Find first '{' and last '}'
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if not json_match:
            raise ValueError("No JSON object found in AI response")
            
        raw_json = json_match.group(0)
        ai_data = json.loads(raw_json)
        
        # Validation and normalization
        output = {
            "problem_identification": int(ai_data.get("problem_identification", 0)),
            "solution_appropriateness": int(ai_data.get("solution_appropriateness", 0)),
            "technical_depth": int(ai_data.get("technical_depth", 0)),
            "practical_application": int(ai_data.get("practical_application", 0)),
            "clarity_and_evidence": int(ai_data.get("clarity_and_evidence", 0)),
            "case_study_percentage": int(ai_data.get("case_study_percentage", 0)),
            "level": ai_data.get("level", "Beginner"),
            "feedback": ai_data.get("feedback", "No feedback provided.")
        }
        
        return output

    except Exception as e:
        print(f"Case Study evaluation error: {e}")
        return get_fallback_evaluation(case_study_text, skill_name, str(e))

@app.post("/api/user/assessment/text_evaluate_multi")
async def evaluate_text_multi(sub: MultiAssessmentSubmission):
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": sub.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    final_score, per_scenario = calculate_nlp_score(sub.answers, sub.expected_keywords)
    
    is_valid = final_score >= 60
    status = "Verified" if is_valid else "Pending"
    calculated_level = "Advanced" if final_score >= 85 else ("Intermediate" if final_score >= 60 else "Beginner")
    
    # Generate aggregate feedback
    suggestion = f"Multi-scenario evaluation completed using Local NLP Engine. Average Score: {final_score}%. "
    suggestion += " ".join([f"Q{i+1}: {d['feedback']}" for i, d in enumerate(per_scenario)])

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == sub.skill_name.lower():
            current_skill = dict(s) if not isinstance(s, str) else {"name": s}
            current_skill.update({
                "status": status,
                "progress": final_score,
                "level": calculated_level,
                "suggestion": suggestion
            })
            skills[i] = current_skill
            updated = True
            break
            
    if not updated:
        skills.append({
            "name": sub.skill_name, "status": status, "progress": final_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": sub.email}, {"$set": {"skills": skills}})
    
    return {
        "status": status, 
        "suggestion": suggestion, 
        "score": final_score, 
        "level": calculated_level,
        "per_scenario": per_scenario
    }

@app.post("/api/user/assessment/voice_evaluate_multi")
async def evaluate_voice_multi(
    email: str = Form(...),
    skill_name: str = Form(...),
    expected_keywords_json: str = Form(...),
    files: List[UploadFile] = File(...)
):
    import os
    import json
    
    db = get_db()
    users_collection = db["users"]
    
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    expected_keywords = json.loads(expected_keywords_json)
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not found for transcription.")

    import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    transcriptions = []
    
    # Transcribe each audio file
    for file in files:
        contents = await file.read()
        # Simple prompt for transcription
        # We send the audio data as parts if possible, but here we just send a request 
        # to transcribe based on the bytes (GenAI supports this for small files)
        try:
            # Note: For best results with GenAI, uploading as a file is preferred, 
            # but for short snippets, we can try this if supported or use a dummy for now.
            # Here I'll use a text-based prompt as a fallback if binary upload is complex,
            # but Gemini 1.5 Flash supports audio.
            
            # Since I cannot easily use genai.upload_file without a real file on disk,
            # I will use a simplified approach: just transcribe the first 30 seconds.
            response = model.generate_content([
                "Transcribe this audio clip exactly. If it is silent or junk, return only '---SILENT---'.",
                {"mime_type": file.content_type, "data": contents}
            ])
            text = response.text.strip()
            transcriptions.append(text if text else "---SILENT---")
        except Exception as e:
            print(f"Transcription error for {file.filename}: {e}")
            transcriptions.append("---SILENT---")

    final_score, per_scenario = calculate_nlp_score(transcriptions, expected_keywords)
    
    # Check for silent audio and penalize
    if any(t == "---SILENT---" for t in transcriptions):
        final_score = 0
        suggestion = "Evaluation failed. One or more voice recordings were empty or contained noise/silence. Please record again with clear speech."
    else:
        is_valid = final_score >= 60
        status = "Verified" if is_valid else "Pending"
        calculated_level = "Advanced" if final_score >= 85 else ("Intermediate" if final_score >= 60 else "Beginner")
        suggestion = f"Multi-scenario voice evaluation completed. Audio transcribed and analyzed via Local NLP Engine. Average Score: {final_score}%. "
        suggestion += " ".join([f"Q{i+1}: {d['feedback']}" for i, d in enumerate(per_scenario)])

    status = "Verified" if final_score >= 60 else "Pending"
    calculated_level = "Advanced" if final_score >= 85 else ("Intermediate" if final_score >= 60 else "Beginner")

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == skill_name.lower():
            current_skill = dict(s) if not isinstance(s, str) else {"name": s}
            current_skill.update({
                "status": status,
                "progress": final_score,
                "level": calculated_level,
                "suggestion": suggestion
            })
            skills[i] = current_skill
            updated = True
            break
            
    if not updated:
        skills.append({
            "name": skill_name, "status": status, "progress": final_score,
            "level": calculated_level, "suggestion": suggestion
        })

    users_collection.update_one({"email": email}, {"$set": {"skills": skills}})
    
    return {
        "status": status, 
        "suggestion": suggestion, 
        "score": final_score, 
        "level": calculated_level,
        "transcriptions": transcriptions,
        "per_scenario": per_scenario
    }

@app.get("/api/market/top-skills")
def get_top_skills():
    from datetime import datetime
    import os
    import requests
    from dotenv import load_dotenv

    load_dotenv()
    
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    rapidapi_host = os.getenv("RAPIDAPI_HOST")
    
    if not rapidapi_key:
        return {
            "error": True,
            "message": "Live Oman job market data is unavailable. Please configure RAPIDAPI_KEY."
        }
        
    url = "https://jsearch.p.rapidapi.com/search"
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": rapidapi_host
    }
    params = {
        "query": "software engineer Oman",
        "page": "1",
        "num_pages": "1",
        "country": "om"
    }
    
    skill_keywords = {
      "Python": ["python"],
      "JavaScript": ["javascript", "js"],
      "React": ["react", "react.js"],
      "Backend APIs": ["api", "rest api", "backend", "node.js", "fastapi"],
      "Cyber Security": ["cybersecurity", "cyber security", "soc", "incident response", "vulnerability", "penetration testing", "network security"],
      "Cloud Computing": ["cloud", "aws", "azure", "google cloud", "gcp", "cloud security"],
      "Networking": ["network", "tcp/ip", "osi", "routing", "switching", "firewall", "lan", "wan"],
      "SQL": ["sql", "mysql", "postgresql", "oracle database", "database"],
      "Data Analysis": ["data analyst", "data analysis", "power bi", "tableau", "excel", "analytics"],
      "Machine Learning": ["machine learning", "ml", "ai", "artificial intelligence"],
      "UI/UX": ["ui/ux", "user interface", "user experience", "figma"],
      "ERP Systems": ["erp", "sap", "oracle erp"],
      "IT Project Management": ["project management", "pmp", "agile", "scrum"],
      "Systems Analysis": ["systems analyst", "system analysis", "requirements analysis"],
      "Technical Support": ["it support", "helpdesk", "troubleshooting", "technical support"]
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        raw_jobs = data.get("data", [])
        
        total_jobs = len(raw_jobs)
        skill_counts = {skill: {"demand_count": 0, "sample_jobs": []} for skill in skill_keywords}
        
        for job in raw_jobs:
            title = job.get("job_title", "")
            description = job.get("job_description", "")
            combined_text = f"{title} {description}".lower()
            
            # Extract common fields for sample jobs
            city = job.get("job_city") or ""
            country = job.get("job_country") or ""
            location = f"{city}, {country}".strip(", ") or "Oman"
            
            sample_job_info = {
                "title": title,
                "company": job.get("employer_name", ""),
                "location": location,
                "apply_link": job.get("job_apply_link", "")
            }
            
            for skill, keywords in skill_keywords.items():
                if any(kw.lower() in combined_text for kw in keywords):
                    skill_counts[skill]["demand_count"] += 1
                    if len(skill_counts[skill]["sample_jobs"]) < 3:
                        skill_counts[skill]["sample_jobs"].append(sample_job_info)
        
        top_skills = []
        for skill, info in skill_counts.items():
            if info["demand_count"] > 0:
                top_skills.append({
                    "skill": skill,
                    "demand_count": info["demand_count"],
                    "salary_status": "Unavailable",
                    "average_salary": None,
                    "salary_currency": None,
                    "sample_jobs": info["sample_jobs"]
                })
        
        # Sort by demand_count descending
        top_skills.sort(key=lambda x: x["demand_count"], reverse=True)
        
        return {
            "source": "JSearch API via RapidAPI",
            "country": "Oman",
            "last_updated": datetime.utcnow().isoformat(),
            "total_jobs_analyzed": total_jobs,
            "top_skills": top_skills
        }
    except Exception as e:
        return {
            "error": True,
            "message": "Live Oman job market data is unavailable.",
            "details": str(e)
        }
