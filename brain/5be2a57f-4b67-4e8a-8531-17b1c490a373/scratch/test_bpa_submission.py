import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_assessment_submission():
    payload = {
        "major": "Information System",
        "skill_name": "Business Process Analysis",
        "answers": [
            {
                "question_number": 1,
                "selected_option_text": "To evaluate and understand existing processes to identify areas for improvement"
            },
            {
                "question_number": 2,
                "selected_option_text": "To visualize and understand the flow of activities within a process"
            },
            {
                "question_number": 3,
                "selected_option_text": "By providing insights into process performance and areas for improvement"
            }
        ]
    }
    
    print(f"Sending payload: {json.dumps(payload, indent=2)}")
    response = requests.post(f"{BASE_URL}/api/technical-assessment/score", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    test_assessment_submission()
