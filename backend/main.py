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
from bson import ObjectId
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

class MCQAnswer(BaseModel):
    question_id: str
    skill_name: str
    selected_option_index: int

class MCQSubmission(BaseModel):
    email: str
    answers: List[MCQAnswer]
    shuffled_options: Dict[str, List[str]]

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

@app.get("/api/assessment/mcq")
async def get_mcq_assessment(email: str):
    db = get_db()

    # 1. Find user
    user_doc = db["users"].find_one({"email": email.strip().lower()})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Validate major
    major = user_doc.get("major", "").strip()
    if not major or major == "Not specified":
        raise HTTPException(
            status_code=400,
            detail="User has no specialization set. Please update your profile."
        )

    # 3. Fetch skills for this major
    skills_cursor = list(db["skills"].find(
        {"major": {"$regex": f"^{major}$", "$options": "i"}}
    ))
    if not skills_cursor:
        skills_cursor = list(db["skills"].find(
            {"major": {"$regex": major, "$options": "i"}}
        ))

    skills_data = []
    total_questions_count = 0

    for skill_doc in skills_cursor:
        skill_name = skill_doc.get("skill_name", "")
        if not skill_name:
            continue

        # 4. Fetch questions for this skill
        questions_cursor = list(db["technical_questions"].find({
            "major": {"$regex": f"^{major}$", "$options": "i"},
            "skill_name": {"$regex": f"^{skill_name}$", "$options": "i"}
        }))

        if not questions_cursor:
            continue

        formatted_questions = []
        for q in questions_cursor:
            # 5. Copy and shuffle options
            options_copy = list(q.get("options", []))
            random.shuffle(options_copy)

            # 6. Remove sensitive fields, add positional index
            safe_options = []
            for idx, opt in enumerate(options_copy):
                safe_options.append({
                    "index": idx,
                    "option_text": opt.get("option_text", "")
                })

            formatted_questions.append({
                "question_id": str(q["_id"]),
                "question_number": q.get("question_number", 1),
                "question_text": q.get("question_text", ""),
                "options": safe_options
            })

        total_questions_count += len(formatted_questions)
        skills_data.append({
            "skill_name": skill_name,
            "questions": formatted_questions
        })

    return {
        "major": major,
        "total_skills": len(skills_data),
        "total_questions": total_questions_count,
        "skills": skills_data
    }

@app.post("/api/assessment/mcq/submit")
async def submit_mcq_assessment(submission: MCQSubmission):
    db = get_db()

    # 1. Find user
    user_doc = db["users"].find_one({"email": submission.email.strip().lower()})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Group scores by skill
    skill_scores: Dict[str, int] = {}

    for answer in submission.answers:
        qid = answer.question_id
        skill_name = answer.skill_name
        selected_idx = answer.selected_option_index

        # Fetch the original question from DB
        try:
            q_doc = db["technical_questions"].find_one({"_id": ObjectId(qid)})
        except Exception:
            continue

        if not q_doc:
            continue

        # Get the option text that was shown at selected_idx using shuffled_options
        shuffled_list = submission.shuffled_options.get(qid, [])
        if selected_idx >= len(shuffled_list):
            continue

        selected_option_text = shuffled_list[selected_idx]

        # Find the score for that option text in the original question
        score_earned = 1  # default minimum
        for orig_opt in q_doc.get("options", []):
            if orig_opt.get("option_text", "").strip() == selected_option_text.strip():
                score_earned = orig_opt.get("score", 1)
                break

        skill_scores[skill_name] = skill_scores.get(skill_name, 0) + score_earned

    # 3. Calculate results per skill
    skill_results = []
    total_percentage_sum = 0
    assessed_at = datetime.utcnow().isoformat()

    for skill_name, raw_score in skill_scores.items():
        max_score = 9  # 3 questions x max score 3
        percentage = round((raw_score / max_score) * 100)

        if percentage >= 78:
            level = "Proficient"
        elif percentage >= 45:
            level = "Intermediate"
        else:
            level = "Beginner"

        status = "Verified" if percentage >= 55 else "Needs Improvement"
        total_percentage_sum += percentage

        skill_results.append({
            "skill_name": skill_name,
            "raw_score": raw_score,
            "max_score": max_score,
            "percentage": percentage,
            "level": level,
            "status": status
        })

    # 4. Calculate overall
    overall_percentage = round(total_percentage_sum / len(skill_results)) if skill_results else 0

    if overall_percentage >= 78:
        overall_level = "Proficient"
    elif overall_percentage >= 45:
        overall_level = "Intermediate"
    else:
        overall_level = "Beginner"

    # 5. Upsert skills into user's skills array
    current_skills = user_doc.get("skills", [])

    for result_item in skill_results:
        skill_obj = {
            "name": result_item["skill_name"],
            "level": result_item["level"],
            "progress": result_item["percentage"],
            "status": result_item["status"],
            "category": "Technical",
            "assessed_via": "MCQ",
            "assessed_at": assessed_at
        }

        updated = False
        for i, existing in enumerate(current_skills):
            existing_name = existing if isinstance(existing, str) else existing.get("name", "")
            if existing_name.lower() == result_item["skill_name"].lower():
                current_skills[i] = skill_obj
                updated = True
                break

        if not updated:
            current_skills.append(skill_obj)

    db["users"].update_one(
        {"email": submission.email.strip().lower()},
        {"$set": {"skills": current_skills}}
    )

    # 6. Save full result to mcq_results collection
    major = user_doc.get("major", "")
    db["mcq_results"].insert_one({
        "email": submission.email.strip().lower(),
        "major": major,
        "skill_results": skill_results,
        "overall_percentage": overall_percentage,
        "overall_level": overall_level,
        "submitted_at": assessed_at
    })

    # 7. Return response
    return {
        "message": "Assessment complete",
        "overall_percentage": overall_percentage,
        "overall_level": overall_level,
        "results": skill_results
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

async def fetch_and_store_market_data(db):
    skill_keywords = {
        "Python": ["python"],
        "JavaScript": ["javascript", "js", "node.js", "nodejs"],
        "React": ["react", "reactjs", "react.js"],
        "Java": ["java", "spring boot", "spring"],
        "SQL": ["sql", "mysql", "postgresql", "database"],
        "Cloud / AWS": ["aws", "cloud", "azure", "gcp", "google cloud"],
        "Docker / Kubernetes": ["docker", "kubernetes", "k8s", "containers"],
        "Cybersecurity": ["cybersecurity", "security", "penetration testing", "soc"],
        "Machine Learning / AI": ["machine learning", "ai", "deep learning", "tensorflow", "pytorch"],
        "Data Analysis": ["data analysis", "pandas", "numpy", "data science"],
        "DevOps / CI-CD": ["devops", "ci/cd", "jenkins", "github actions"],
        "Mobile Development": ["android", "ios", "react native", "flutter", "mobile"],
        "Networking": ["networking", "cisco", "network", "firewall", "vpn"],
        "Git": ["git", "github", "version control"],
        "REST APIs": ["rest api", "api", "fastapi", "express"],
    }

    salary_ranges_omr = [
        {"role": "Software Engineer", "specialization": "Software Engineering", "min_omr": 600, "max_omr": 1800, "median_omr": 1100, "source": "O*NET + Gulf salary index"},
        {"role": "Web Developer", "specialization": "Web and Mobile Technologies", "min_omr": 500, "max_omr": 1600, "median_omr": 950, "source": "O*NET + Gulf salary index"},
        {"role": "Cybersecurity Analyst", "specialization": "Cyber Security", "min_omr": 700, "max_omr": 2200, "median_omr": 1350, "source": "O*NET + Gulf salary index"},
        {"role": "Data Scientist", "specialization": "Data Science and AI", "min_omr": 800, "max_omr": 2500, "median_omr": 1500, "source": "O*NET + Gulf salary index"},
        {"role": "Network Engineer", "specialization": "Network Computing", "min_omr": 600, "max_omr": 1700, "median_omr": 1050, "source": "O*NET + Gulf salary index"},
        {"role": "Cloud Engineer", "specialization": "Cloud Computing", "min_omr": 750, "max_omr": 2000, "median_omr": 1300, "source": "O*NET + Gulf salary index"},
        {"role": "Systems Analyst", "specialization": "Information System", "min_omr": 550, "max_omr": 1600, "median_omr": 1000, "source": "O*NET + Gulf salary index"},
    ]

    skill_counts = {skill: 0 for skill in skill_keywords}
    total_jobs_fetched = 0

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            for page in range(1, 4):  # fetch 3 pages of results
                url = f"https://www.arbeitnow.com/api/job-board-api?page={page}"
                response = await client.get(url)
                if response.status_code != 200:
                    break
                jobs = response.json().get("data", [])
                if not jobs:
                    break
                total_jobs_fetched += len(jobs)
                for job in jobs:
                    text_to_search = (
                        job.get("title", "").lower() + " " +
                        job.get("description", "").lower() + " " +
                        " ".join(job.get("tags", [])).lower()
                    )
                    for skill_label, keywords in skill_keywords.items():
                        for kw in keywords:
                            if kw in text_to_search:
                                skill_counts[skill_label] += 1
                                break
    except Exception as e:
        print(f"Arbeitnow fetch error: {e}")

    skill_demand_list = []
    for skill, count in skill_counts.items():
        percentage = round((count / total_jobs_fetched) * 100) if total_jobs_fetched > 0 else 0
        skill_demand_list.append({
            "skill": skill,
            "count": count,
            "percentage": percentage
        })

    skill_demand_list.sort(key=lambda x: x["count"], reverse=True)

    analytics_doc = {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "fetched_at": datetime.utcnow().isoformat(),
        "total_jobs_analyzed": total_jobs_fetched,
        "skill_demand": skill_demand_list,
        "salary_ranges": salary_ranges_omr,
        "source": "Arbeitnow API + O*NET Gulf salary index"
    }

    db["market_analytics"].replace_one(
        {"date": analytics_doc["date"]},
        analytics_doc,
        upsert=True
    )
    return analytics_doc

@app.get("/api/market-analytics")
async def get_market_analytics(refresh: bool = False):
    db = get_db()
    
    salary_ranges_omr = [
        {"role": "Software Engineer", "specialization": "Software Engineering", "min_omr": 600, "max_omr": 1800, "median_omr": 1100, "source": "O*NET + Gulf salary index"},
        {"role": "Web Developer", "specialization": "Web and Mobile Technologies", "min_omr": 500, "max_omr": 1600, "median_omr": 950, "source": "O*NET + Gulf salary index"},
        {"role": "Cybersecurity Analyst", "specialization": "Cyber Security", "min_omr": 700, "max_omr": 2200, "median_omr": 1350, "source": "O*NET + Gulf salary index"},
        {"role": "Data Scientist", "specialization": "Data Science and AI", "min_omr": 800, "max_omr": 2500, "median_omr": 1500, "source": "O*NET + Gulf salary index"},
        {"role": "Network Engineer", "specialization": "Network Computing", "min_omr": 600, "max_omr": 1700, "median_omr": 1050, "source": "O*NET + Gulf salary index"},
        {"role": "Cloud Engineer", "specialization": "Cloud Computing", "min_omr": 750, "max_omr": 2000, "median_omr": 1300, "source": "O*NET + Gulf salary index"},
        {"role": "Systems Analyst", "specialization": "Information System", "min_omr": 550, "max_omr": 1600, "median_omr": 1000, "source": "O*NET + Gulf salary index"},
    ]

    fallback = {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "total_jobs_analyzed": 0,
        "skill_demand": [
            {"skill": "Python", "count": 0, "percentage": 0},
            {"skill": "JavaScript", "count": 0, "percentage": 0},
        ],
        "salary_ranges": salary_ranges_omr,
        "source": "Fallback data — live fetch unavailable",
        "is_fallback": True
    }

    try:
        if refresh:
            return await fetch_and_store_market_data(db)

        # Try fetching from DB
        recent_doc = db["market_analytics"].find_one(sort=[("fetched_at", -1)])
        
        if not recent_doc:
            return await fetch_and_store_market_data(db)
        
        # Remove _id
        recent_doc.pop("_id", None)
        return recent_doc

    except Exception as e:
        print(f"Error in /api/market-analytics: {e}")
        return fallback
