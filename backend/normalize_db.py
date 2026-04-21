import pymongo
from database import get_db

def normalize():
    db = get_db()
    
    # 1. Users collection
    users = db["users"]
    for user in users.find():
        updates = {}
        
        # Lowercase email
        email = user.get("email", "")
        if email and email != email.lower().strip():
            updates["email"] = email.lower().strip()
            
        # Role normalization
        role = user.get("role", "")
        if isinstance(role, str):
            role_clean = role.lower().strip()
            if role_clean in ["employer", "employee"]:
                updates["role"] = "graduate"
            elif role != role_clean:
                updates["role"] = role_clean
                
        # Major normalization
        major = user.get("major", "")
        if isinstance(major, str) and major != major.strip():
            updates["major"] = major.strip()
                
        if updates:
            users.update_one({"_id": user["_id"]}, {"$set": updates})
            print(f"Updated user {user['_id']}: {updates}")
            
    # 2. Skills collection
    skills = db["skills"]
    for skill in skills.find():
        updates = {}
        
        major = skill.get("major", "")
        if isinstance(major, str) and major != major.strip():
            updates["major"] = major.strip()
            
        category = skill.get("category", "")
        if isinstance(category, str) and category != category.strip():
            updates["category"] = category.strip()
            
        if updates:
            skills.update_one({"_id": skill["_id"]}, {"$set": updates})
            print(f"Updated skill {skill['_id']}: {updates}")
            
if __name__ == "__main__":
    normalize()
    print("Normalization complete.")
