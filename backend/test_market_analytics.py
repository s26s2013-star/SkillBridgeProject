import asyncio
from main import get_market_analytics
import json
import logging

logging.getLogger("main").setLevel(logging.ERROR)
logging.getLogger("httpx").setLevel(logging.ERROR)

async def test():
    try:
        # Test without refresh (fallback or db)
        print("Testing basic fetch...")
        res = await get_market_analytics()
        print(json.dumps(res, indent=2))
        
        # Test with refresh
        print("\nTesting refresh...")
        res2 = await get_market_analytics(refresh=True)
        print(json.dumps(res2, indent=2))
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test())
