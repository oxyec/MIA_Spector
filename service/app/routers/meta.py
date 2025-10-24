from fastapi import APIRouter
from app.config import get_settings

settings = get_settings()

router = APIRouter(prefix="/v1")

@router.get("/models")
def list_models():
    return settings.MODELS

@router.get("/configs")
def list_configs():
    return settings.CFGS
