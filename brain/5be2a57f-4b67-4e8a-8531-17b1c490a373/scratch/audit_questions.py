from database import get_db

def audit_technical_questions():
    db = get_db()
    col = db['technical_questions']
    skills = col.distinct('skill_name')
    
    print(f"Total skills found: {len(skills)}")
    print("-" * 50)
    
    issues = []
    
    for skill in skills:
        count = col.count_documents({'skill_name': skill})
        if count != 3:
            issues.append(f"SKILL: '{skill}' has {count} questions (EXPECTED: 3)")
            
    if not issues:
        print("✅ SUCCESS: All skills have exactly 3 questions.")
    else:
        print("❌ ISSUES FOUND:")
        for issue in issues:
            print(f"  - {issue}")
            
    print("-" * 50)
    
    # Check for missing question_number
    missing_num = col.count_documents({'$or': [{'question_number': {'$exists': False}}, {'question_number': None}]})
    if missing_num > 0:
        print(f"❌ ERROR: {missing_num} questions are missing the 'question_number' field.")
    else:
        print("✅ SUCCESS: All questions have a 'question_number'.")

if __name__ == "__main__":
    audit_technical_questions()
