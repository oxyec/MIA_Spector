'''
    并发压测限流 
'''

import asyncio
import time
import httpx
from collections import Counter

BASE_URL = "http://127.0.0.1:8080/ping"

GOOD_TOKEN = "abc123"
BAD_TOKEN = "nope"

CLIENT_ID = "tester-101"

async def hit(session: httpx.AsyncClient, with_auth: bool = True) -> int:
    headers = {
        "X-Client-Id": CLIENT_ID
    }
    if with_auth:
        headers["Authorization"] = f"Bearer {GOOD_TOKEN}"

    try:
        r = await session.get(BASE_URL, headers=headers, timeout=10.0)
        return r.status_code
    except Exception:
        return -1
    
async def burst_test(total: int = 50, concurrency: int = 50, with_auth: bool = True):
    limits = httpx.Limits(max_keepalive_connections=concurrency, max_connections=concurrency)
    async with httpx.AsyncClient(limits=limits) as session:
        sem = asyncio.Semaphore(concurrency)
        async def task():
            async with sem:
                return await hit(session, with_auth=with_auth)

        t0 = time.time()
        results = await asyncio.gather(*[task() for _ in range(total)])
        dt = time.time() - t0

    counter = Counter(results)
    print(f"\n=== Burst Test (total={total}, conc={concurrency}, auth={with_auth}) ===")
    print(f"Time: {dt:.3f}s, ~{total/dt:.1f} req/s")
    for code, cnt in sorted(counter.items()):
        print(f"HTTP {code}: {cnt}")
    if 429 in counter:
        print("→ 看到 429 说明限流已触发（Too Many Requests）")
    if 401 in counter:
        print("→ 看到 401 说明鉴权在生效（Unauthorized）")

async def main():
    print("1) 单次请求对比：未鉴权/已鉴权")
    async with httpx.AsyncClient() as session:
        code_no_auth = await hit(session, with_auth=False)
        code_auth    = await hit(session, with_auth=True)
        print(f"no-auth status={code_no_auth}  (期望 401)")
        print(f"auth    status={code_auth}     (期望 200)")

    print("\n2) 并发突发测试：同一个 X-Client-Id，触发限流")
    await burst_test(total=50, concurrency=1, with_auth=True)

    print("\n3) 再做一组短突发（更容易看到 200+429 混合）")
    await burst_test(total=50, concurrency=1, with_auth=True)

if __name__ == "__main__":
    asyncio.run(main())

# python test_access.py
