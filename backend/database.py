import pymongo
from pymongo.errors import ConnectionFailure
import logging
import pandas as pd
import sys
import os
from urllib.parse import quote_plus

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection string (move to environment variable for production)
# Escape special characters in password (e.g., @, %, &, etc.)
# Your password contains 'B&techp5' – the '&' must be URL-encoded as '%26'
# If you cannot change password, use quote_plus
MONGO_USER = "manaralnabhani95_db_user"
MONGO_PASSWORD = "B%26techp5"   # '&' is replaced with %26
MONGO_CLUSTER = "cluster0.wjwh5vq.mongodb.net"
MONGO_DB = "SkillBridgeDB"

MONGO_URI = f"mongodb+srv://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_CLUSTER}/{MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0"

# --- SINGLE GLOBAL CLIENT (reused across all requests) ---
_client = None
_db = None

def get_client():
    """Return a single MongoDB client instance (created once)."""
    global _client
    if _client is None:
        try:
            # PyMongo automatically handles connection pooling
            _client = pymongo.MongoClient(MONGO_URI)
            # Test connection
            _client.admin.command('ping')
            logger.info("MongoDB client created and connected.")
        except ConnectionFailure as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise
    return _client

def get_db():
    """Return the database instance (reuses the same client)."""
    global _db
    if _db is None:
        client = get_client()
        _db = client[MONGO_DB]
        # Create indexes for performance
        create_indexes(_db)
    return _db

def create_indexes(db):
    """Create indexes on frequently queried fields to speed up queries."""
    logger.info("Creating database indexes...")
    
    # Skills collection
    skills = db["skills"]
    skills.create_index("skill_name", unique=True)          # for lookups by name
    skills.create_index("major")                            # for filtering by major
    skills.create_index("category")                         # technical vs soft
    
    # Users collection (assuming you have one)
    users = db["users"]
    users.create_index("email", unique=True)                # for login/profile lookups
    
    # job_market collection
    jobs = db["job_market"]
    jobs.create_index("Job_Title")
    jobs.create_index("Company")
    jobs.create_index("Location")
    jobs.create_index("Key_Skills")                         # text index for skill search
    # Optional: create a text index for full‑text search on Job_Description
    # jobs.create_index([("Job_Description", pymongo.TEXT)])
    
    # major_assessments collection (if you have it)
    assessments = db["major_assessments"]
    assessments.create_index("major", unique=True)
    
    logger.info("Indexes created (or already exist).")

# --- Seeding functions (unchanged except using the new get_db) ---

def seed_skills():
    db = get_db()
    skills_collection = db["skills"]
    
    # Your existing skills_data list (too long to repeat, keep as is)
    skills_data = [ ... ]  # (paste your 30+ skills list here)
    
    try:
        # Upsert to avoid duplicates
        for skill in skills_data:
            skills_collection.update_one(
                {"skill_name": skill["skill_name"], "major": skill["major"]},
                {"$set": skill},
                upsert=True
            )
        logger.info(f"Successfully seeded/updated {len(skills_data)} skills.")
    except Exception as e:
        logger.error(f"Failed to seed skills: {e}")
        raise

def seed_market_data():
    db = get_db()
    job_market_collection = db["job_market"]
    
    try:
        if job_market_collection.count_documents({}) == 0:
            csv_path = os.path.join(os.path.dirname(__file__), 'jobData.csv')
            if not os.path.exists(csv_path):
                logger.error(f"CSV file not found at {csv_path}")
                return
                
            df = pd.read_csv(csv_path, encoding='latin-1')
            df = df.dropna(how='all')
            df = df.fillna('')
            jobs_data = df.to_dict(orient='records')
            
            if jobs_data:
                result = job_market_collection.insert_many(jobs_data)
                logger.info(f"Inserted {len(result.inserted_ids)} jobs.")
            else:
                logger.info("CSV empty.")
        else:
            logger.info("job_market already seeded.")
    except Exception as e:
        logger.error(f"Failed to seed jobs: {e}")
        raise

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "skills":
            seed_skills()
        elif command == "jobs":
            seed_market_data()
        elif command == "all":
            seed_skills()
            seed_market_data()
        else:
            print("Usage: python database.py [skills|jobs|all]")
    else:
        logger.info("Running general seeder...")
        seed_skills()
        seed_market_data()