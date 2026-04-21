from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import io
import pdfplumber
import docx
import logging
import os
import random
import json
import re
from dotenv import load_dotenv
from upskill_service import generate_upskill_plan

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize ML model for semantic similarity (Major Assessment)
logger.info("Loading SentenceTransformer model...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("SentenceTransformer model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load SentenceTransformer model: {e}")
    model = None

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    major: str = ""
    role: str = "student"
    skills: List[Any] = []

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

class AssessmentResult(BaseModel):
    userId: str
    skillId: str
    answers: str
    aiScore: int
    status: str = "completed"
    completedAt: str

class UpskillPlanRequest(BaseModel):
    email: str

class TechAssessmentAnswer(BaseModel):
    question_number: int
    selected_option_text: str

class TechAssessmentSubmission(BaseModel):
    major: Optional[str] = None
    skill_name: str
    answers: List[TechAssessmentAnswer]

app = FastAPI()

# Exception handler for debugging validation errors (from Stage 3)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- UTILS ---

async def extract_text_from_file(file: UploadFile):
    filename = file.filename.lower()
    contents = await file.read()
    
    if filename.endswith(".pdf"):
        try:
            # Use pdfplumber for robust extraction (Stage 3 choice)
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                return text
        except Exception as e:
            logger.error(f"PDF extraction error with pdfplumber: {e}")
            return ""
            
    if filename.endswith(".docx"):
        try:
            doc = docx.Document(io.BytesIO(contents))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            return ""
    
    # Plain text
    try:
        return contents.decode("utf-8")
    except UnicodeDecodeError:
        return contents.decode("latin-1")
    except Exception as e:
        logger.error(f"Error decoding file: {e}")
        return ""

# --- ENDPOINTS: SKILLS & SPECIALIZATIONS ---

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
            if trimmed not in clean_majors:
                clean_majors.append(trimmed)
    return sorted(clean_majors)

@app.get("/api/skills/by-specialization")
def get_skills_by_specialization(major: str):
    db = get_db()
    skills_collection = db["skills"]
    major_clean = major.strip()
    
    query = {"major": {"$regex": f"^{major_clean}$", "$options": "i"}}
    skills_cursor = skills_collection.find(query)
    
    skills_list = []
    for skill in skills_cursor:
        skill["_id"] = str(skill["_id"])
        skills_list.append(skill)
    
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
    
    if not major or major == "Not specified":
        return result
        
    query = {"major": {"$regex": f"^{major}$", "$options": "i"}}
    skills_cursor = list(db["skills"].find(query))
    
    if not skills_cursor:
        query_fallback = {"major": {"$regex": major, "$options": "i"}}
        skills_cursor = list(db["skills"].find(query_fallback))
        
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
    return result

# --- ENDPOINTS: AUTH & PROFILE ---

@app.post("/api/register")
def register_user(user: UserRegister):
    db = get_db()
    users_collection = db["users"]
    
    email_clean = user.email.lower().strip()
    if users_collection.find_one({"email": email_clean}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    role_clean = user.role.lower().strip()
    # Normalize roles (from Stage 2)
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
        "skills": user.skills if user.skills else [] # Restore skill persisting from Stage 2
    }
    
    result = users_collection.insert_one(new_user)
    return {"message": "Registration successful", "user_id": str(result.inserted_id)}

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

# --- ENDPOINTS: MAJOR ASSESSMENT (Semantic similarity / Text / File) ---

@app.get("/api/major-assessment")
def get_major_assessment(major: str):
    db = get_db()
    assessment = db["major_assessments"].find_one({"major": {"$regex": f"^{major}$", "$options": "i"}})
    
    if not assessment:
        # Fallback to a default if major not found exactly
        assessment = db["major_assessments"].find_one({"major": "Software Engineering"})
        
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found for this major")
        
    return {
        "major": assessment["major"],
        "task_description": assessment["task_description"],
        "skills_covered": assessment["skills_covered"]
    }

@app.post("/api/major-assessment")
async def submit_major_assessment(
    email: str = Form(...),
    major: str = Form(...),
    mode: str = Form(...),  # "text" or "file"
    submission_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    db = get_db()
    assessments_collection = db["major_assessments"]
    results_collection = db["major_assessment_results"]
    
    # 1. Get user submission text based on mode
    input_text = ""
    if mode == "file" and file:
        file_text = await extract_text_from_file(file)
        input_text = file_text
    else:
        input_text = submission_text or ""
    
    input_text = input_text.strip()
    if not input_text:
        raise HTTPException(status_code=400, detail="No submission content provided")
        
    # 2. Fetch ideal assessment
    assessment_doc = assessments_collection.find_one({"major": {"$regex": f"^{major}$", "$options": "i"}})
    if not assessment_doc:
        raise HTTPException(status_code=404, detail=f"No assessment found for major: {major}")
        
    if not model:
        raise HTTPException(status_code=500, detail="Semantic similarity model not loaded")

    # 3. Compute Semantic Similarity (70%)
    input_embedding = model.encode(input_text).reshape(1, -1)
    ideal_embedding = np.array(assessment_doc["ideal_answer_embedding"]).reshape(1, -1)
    semantic_sim = cosine_similarity(input_embedding, ideal_embedding)[0][0]
    
    # 4. Keyword Match per Skill (30%)
    skill_results = []
    total_weighted_score = 0
    
    skills_covered = assessment_doc.get("skills_covered", [])
    for skill in skills_covered:
        skill_name = skill["name"]
        keywords = skill.get("keywords", [])
        
        matches = [kw for kw in keywords if kw.lower() in input_text.lower()]
        keyword_score = len(matches) / len(keywords) if keywords else 1.0
        
        # Combine (70/30)
        combined_score = (semantic_sim * 0.7) + (keyword_score * 0.3)
        combined_score_pct = int(combined_score * 100)
        
        # Determine level
        level = "Advanced" if combined_score_pct >= 85 else ("Intermediate" if combined_score_pct >= 60 else "Beginner")
        status = "Verified" if combined_score_pct >= 60 else "Pending"
        
        skill_results.append({
            "name": skill_name,
            "score": combined_score_pct,
            "level": level,
            "status": status,
            "matched_keywords": matches
        })
        total_weighted_score += combined_score_pct
        
    overall_score = int(total_weighted_score / len(skills_covered)) if skills_covered else 0
    overall_level = "Advanced" if overall_score >= 85 else ("Intermediate" if overall_score >= 60 else "Beginner")
    
    feedback = f"Assessment complete for {major}. Overall Score: {overall_score}%. "
    if overall_score >= 60:
        feedback += "Great job! You demonstrated a solid grasp of the core concepts."
    else:
        feedback += "Consider reviewing the core concepts and incorporating more technical details in future work samples."

    # 5. Store Result History
    result_doc = {
        "email": email,
        "major": major,
        "overall_score": overall_score,
        "overall_level": overall_level,
        "skill_breakdown": skill_results,
        "feedback": feedback,
        "submitted_at": datetime.utcnow().isoformat()
    }
    results_collection.insert_one(result_doc)
    
    return {
        "overall_score": overall_score,
        "level": overall_level,
        "feedback": feedback,
        "skill_breakdown": skill_results
    }

# --- ENDPOINTS: CV SKILL EXTRACTION ---

@app.post("/api/user/extract-skills")
async def extract_skills_from_cv(file: UploadFile = File(...)):
    db = get_db()
    skills_collection = db["skills"]
    cv_text = await extract_text_from_file(file)
    
    if not cv_text or not cv_text.strip():
        logger.warning(f"Empty text extracted from {file.filename}")
        return {"skills": []}
    
    cv_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', cv_text)
    cv_text = ' '.join(cv_text.split())
    cv_text_lower = cv_text.lower()
    
    all_skills = list(skills_collection.find({}))
    extracted_skills = []
    
    for skill in all_skills:
        skill_name = skill.get("skill_name", "").lower()
        keywords = skill.get("key_components", [])
        
        if skill_name and skill_name in cv_text_lower:
            extracted_skills.append({
                "name": skill.get("skill_name"),
                "category": skill.get("category", "Technical"),
                "level": "Beginner",
                "progress": 30,
                "status": "Not tested"
            })
        else:
            for kw in keywords:
                if kw and kw.lower() in cv_text_lower:
                    extracted_skills.append({
                        "name": skill.get("skill_name"),
                        "category": skill.get("category", "Technical"),
                        "level": "Beginner",
                        "progress": 30,
                        "status": "Not tested"
                    })
                    break
    return {"skills": extracted_skills}

# --- ENDPOINTS: UPSKILL PLAN (Stage 2) ---

@app.post("/api/upskill-plan")
def create_upskill_plan(req: UpskillPlanRequest):
    db = get_db()
    users_collection = db["users"]
    email_clean = req.email.lower().strip()
    user = users_collection.find_one({"email": email_clean})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_skills = user.get("skills", [])
    weak_skills = []
    for s in user_skills:
        s_name = s.get("name") if isinstance(s, dict) else s
        progress = s.get("progress", 0) if isinstance(s, dict) else 0
        if progress < 70:
            weak_skills.append(s_name)
            
    if not weak_skills:
        major = user.get("major", "Technology")
        weak_skills = [f"Advanced {major} Concepts", "Industry Best Practices", "System Design"]

    plan = generate_upskill_plan(weak_skills)
    users_collection.update_one(
        {"email": email_clean},
        {"$set": {"upskill_plan": plan, "upskill_plan_generated_at": datetime.utcnow().isoformat()}}
    )
    return plan

@app.get("/api/upskill-plan")
def get_upskill_plan_endpoint(email: str):
    db = get_db()
    users_collection = db["users"]
    email_clean = email.lower().strip()
    user = users_collection.find_one({"email": email_clean})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    plan = user.get("upskill_plan")
    if not plan:
        return {"message": "No upskill plan found. Please generate one.", "status": "empty"}
    return plan

# --- ENDPOINTS: TECHNICAL ASSESSMENT & QUIZZES (Stage 3) ---

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
            safe_options.append({"option_text": opt.get("option_text", "")})
        random.shuffle(safe_options)
        questions_list.append({
            "skill_name": q.get("skill_name"),
            "question_number": q.get("question_number"),
            "question_text": q.get("question_text"),
            "options": safe_options
        })
    return {"skill_name": skill_name, "questions": questions_list}

@app.post("/api/technical-assessment/score")
def score_technical_assessment(submission: TechAssessmentSubmission):
    db = get_db()
    tech_qs_collection = db["technical_questions"]
    if len(submission.answers) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 answers must be provided.")
        
    query = {"skill_name": {"$regex": f"^{submission.skill_name.strip()}$", "$options": "i"}}
    if submission.major and submission.major.strip():
        query["major"] = {"$regex": f"^{submission.major.strip()}$", "$options": "i"}
        
    questions_cursor = list(tech_qs_collection.find(query))
    if len(questions_cursor) != 3:
        raise HTTPException(status_code=400, detail="Question set incomplete for this skill.")
        
    total_score = 0
    per_question_scores = []
    for ans in submission.answers:
        matched_q = next((q for q in questions_cursor if q.get("question_number") == ans.question_number), None)
        if not matched_q:
            raise HTTPException(status_code=400, detail=f"Invalid question number: {ans.question_number}")
        matched_opt = next((o for o in matched_q.get("options", []) if o.get("option_text") == ans.selected_option_text), None)
        if not matched_opt:
            raise HTTPException(status_code=400, detail=f"Invalid option text for question {ans.question_number}")
        score = int(matched_opt.get("score", 1))
        total_score += score
        per_question_scores.append({"question_number": ans.question_number, "score": score})
        
    max_score = 9
    percentage = (total_score / max_score) * 100
    level = "Advanced" if total_score >= 7 else ("Intermediate" if total_score >= 4 else "Beginner")
    return {
        "major": submission.major or questions_cursor[0].get("major"),
        "skill_name": submission.skill_name,
        "total_score": total_score,
        "percentage": round(percentage, 2),
        "level": level
    }

@app.post("/api/technical-assessment/case-study")
async def evaluate_case_study(
    skill_name: str = Form(...),
    case_study_text: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    api_key = os.environ.get("GEMINI_API_KEY")
    fallback_response = {
        "problem_identification": 12, "solution_appropriateness": 12,
        "technical_depth": 12, "practical_application": 12,
        "clarity_and_evidence": 12, "case_study_percentage": 60,
        "level": "Beginner", "feedback": "AI evaluation skipped."
    }
    if not api_key: return fallback_response

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model_ai = genai.GenerativeModel('gemini-1.5-flash')
        file_content = ""
        if file:
            contents = await file.read()
            file_content = f"\n\n--- Supporting Evidence File Content ---\n{contents.decode('utf-8', errors='ignore')}"
        
        prompt = f"""
        Evaluate this case study for skill: {skill_name}.
        Answer Text: {case_study_text} {file_content}
        Return ONLY raw JSON: {{ "problem_identification": 0-20, "solution_appropriateness": 0-20, "technical_depth": 0-20, "practical_application": 0-20, "clarity_and_evidence": 0-20, "case_study_percentage": 0-100, "level": "Beginner"|"Intermediate"|"Advanced", "feedback": "string" }}
        """
        response = model_ai.generate_content(prompt)
        ai_data = json.loads(re.search(r'\{.*\}', response.text, re.DOTALL).group(0))
        return ai_data
    except Exception as e:
        logger.error(f"Case study eval error: {e}")
        return fallback_response

@app.get("/api/assessment/quiz-questions")
async def get_quiz_questions(skill_name: str, category: str = "Technical"):
    db = get_db()
    quizzes_collection = db["skill_quizzes"]
    existing_quiz = quizzes_collection.find_one({"skill_name": {"$regex": f"^{skill_name}$", "$options": "i"}})
    if existing_quiz and "questions" in existing_quiz:
        return {"skill_name": skill_name, "questions": existing_quiz["questions"]}
        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"skill_name": skill_name, "questions": [f"Basic statement about {skill_name} {i}" for i in range(10)]}
        
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model_ai = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Generate 10 UNIQUE self-assessment statements for skill: '{skill_name}' (Category: {category}). Return ONLY a raw JSON array of 10 strings."
        response = model_ai.generate_content(prompt)
        questions = json.loads(re.search(r'\[.*\]', response.text, re.DOTALL).group(0))
        quizzes_collection.insert_one({"skill_name": skill_name, "questions": questions})
        return {"skill_name": skill_name, "questions": questions}
    except Exception:
        return {"skill_name": skill_name, "questions": [f"I am familiar with {skill_name} concepts {i}" for i in range(10)]}

@app.post("/api/user/assessment/quiz_evaluate")
async def evaluate_quiz_submission(data: QuizSubmission):
    db = get_db()
    user_doc = db["users"].find_one({"email": data.email})
    if not user_doc: raise HTTPException(status_code=404, detail="User not found")
    
    total_score = min(max(sum(data.answers), 0), 100)
    level = "Advanced" if total_score >= 85 else ("Intermediate" if total_score >= 60 else "Beginner")
    status = "Verified" if total_score >= 60 else "Pending"
    
    skills = user_doc.get("skills", [])
    found = False
    for s in skills:
        if s.get("name", "").lower() == data.skill_name.lower():
            s.update({"status": status, "progress": total_score, "level": level, "suggestion": "Quiz completed."})
            found = True
            break
    if not found:
        skills.append({"name": data.skill_name, "status": status, "progress": total_score, "level": level})
        
    db["users"].update_one({"email": data.email}, {"$set": {"skills": skills}})
    return {"status": status, "score": total_score, "level": level}

# --- OTHER ENDPOINTS ---

@app.get("/api/assessment/results")
def get_user_assessments(userId: str):
    db = get_db()
    assessments_collection = db["assessments"]
    records = list(assessments_collection.find({"userId": userId, "status": "completed"}))
    for r in records: r["_id"] = str(r["_id"])
    return records

@app.post("/api/assessment/result")
def save_short_assessment_result(result: AssessmentResult):
    db = get_db()
    db["assessments"].insert_one(result.model_dump())
    return {"message": "Assessment saved"}

@app.post("/api/assessment/upload")
async def upload_assessment_file(userId: str = Form(...), skillName: str = Form(...), file: UploadFile = File(...)):
    db = get_db()
    file_info = {"userId": userId, "skill": skillName, "file_name": file.filename, "upload_date": datetime.utcnow().isoformat(), "status": "uploaded"}
    db["file_uploads"].insert_one(file_info)
    return {"message": "File uploaded", "file_name": file.filename}

@app.post("/api/user/assessment/upload_evaluate")
async def evaluate_uploaded_file(email: str = Form(...), skill_name: str = Form(...), file: UploadFile = File(...)):
    db = get_db()
    user = db["users"].find_one({"email": email})
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    contents = await file.read()
    api_key = os.environ.get("GEMINI_API_KEY")
    total_score, level, feedback, status = 40, "Beginner", "AI skipped", "Pending"

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model_ai = genai.GenerativeModel('gemini-1.5-flash')
            text = contents.decode('utf-8', errors='ignore')
            prompt = f"Evaluate work for skill {skill_name}: {text}. Return JSON: {{ 'score': 0-100, 'level': 'Beginner'|'Intermediate'|'Advanced', 'feedback': 'string' }}"
            resp = model_ai.generate_content(prompt)
            ai_data = json.loads(re.search(r'\{.*\}', resp.text, re.DOTALL).group(0))
            total_score, level, feedback = ai_data.get("score", 40), ai_data.get("level", "Beginner"), ai_data.get("feedback", "")
            status = "Verified" if total_score >= 60 else "Pending"
        except Exception as e:
            feedback = f"Error: {e}"

    skills = user.get("skills", [])
    found = False
    for s in skills:
        if s.get("name", "").lower() == skill_name.lower():
            s.update({"status": status, "progress": total_score, "level": level, "suggestion": feedback})
            found = True
            break
    if not found:
        skills.append({"name": skill_name, "status": status, "progress": total_score, "level": level, "suggestion": feedback})
    
    db["users"].update_one({"email": email}, {"$set": {"skills": skills}})
    return {"status": status, "score": total_score, "level": level, "suggestion": feedback}

@app.get("/api/jobs")
def get_jobs(industry: Optional[str] = None, category: Optional[str] = None):
    db = get_db()
    query = {}
    if industry: query["Industry"] = {"$regex": industry, "$options": "i"}
    if category: query["$or"] = [{"Industry": {"$regex": category, "$options": "i"}}, {"Job_Title": {"$regex": category, "$options": "i"}}]
    jobs = list(db["job_market"].find(query))
    for j in jobs: j["_id"] = str(j["_id"])
    return jobs
