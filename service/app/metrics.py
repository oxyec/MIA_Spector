from prometheus_client import Counter, Histogram, Gauge

REQ_COUNTER = Counter("mia_requests_total", "Total API requests", ["route", "method"])
REQ_LATENCY = Histogram("mia_request_latency_ms", "Request latency (ms)", ["route"], buckets=(10,25,50,100,200,400,800,1600))
DECIDE_YES = Counter("mia_decision_yes_total", "Number of Yes decisions", ["metric_group"])
DECIDE_UNCERTAIN = Counter("mia_decision_uncertain_total", "Number of Uncertain decisions", ["metric_group"])
GPU_IN_USE = Gauge("mia_gpu_in_use", "GPU in use (1/0)")
