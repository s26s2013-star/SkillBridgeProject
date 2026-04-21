import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_save_result(payload, description):
    print(f"\n--- Testing: {description} ---")
    print(f"Sending payload: {json.dumps(payload, indent=2)}")
    response = requests.post(f"{BASE_URL}/api/assessment/result", json=payload)
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Raw Response: {response.text}")

# 1. Valid payload
test_save_result({
    "userId": "test@example.com",
    "skillId": "React",
    "answers": "{\"1\":\"option\"}",
    "aiScore": 80,
    "status": "completed",
    "completedAt": "2024-04-16T12:00:00Z"
}, "Valid Payload")

# 2. Missing userId (Expected 422)
test_save_result({
    "skillId": "React",
    "answers": "text",
    "aiScore": 80,
    "completedAt": "date"
}, "Missing userId")

# 3. answers as OBJECT instead of string (Expected 422)
test_save_result({
    "userId": "test@example.com",
    "skillId": "React",
    "answers": {"1": "text"},
    "aiScore": 80,
    "completedAt": "date"
}, "Answers as Object")

# 4. aiScore as string (Expected 422)
test_save_result({
    "userId": "test@example.com",
    "skillId": "React",
    "answers": "text",
    "aiScore": "high",
    "completedAt": "date"
}, "aiScore as String")
