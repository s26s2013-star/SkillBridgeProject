import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_score_endpoint(payload):
    print(f"\nTesting with payload: {json.dumps(payload, indent=2)}")
    response = requests.post(f"{BASE_URL}/api/technical-assessment/score", json=payload)
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Raw Response: {response.text}")

# 1. Valid-looking payload
test_score_endpoint({
    "major": "Cloud Computing",
    "skill_name": "Containers",
    "answers": [
        {"question_number": 1, "selected_option_text": "They avoid running full independent systems"},
        {"question_number": 2, "selected_option_text": "Tools specifically designed for containerized applications"},
        {"question_number": 3, "selected_option_text": "They ensure consistent environments across all stages of deployment"}
    ]
})

# 2. Missing skill_name (Should cause 422)
test_score_endpoint({
    "major": "Cloud Computing",
    "answers": []
})

# 3. Wrong data type for question_number (Should cause 422)
test_score_endpoint({
    "skill_name": "Containers",
    "answers": [
        {"question_number": "one", "selected_option_text": "test"}
    ]
})

# 4. Answers not a list (Should cause 422)
test_score_endpoint({
    "skill_name": "Containers",
    "answers": {"1": "text"}
})
