'''
    限速，限制访问流量
    Token Bucket 算法
'''

import time, asyncio
from collections import defaultdict
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import get_settings

settings = get_settings()

class TokenBucket:
    def __init__(self, rate: float, capacity: int) -> None:
        self.rate = rate  # 每秒产生多少个令牌
        self.capacity = capacity
        self.tokens = capacity
        self.ts = time.monotonic()
        self._lock = asyncio.Lock()

    async def allow(self, cost: float = 1.0) -> bool:
        now = time.monotonic()
        delta = now - self.ts
        self.ts = now

        # back Bucket  令牌数不能超过桶的数量
        self.tokens = min(self.capacity, self.tokens + delta * self.rate)
        # consume
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False
    
    async def remaining(self) -> int:
        async with self._lock:
            return int(max(0.0, self.tokens))

def _client_key(request: Request) -> str:
    cid = (request.headers.get("X-Client-Id") or "").strip()
    if cid:
        return cid
    client = getattr(request, "client", None)
    host = getattr(client, "host", None) if client else None
    return host or "unknown-client"

# 桶的存储
_buckets = defaultdict(lambda: TokenBucket(settings.RATE_LIMIT_RPS, settings.RATE_LIMIT_BURST))

def _key_from_request(req: Request) -> str:
    return req.headers.get("X-Client-Id") or req.headers.get("Authorization") or req.client.host

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        key = _client_key(request)
        bucket = _buckets[key]

        if not await bucket.allow():
            remaining = await bucket.remaining()
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests"},
                headers={
                    "X-RateLimit-Limit": str(settings.RATE_LIMIT_RPS),
                    "X-RateLimit-Burst": str(settings.RATE_LIMIT_BURST),
                    "X-RateLimit-Remaining": str(remaining),
                    "Retry-After": "1",
                },
            )

        resp = await call_next(request)
        remaining = await bucket.remaining()
        resp.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_RPS)
        resp.headers["X-RateLimit-Burst"] = str(settings.RATE_LIMIT_BURST)
        resp.headers["X-RateLimit-Remaining"] = str(remaining)
        return resp
