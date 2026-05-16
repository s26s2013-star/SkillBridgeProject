import requests

res = requests.post(
    'http://127.0.0.1:8000/api/technical-assessment/case-study',
    data={
        'skill_name': 'Network Security',
        'case_study_text': 'I would use a firewall and segment the network.'
    }
)
print(res.status_code)
print(res.json())
