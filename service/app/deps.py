from functools import lru_cache
from typing import Dict, Any
from transformers import AutoTokenizer, AutoModelForCausalLM
from app.config import get_settings

from attacks.attack_text import ScoreCalculator
from src.metric_score import compute_single_metric 
from src.load_yaml import decide_single, load_yaml_config

import torch

settings = get_settings()

'''
    functools.lru_cache 的 LRU 特性：当缓存达到上限时，最近最少使用的缓存会被移除
'''

@lru_cache(maxsize=8)  # 最大缓存8个模型
def get_calc(family: str, model_key: str) -> 'ScoreCalculator':
    family = family.lower().strip()

    hf_id = settings.MODELS[family][model_key]

    # Define Parameters
    use_fast = False if family == "llama" else True
    trust_remote = True if family == "llama" else False
    tok = AutoTokenizer.from_pretrained(hf_id, use_fast=use_fast, trust_remote_code=trust_remote)

    if tok.pad_token is None:
        tok.pad_token = tok.eos_token

    tok.padding_side = "left"
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32

    mdl = AutoModelForCausalLM.from_pretrained(hf_id, torch_dtype=dtype, device_map="auto", trust_remote_code=trust_remote)
    mdl.eval()

    return ScoreCalculator(model=mdl, tokenizer=tok)

@lru_cache(maxsize=32) 
def get_cfg(family: str, cfg_key: str) -> Dict[str, Any]: 
    return load_yaml_config(settings.CFGS[family][cfg_key])
