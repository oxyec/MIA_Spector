from fastapi import APIRouter, HTTPException
from app.schemas import DecideRequest, DecideResponse, BatchDecideRequest
from app.deps import get_calc, get_cfg
from app.metrics import REQ_COUNTER, REQ_LATENCY, DECIDE_YES, DECIDE_UNCERTAIN
from src.metric_score import compute_single_metric
from src.load_yaml import decide_single

import time
import numpy as np

router = APIRouter(prefix="/v1")

@router.post("/decide", response_model=DecideResponse)
def decide(req: DecideRequest):
    t0 = time.time()
    REQ_COUNTER.labels(route="/v1/decide", method="POST").inc()  # 计数器+1
    try:
        calc = get_calc(req.family, req.model)
        cfg = get_cfg(req.family, req.cfg)
        subkey = req.subkey
        score = None
        try:
            score = compute_single_metric(calc, req.text, req.metric_group, subkey, on_error="nan")
        except TypeError:
            score = compute_single_metric(calc, req.text, req.metric_group, subkey)
        if not (isinstance(score, float) and np.isfinite(score)):
            raise HTTPException(status_code=422, detail="Invalid score (text too short or NaN).")
        
        out = decide_single(
            cfg,
            req.metric_group,
            subkey, 
            score_raw=score, 
            mode=req.mode, 
            abstain_margin=req.abstain_margin
        )

        if out["decision"] == "Yes":
            DECIDE_YES.labels(req.metric_group).inc
        elif out["decision"] == "Uncertain":
            DECIDE_UNCERTAIN.labels(req.metric_group).inc()
        return DecideResponse(
            **out, model=req.model, cfg=req.cfg, family=req.family
        )
    finally:
        REQ_LATENCY.labels(route="/v1/decide").observe((time.time()-t0)*1000)

@router.post("/batch_decide", response_model=list[DecideResponse])
def batch_decide(req: BatchDecideRequest):
    t0 = time.time()
    REQ_COUNTER.labels(route="/v1/batch_decide", method="POST").inc()
    try:
        calc = get_calc(req.family, req.model)
        cfg = get_cfg(req.family, req.cfg)
        results = []
        for item in req.items:
            try:
                score = compute_single_metric(calc, item.text, item.metric_group, item.subkey, on_error="nan")
            except TypeError:
                score = compute_single_metric(calc, item.text, item.metric_group, item.subkey)
            
            if not (isinstance(score, float) and np.isfinite(score)):
                res = DecideResponse(
                    decision="Uncertain", confidence=0.0, score=float("nan"), threshold=float("nan"),
                    metric_group=item.metric_group, subkey=str(item.subkey), direction="+", mode=req.mode,
                    model=req.model, cfg=req.cfg, family=req.family, id=item.id,
                )
            else:
                out = decide_single(cfg, item.metric_group, item.subkey, score_raw=score, mode=req.mode, abstain_margin=req.abstain_margin)
                res = DecideResponse(**out, model=req.model, cfg=req.cfg, family=req.family, id=item.id)
            results.append(res)
        return results
    finally:
        REQ_LATENCY.labels(route="/v1/batch_decide").observe((time.time()-t0)*1000)
