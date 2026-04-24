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
    "mongodb+srv://manaralnabhani95_db_user:B%26techp5@cluster0.wjwh5vq.mongodb.net/SkillBridgeDB?appName=Cluster0"
)

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

    db["skills"].create_index([("major", 1), ("category", 1)])
    db["skills"].create_index([("skill_name", 1)])

    db["technical_questions"].create_index([("major", 1), ("skill_name", 1)])
    db["technical_questions"].create_index([("skill_name", 1)])

    db["job_market"].create_index([("Job Title", 1)])
    logger.info("Indexes created successfully.")


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
    tech_qs_collection = db["technical_questions"]

    questions_data = [
        # ... keep your existing questions_data exactly as it is ...
    ]

    try:
        if force_reset:
            tech_qs_collection.delete_many({})
            logger.info("technical_questions collection cleared before reseeding.")

        if tech_qs_collection.find_one({}, {"_id": 1}) is None or force_reset:
            result = tech_qs_collection.insert_many(questions_data)
            logger.info(f"Successfully seeded {len(result.inserted_ids)} technical questions.")
        else:
            logger.info("technical_questions collection already seeded, skipping.")
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