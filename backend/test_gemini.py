from dotenv import load_dotenv
import os
import google.generativeai as genai
import logging

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print("API KEY:", api_key[:10] if api_key else "None")

genai.configure(api_key=api_key)
models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
for model_name in models:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("hello")
        print(f"Model {model_name} success:", response.text[:20])
    except Exception as e:
        print(f"Model {model_name} failed:", e)
