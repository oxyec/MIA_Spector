import time, json
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class JSONLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return Response(status_code=200)
        
        start = time.time()
        resp = await call_next(request)
        cost = (time.time() - start) * 1000
        record = {
            "method": request.method,
            "path": request.url.path,
            "status": resp.status_code,
            "latency_ms": round(cost, 2),
            "client_ip": request.client.host if request.client else None,
        }
        print(json.dumps(record, ensure_ascii=False))
        return resp
