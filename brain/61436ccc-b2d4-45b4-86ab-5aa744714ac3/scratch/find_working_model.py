import os
import google.generativeai as genai
from dotenv import load_dotenv

# Use absolute path for .env
env_path = r"c:\Users\user\Downloads\SkillBridgeProject-main\backend\.env"
load_dotenv(dotenv_path=env_path)
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No GEMINI_API_KEY found")
else:
    genai.configure(api_key=api_key)
    models_to_try = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
    ]
    
    for model_name in models_to_try:
        print(f"Trying model: {model_name}...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Ping")
            print(f" SUCCESS: {model_name} works! Response: {response.text}")
            break
        except Exception as e:
            print(f" FAILED: {model_name} - {e}")
