import asyncio
from main import get_mcq_assessment, submit_mcq_assessment, MCQSubmission
import json
import logging

# Suppress logging to keep output clean
logging.getLogger("main").setLevel(logging.ERROR)

async def test():
    try:
        # Test 1
        res1 = await get_mcq_assessment("eman@gmail.com")
        print("TEST 1 OUTPUT:")
        # We only print the first skill to keep it short if it's too long
        print(json.dumps(res1, indent=2))
        
        # Test 2
        sub = MCQSubmission(email="eman@gmail.com", answers=[], shuffled_options={})
        res2 = await submit_mcq_assessment(sub)
        print("\nTEST 2 OUTPUT:")
        print(json.dumps(res2, indent=2))
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test())
