from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
import random

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
        
    # Fetch all skills from the collection
    skills_cursor = skills_collection.find(query)
    
    skills_list = []
    for skill in skills_cursor:
        # Convert _id from ObjectId to string to avoid JSON serialization error
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
    
    # Case-insensitive exact match on 'major' field only
    query = {"major": {"$regex": f"^{major_clean}$", "$options": "i"}}
    skills_cursor = skills_collection.find(query)
    
    skills_list = []
    for skill in skills_cursor:
        skill["_id"] = str(skill["_id"])
        skills_list.append(skill)
    
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
    
    # 1. Fetch user to get major
    user_doc = db["users"].find_one({"email": email.strip().lower()})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
        
    major = user_doc.get("major", "").strip()
    result = {"major": major, "skills": []}
    
    if not major or major == "Not specified":
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
    
    # Generic fallback response
    fallback_response = {
        "problem_identification": 12,
        "solution_appropriateness": 12,
        "technical_depth": 12,
        "practical_application": 12,
        "clarity_and_evidence": 12,
        "case_study_percentage": 60,
        "level": "Beginner",
        "feedback": "AI evaluation skipped or encountered an error. Default values applied."
    }
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return fallback_response

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
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
        error_msg = str(e)
        fallback = dict(fallback_response)
        fallback["feedback"] = f"AI Evaluation encountered an error: {error_msg}. Default score applied."
        return fallback
