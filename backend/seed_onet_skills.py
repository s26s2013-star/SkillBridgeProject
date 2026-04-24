import os
import requests
import pandas as pd
import logging
from database import get_db

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

ONET_SKILLS_URL = "https://www.onetcenter.org/dl_files/database/db_30_2_excel/Skills.xlsx"
LOCAL_FILE = "Skills.xlsx"

def download_onet_skills():
    """Downloads the O*NET Skills Excel file if it doesn't exist locally."""
    if os.path.exists(LOCAL_FILE):
        logger.info(f"Local copy of {LOCAL_FILE} found. Skipping download.")
        return True
    
    logger.info(f"Downloading O*NET skills from {ONET_SKILLS_URL}...")
    try:
        response = requests.get(ONET_SKILLS_URL, stream=True, timeout=30)
        response.raise_for_status()
        with open(LOCAL_FILE, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        logger.info("Download complete.")
        return True
    except Exception as e:
        logger.error(f"Failed to download file: {e}")
        return False

def seed_skills():
    if not download_onet_skills():
        logger.error("Could not obtain the O*NET skills file. Aborting.")
        return

    logger.info(f"Reading {LOCAL_FILE}...")
    try:
        # Load the Excel file. Pandas usually defaults to the first sheet.
        # O*NET Skills.xlsx has the data in the first sheet.
        df = pd.read_excel(LOCAL_FILE)
    except Exception as e:
        logger.error(f"Failed to read Excel file: {e}")
        logger.info("Tip: Ensure 'openpyxl' is installed (pip install openpyxl).")
        return

    # User specified column: "Element Name"
    # Expected columns in O*NET Skills.xlsx: O*NET-SOC Code, Title, Element ID, Element Name, Description, etc.
    if "Element Name" not in df.columns:
        logger.error(f"Column 'Element Name' not found in {LOCAL_FILE}.")
        logger.info(f"Available columns: {df.columns.tolist()}")
        return

    db = get_db()
    skills_collection = db["skills"]

    count_inserted = 0
    count_skipped = 0
    
    unique_skills = df["Element Name"].unique()
    total_to_process = len(unique_skills)
    
    logger.info(f"Found {total_to_process} unique skills in file. Starting upsert...")

    for skill_name in unique_skills:
        skill_name_str = str(skill_name).strip()
        
        # Prepare the skill document
        skill_doc = {
            "skill_name": skill_name_str,
            "category": "Technical",
            "key_components": [],
            "beginner_criteria": f"Basic understanding of {skill_name_str}.",
            "intermediate_criteria": f"Can apply {skill_name_str} independently.",
            "advanced_criteria": f"Expert level in {skill_name_str}.",
            "source": "O*NET",
            "major": "General"
        }

        try:
            # Use $setOnInsert to only add the skill if it doesn't exist.
            # This ensures we don't overwrite manual edits or existing skills.
            result = skills_collection.update_one(
                {"skill_name": skill_name_str},
                {"$setOnInsert": skill_doc},
                upsert=True
            )
            
            if result.upserted_id:
                count_inserted += 1
            else:
                count_skipped += 1
                
        except Exception as e:
            logger.error(f"Error processing skill '{skill_name_str}': {e}")

    # Final Summary
    total_in_db = skills_collection.count_documents({})
    print("\n" + "="*40)
    print("O*NET SKILLS SEEDING SUMMARY")
    print("="*40)
    print(f"Skills inserted: {count_inserted}")
    print(f"Skills skipped (already exist): {count_skipped}")
    print(f"Total skills in collection: {total_in_db}")
    print("="*40)

if __name__ == "__main__":
    seed_skills()
