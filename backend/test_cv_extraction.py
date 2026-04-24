import requests
import os

def test_extraction():
    url = "http://127.0.0.1:8000/api/user/extract-skills"
    
    # Create a dummy text file with some skill names
    test_file_path = "test_cv.txt"
    with open(test_file_path, "w") as f:
        f.write("I have experience with Python, React, and Fastapi. My skills include Network Security and Cloud Computing.")
    
    with open(test_file_path, "rb") as f:
        files = {"file": ("test_cv.txt", f, "text/plain")}
        try:
            response = requests.post(url, files=files)
            print("Status Code:", response.status_code)
            print("Response JSON:", response.json())
        except Exception as e:
            print("Error connecting to server:", e)
        finally:
            if os.path.exists(test_file_path):
                os.remove(test_file_path)

if __name__ == "__main__":
    test_extraction()
