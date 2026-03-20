import requests

try:
    response = requests.get('http://127.0.0.1:8000/api/skills', timeout=5)
    print("Status:", response.status_code)
    data = response.json()
    if isinstance(data, list):
        print(f"Returned {len(data)} skills.")
        if len(data) > 0:
            print("First skill sample:", data[0])
    else:
        print("Returned data:", data)
except Exception as e:
    print("Error:", str(e))
