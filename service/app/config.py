from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Dict
from functools import lru_cache

class Settings(BaseSettings):
    # ========== 基础 ==========
    APP_NAME: str = Field("MIA-Inspector API", description="应用名称")
    APP_ENV: str = Field("dev", description="运行环境：dev/prod")
    HOST: str = Field("0.0.0.0", description="监听主机地址")
    PORT: int = Field(8080, description="监听端口")

    # ========== 鉴权 ==========
    API_KEYS: str = Field("", description="逗号分隔的 API Key 列表")  # e.g. "key1,key2"
    REQUIRE_AUTH: bool = Field(True, description="是否启用 API Key 鉴权")

    class Config:
        env_file = "/home/wanghuili/MIA-Spector/service/.env"          # 自动加载 .env 文件
        env_file_encoding = "utf-8"
        case_sensitive = False     # 环境变量名大小写不敏感

    # 限流
    RATE_LIMIT_RPS: float = 5.0       # 每秒令牌
    RATE_LIMIT_BURST: int = 20        # 桶容量

    # 模型与阈值 注意，模型路径必须改成你的路径
    FAMILY_DEFAULT: str = "pythia"
    MODELS: Dict[str, Dict[str, str]] = {
        "pythia": {
            "pythia-410m": "/home/wanghuili/MIA-Spector/models/pythia/pythia-410m",
            "pythia-1.4b": "/home/wanghuili/MIA-Spector/models/pythia/pythia-1.4b",
            "pythia-2.8b": "/home/wanghuili/MIA-Spector/models/pythia/pythia-2.8b",
        },
        "llama": {
            "llama-13b": "/home/wanghuili/MIA-Spector/models/llama/llama-13b-hf",
            "llama-30b": "/home/wanghuili/MIA-Spector/models/llama/llama-30b-hf",
        },
    }
    CFGS: Dict[str, Dict[str, str]] = {
        "pythia": {
            "WikiMIA_length32":  "/home/wanghuili/MIA-Spector/configs/text/pythia/threshold_WikiMIA_length32.yaml",
            "WikiMIA_length64":  "/home/wanghuili/MIA-Spector/configs/text/pythia/threshold_WikiMIA_length64.yaml",
            "WikiMIA_length128": "/home/wanghuili/MIA-Spector/configs/text/pythia/threshold_WikiMIA_length128.yaml",
            "WikiMIA_length256": "/home/wanghuili/MIA-Spector/configs/text/pythia/threshold_WikiMIA_length256.yaml",
        },
        "llama": {
            "WikiMIA_length32":  "/home/wanghuili/MIA-Spector/configs/text/llama/threshold_WikiMIA_length32.yaml",
            "WikiMIA_length64":  "/home/wanghuili/MIA-Spector/configs/text/llama/threshold_WikiMIA_length64.yaml",
            "WikiMIA_length128": "/home/wanghuili/MIA-Spector/configs/text/llama/threshold_WikiMIA_length128.yaml",
            "WikiMIA_length256": "/home/wanghuili/MIA-Spector/configs/text/llama/threshold_WikiMIA_length256.yaml",
        },
    }


@lru_cache()
def get_settings() -> Settings:
    """返回单例配置对象（防止多次加载 .env）"""
    return Settings()


# 在其他模块中这样导入使用：
# from .config import get_settings
# settings = get_settings()
