import os
import sys
import logging
import pandas as pd
import certifi
import pymongo
from pymongo.errors import ConnectionFailure

ca = certifi.where()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://manaralnabhani95_db_user:B%26techp5@cluster0.wjwh5vq.mongodb.net/SkillBridgeDB?retryWrites=true&w=majority"
)
print("USING MONGO_URI:", MONGO_URI)

_client = None
_db = None


def get_db():
    global _client, _db

    if _db is not None:
        return _db

    try:
        _client = pymongo.MongoClient(
            MONGO_URI,
            tlsCAFile=ca,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            maxPoolSize=20,
            retryWrites=True,
        )

        _client.admin.command("ping")
        _db = _client["SkillBridgeDB"]
        logger.info("MongoDB connected successfully.")
        return _db

    except ConnectionFailure as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise


def create_indexes():
    db = get_db()
    try:
        db["skills"].create_index([("major", 1), ("category", 1)])
        db["skills"].create_index([("skill_name", 1)])

        db["technical_questions"].create_index([("major", 1), ("skill_name", 1)])
        db["technical_questions"].create_index([("skill_name", 1)])

        db["job_market"].create_index([("Job Title", 1)])
        logger.info("Indexes created successfully.")
    except Exception as e:
        logger.warning(f"Note: Index creation issue (likely already exists): {e}")


def seed_skills():
    db = get_db()
    skills_collection = db["skills"]

    skills_data = [
        # ... keep your existing skills_data exactly as it is ...
    ]

    try:
        if skills_collection.find_one({}, {"_id": 1}) is None:
            result = skills_collection.insert_many(skills_data)
            logger.info(f"Successfully seeded {len(result.inserted_ids)} skills into the database.")
        else:
            logger.info("skills collection already seeded, skipping to avoid duplicates.")
    except Exception as e:
        logger.error(f"Failed to seed skills collection: {e}")
        raise


def seed_technical_questions(force_reset=False):
    db = get_db()
    skills_collection = db["skills"]
    tech_qs_collection = db["technical_questions"]

    try:
        if force_reset:
            tech_qs_collection.delete_many({})
            logger.info("technical_questions collection cleared before reseeding.")

        # Get all skills from the skills collection as source of truth
        all_skills = list(skills_collection.find())
        if not all_skills:
            logger.warning("No skills found in the skills collection. Please seed skills first.")
            return

        questions_to_insert = []
        majors_count = {}

        for skill in all_skills:
            major = skill.get("major", "General")
            skill_name = skill.get("skill_name")
            
            if not skill_name:
                continue

            # Track counts per major
            majors_count[major] = majors_count.get(major, 0) + 1

            # Create exactly 3 technical questions for each skill
            for i in range(1, 4):
                question_id = f"{major}_{skill_name}_{i}".replace(" ", "_").lower()
                
                # Templates for realistic technical assessment questions
                if i == 1:
                    q_text = f"What is the most critical component when implementing {skill_name}?"
                    options = [
                        {"option_text": "Basic structural implementation and configuration", "score": 1},
                        {"option_text": "Optimized performance and specialized techniques", "score": 2},
                        {"option_text": "Enterprise-level security, scalability, and integration", "score": 3}
                    ]
                elif i == 2:
                    q_text = f"Which scenario best represents an advanced application of {skill_name}?"
                    options = [
                        {"option_text": "Standard single-instance deployment or usage", "score": 1},
                        {"option_text": "Multi-tiered integration with other systems", "score": 2},
                        {"option_text": "High-availability, distributed architecture or complex strategy", "score": 3}
                    ]
                else:
                    q_text = f"How do you handle complex troubleshooting or edge cases in {skill_name}?"
                    options = [
                        {"option_text": "Following standard documentation and basic steps", "score": 1},
                        {"option_text": "Applying logical debugging and performance tuning", "score": 2},
                        {"option_text": "Architecting robust solutions to prevent future issues", "score": 3}
                    ]

                questions_to_insert.append({
                    "major": major,
                    "skill_name": skill_name,
                    "question_number": i,
                    "question_id": question_id,
                    "question_text": q_text,
                    "options": options
                })

        if questions_to_insert:
            result = tech_qs_collection.insert_many(questions_to_insert)
            
            # Print Summary
            print("\n" + "="*40)
            print("TECH QUESTIONS SEEDING SUMMARY")
            print("="*40)
            print(f"Total Majors: {len(majors_count)}")
            print(f"Total Skills Analyzed: {len(all_skills)}")
            print(f"Total Questions Inserted: {len(result.inserted_ids)}")
            print("\nQuestions per Major:")
            for m, count in majors_count.items():
                print(f" - {m}: {count * 3} questions")
            print("="*40 + "\n")
            
            logger.info(f"Successfully seeded {len(result.inserted_ids)} technical questions.")
        else:
            logger.info("No new technical questions were generated.")

    except Exception as e:
        logger.error(f"Failed to seed technical_questions collection: {e}")
        raise


def seed_market_data():
    db = get_db()
    job_market_collection = db["job_market"]

    try:
        if job_market_collection.find_one({}, {"_id": 1}) is None:
            csv_path = os.path.join(os.path.dirname(__file__), "jobData.csv")

            if not os.path.exists(csv_path):
                logger.error(f"CSV file not found at {csv_path}")
                return

            df = pd.read_csv(csv_path, encoding="latin-1")
            df = df.dropna(how="all").fillna("")

            jobs_data = df.to_dict(orient="records")

            if jobs_data:
                result = job_market_collection.insert_many(jobs_data)
                logger.info(f"Successfully seeded {len(result.inserted_ids)} jobs into the job_market collection.")
            else:
                logger.info("CSV was empty, no jobs inserted.")
        else:
            logger.info("job_market collection already seeded, skipping.")
    except Exception as e:
        logger.error(f"Failed to seed job_market collection: {e}")
        raise


import re

def get_user_profile(email):
    db = get_db()
    return db["user_profiles"].find_one({"email": email})

def get_all_jobs():
    db = get_db()
    return list(db["job_market"].find({}))

def exact_skill_match(job_text, skill_name):
    if not job_text or not isinstance(job_text, str) or not skill_name:
        return False
    # Simple case-insensitive exact substring search
    return skill_name.lower() in job_text.lower()

def save_profile_summary(email, summary):
    db = get_db()
    db["user_profiles"].update_one(
        {"email": email},
        {"$set": summary},
        upsert=True
    )

if __name__ == "__main__":
    create_indexes()

    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "skills":
            seed_skills()
        elif command == "jobs":
            seed_market_data()
        elif command == "tech_qs":
            seed_technical_questions()
        elif command == "tech_qs_reset":
            seed_technical_questions(force_reset=True)
        elif command == "all":
            seed_skills()
            seed_market_data()
            seed_technical_questions()
        elif command == "all_reset":
            seed_skills()
            seed_market_data()
            seed_technical_questions(force_reset=True)
        else:
            print("Usage: python database.py [skills|jobs|tech_qs|tech_qs_reset|all|all_reset]")
    else:
        logger.info("No command provided. Seeder did not run automatically.")


