'''
    限速，限制访问流量
    Token Bucket 算法
'''

import time
from collections import defaultdict
from fastapi import Request, HTTPException
from config import get_settings
from starlette.middleware.base import BaseHTTPMiddleware

settings = get_settings()

class TokenBucket:
    def __init__(self, rate: float, capacity: int) -> None:
        self.rate = rate  # 每秒产生多少个令牌
        self.capacity = capacity
        self.tokens = capacity
        self.ts = time.time()

    def allow(self) -> bool:
        now = time.time()
        delta = now - self.ts
        self.ts = now

        # back Bucket  令牌数不能超过桶的数量
        self.tokens = min(self.capacity, self.tokens + delta * self.rate)
        # consume
        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False

# 桶的存储
_buckets = defaultdict(lambda: TokenBucket(settings.RATE_LIMIT_RPS, settings.RATE_LIMIT_BURST))

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        key = request.headers.get("X-Client-Id") or request.client.host
        if not _buckets[key].allow():
            raise HTTPException(status_code=429, detail="Too Many Requests")
        return await call_next(request)
