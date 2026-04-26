from database import get_db

db = get_db()
categories = db["skills"].distinct("category")
print(categories)
