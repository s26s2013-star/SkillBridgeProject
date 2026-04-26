from database import get_db

db = get_db()
skill = db["skills"].find_one({"category": "Soft"})
print(skill)
