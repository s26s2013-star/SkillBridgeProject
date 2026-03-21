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
    
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": user.password,
        "major": user.major if user.major else "Not specified",
        "role": user.role,
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
    
    db_user = users_collection.find_one({"email": user.email, "password": user.password})
    
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
    
    # Simple logic
    is_valid = len(sub.submission.strip()) > 30
    status = "Verified" if is_valid else "Pending"
    
    # Suggestions
    suggestion = "Keep practicing. Focus on real-world applications of this skill."
    name_lower = sub.skill_name.lower()
    if "database" in name_lower:
        suggestion = "Great schema work. Next, try optimizing queries with indexing and explore NoSQL alternatives."
    elif "front-end" in name_lower or "web" in name_lower or "responsive" in name_lower:
        suggestion = "UI looks good. Consider diving deeper into state management and component lifecycle optimization."
    elif "oop" in name_lower or "programming" in name_lower:
        suggestion = "Solid logic. I recommend implementing more design patterns like 'Factory' to improve code modularity."
    elif "security" in name_lower or "cyber" in name_lower or "penetration" in name_lower:
        suggestion = "Strong security mindset. Review the latest OWASP Top 10 to stay ahead of common vulnerabilities."
    elif "cloud" in name_lower:
        suggestion = "Successful deployment. Explore Infrastructure as Code (Terraform) for more automated scaling."
    elif "data" in name_lower or "machine" in name_lower or "deep" in name_lower:
        suggestion = "Strong analytical approach. Try experimenting with different hyperparameter tuning methods to boost model performance."

    skills = user.get("skills", [])
    updated = False
    for i, s in enumerate(skills):
        s_name = s if isinstance(s, str) else s.get("name", "")
        if s_name.lower() == sub.skill_name.lower():
            if isinstance(s, str):
                skills[i] = {
                    "name": s, "status": status, "progress": 100 if is_valid else 30,
                    "level": "Intermediate", "suggestion": suggestion
                }
            else:
                # Update existing object using dict unpacking to satisfy linter
                current_skill = dict(s)
                current_skill.update({
                    "status": status,
                    "progress": 100 if is_valid else current_skill.get("progress", 30),
                    "suggestion": suggestion
                })
                skills[i] = current_skill
            updated = True
            break
    
    if not updated:
        skills.append({
            "name": sub.skill_name, "status": status, "progress": 100 if is_valid else 30,
            "level": "Beginner", "suggestion": suggestion
        })

    users_collection.update_one({"email": sub.email}, {"$set": {"skills": skills}})
    return {"status": status, "suggestion": suggestion}
