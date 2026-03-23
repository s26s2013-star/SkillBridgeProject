from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional, List
from fastapi.middleware.cors import CORSMiddleware
from database import get_db

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

class AssessmentResult(BaseModel):
    userId: str
    skillId: str
    answers: str
    aiScore: int
    status: str = "completed"
    completedAt: str

app = FastAPI()

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

@app.get("/api/assessment/results")
def get_user_assessments(userId: str):
    db = get_db()
    assessments_collection = db["assessments"]
    
    records = list(assessments_collection.find({"userId": userId, "status": "completed"}))
    for r in records:
        r["_id"] = str(r["_id"])
    return records
