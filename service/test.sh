# 健康检查（如果没把 /healthz 放免鉴权，则也要带头）
curl -H "Authorization: Bearer abc123" http://localhost:8080/healthz

# 模型/配置
curl -H "Authorization: Bearer abc123" http://localhost:8080/v1/models
curl -H "Authorization: Bearer abc123" http://localhost:8080/v1/configs

# 指标（如果不免鉴权，也带上）
curl -H "Authorization: Bearer abc123" http://localhost:8080/metrics
