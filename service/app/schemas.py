from pydantic import BaseModel, Field, constr
from typing import Literal, Optional, List, Union, Dict, Any

MetricGroup = Literal["mink", "mink++", "perplexity"]

'''
    定义MIA模型决策接口的数据协议
'''

class DecideRequest(BaseModel):
    text: constr(strip_whitespace=True, min_length=1) # type: ignore
    family: Literal["pythia","llama"] = "pythia"
    model: str
    cfg: str
    metric_group: Literal["mink", "mink++", "perplexity"]
    subkey: Union[str, float]
    mode: Literal["bestJ","fpr_alpha"] = "bestJ"
    abstain_margin: Optional[float] = None

class DeicdeItem(BaseModel):
    id: Optional[str] = None
    text: str
    metric_group: MetricGroup
    subkey: Union[str,float]

class BatchDecideRequest(BaseModel):
    family: Literal["pythia","llama"] = "pythia"
    model: str
    cfg: str
    mode: Literal["bestJ","fpr_alpha"] = "bestJ"
    abstain_margin: Optional[float] = None
    items: List[DeicdeItem]

'''
    {
    "family": "pythia",
    "model": "pythia-410m",
    "cfg": "WikiMIA_length64",
    "mode": "bestJ",
    "abstain_margin": 0.3,
    "items": [
        {"id": "s1", "text": "AI models are data-hungry.", "metric_group": "mink", "subkey": 0.2},
        {"id": "s2", "text": "The mitochondrion is the powerhouse of the cell.", "metric_group": "perplexity", "subkey": "variance"}
    ]
    }
'''

class DecideResponse(BaseModel):
    decision: Literal["Yes","No","Uncertain"]
    confidence: float
    score: float
    threshold: float
    metric_group: str
    subkey: str
    direction: str
    mode: str
    model: str
    cfg: str
    family: str
    id: Optional[str] = None

