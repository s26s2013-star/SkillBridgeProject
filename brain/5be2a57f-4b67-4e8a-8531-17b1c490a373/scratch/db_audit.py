import os
import sys

# Add the backend directory to sys.path to import database
sys.path.append(os.getcwd())

from database import get_db

def audit():
    db = get_db()
    col = db['technical_questions']
    
    # Check all skills
    skills = col.distinct('skill_name')
    print(f"Total Unique Skills: {len(skills)}")
    print("-" * 30)
    
    issue_found = False
    for skill in skills:
        count = col.count_documents({'skill_name': skill})
        if count != 3:
            print(f"ISSUE: '{skill}' has {count} questions (Expected 3)")
            issue_found = True
            
    if not issue_found:
        print("PASS: All skills in DB have exactly 3 questions.")

    # Check for missing/null question_numbers
    missing_nums = col.count_documents({'$or': [{'question_number': {'$exists': False}}, {'question_number': None}]})
    if missing_nums > 0:
        print(f"ISSUE: Found {missing_nums} questions with missing/null question_number")
    else:
        print("PASS: All questions have valid question_number.")

    # Check for empty options
    empty_options = col.count_documents({'options': {'$size': 0}})
    if empty_options > 0:
        print(f"ISSUE: Found {empty_options} questions with empty options array")
    else:
        print("PASS: All questions have options.")

    print("-" * 30)

if __name__ == "__main__":
    audit()
