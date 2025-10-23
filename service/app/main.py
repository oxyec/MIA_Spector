from fastapi import FastAPI
from config import get_settings
from auth import APIKeyMiddleware

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)
app.add_middleware(APIKeyMiddleware)

@app.get("/ping")
def ping():
    return {"msg": "pong", "env": settings.APP_ENV}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app",
                host=settings.HOST,
                port=settings.PORT,
                reload=True)
