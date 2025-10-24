## 🧠 MIA-Spector: Membership Inference Analysis Platform

**MIA-Spector** 是一个面向大模型隐私评估的统一平台，支持 **文本生成模型（LLM）** 与 **多模态模型（图像-文本）** 的成员推理攻击（Membership Inference Attack, MIA）分析与可视化。
本平台由两部分组成：

1. 🧩 **MIA-Inspector API（后端）** — 基于 FastAPI 的 MIA 决策服务
2. 💡 **MIA-Portal（前端）** — 基于 React + Tailwind 的可视化控制台

---

## 🌟 功能总览

| 模块                         | 功能                                            | 技术亮点                                                    |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| **后端 MIA-Inspector API**   | 统一加载多种 LLM（Pythia、LLaMA 等），提供 MIA 指标计算与阈值判定接口 | ✔ FastAPI 异步架构<br>✔ 多模型自动注册 + 缓存加载<br>✔ Prometheus 性能监控 |
| **前端 MIA-Portal 控制台**      | 交互式界面调用后端接口，支持模型选择、配置加载、单样本推断与结果展示            | ✔ 暗色模式美化<br>✔ 响应式布局<br>✔ JSON 高亮可视化                     |
| **安全层 (Auth + RateLimit)** | API Key 鉴权 + Token Bucket 限流算法，防止滥用与爆破        | ✔ 动态读取 `.env`<br>✔ 自定义限速参数<br>✔ 每个客户端独立计数               |
| **指标分析核心 (Metric Engine)** | 支持 Min-K%、Min-K++、PPL、Renyi-entropy 等多种指标     | ✔ 自动加载 YAML 阈值<br>✔ Youden J / FPR@α 模式切换               |
| **系统监控**                   | `/metrics` 接口导出实时统计                           | ✔ 请求量、延迟直方图、GPU 使用率                                     |

---

## 🧩 项目结构

```
MIA-Spector/
│
├── service/
│   ├── app/              ← 后端 API (FastAPI)
│   │   ├── main.py       # 入口
│   │   ├── deps.py       # 模型加载与缓存
│   │   ├── middlewares/  # 限流与鉴权中间件
│   │   ├── routers/      # 路由 (health, meta, decide)
│   │   └── config.py     # 全局配置（含 MODELS, CFGS）
│   │
│   ├── portal/           ← 前端 (React + Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── pages/Console.jsx     # 控制台主界面
│   │   │   ├── components/SectionCard.jsx
│   │   │   └── index.css             # 统一样式
│   │   └── vite.config.js
│   │
│   └── uvicorn.run.sh     # 一键启动脚本
│
├── attacks/               # MIA 指标核心逻辑
├── src/                   # 工具函数 (YAML加载、指标计算)
├── configs/               # 阈值配置文件
├── models/                # 本地模型权重路径
└── README.md
```

---

## ⚙️ 环境安装

### 后端环境

```bash
conda create -n mia-inspector python=3.11
conda activate mia-inspector
pip install -r requirements.txt
```

### 前端环境

```bash
cd service/portal
npm install
```

---

## 🚀 启动与使用

### 🔹 启动后端

```bash
cd service/app
bash ../uvicorn.run.sh
```

或手动：

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

**配置说明**

* `.env` 文件：

  ```bash
  API_KEYS=abc123,def456
  REQUIRE_AUTH=True
  ```
* 鉴权测试：

  ```bash
  curl -H "Authorization: Bearer abc123" http://localhost:8080/healthz
  ```

---

### 🔹 启动前端

```bash
cd service/portal
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173)

首次打开请：

1. 设置 API Base URL 为 `http://localhost:8080`
2. 设置 API Key 为 `.env` 中的密钥（如 `abc123`）
3. 点击「加载 Models/Configs」
4. 输入样本文本并执行推理

---

## 🎯 后端接口说明

| 路径            | 方法   | 功能                |
| ------------- | ---- | ----------------- |
| `/healthz`    | GET  | 健康检查              |
| `/v1/models`  | GET  | 返回可用模型字典          |
| `/v1/configs` | GET  | 返回可用阈值配置          |
| `/v1/decide`  | POST | 执行单样本成员推断         |
| `/metrics`    | GET  | Prometheus 监控指标导出 |

示例请求：

```json
{
  "text": "The mitochondrion is the powerhouse of the cell.",
  "family": "pythia",
  "model": "pythia-410m",
  "cfg": "WikiMIA_length128",
  "metric_group": "mink++",
  "subkey": "0.3",
  "mode": "bestJ"
}
```

---

## 💡 前端功能亮点

| 模块        | 功能                         | 技术                          |
| --------- | -------------------------- | --------------------------- |
| **配置面板**  | API Base、Key、ClientId 动态绑定 | React Hooks + LocalStorage  |
| **模型列表**  | 自动请求 `/v1/models`          | Axios + JSON 视图             |
| **配置列表**  | 自动请求 `/v1/configs`         | 响应式布局 + 暗色优化                |
| **判定区**   | 输入文本、选择模型、指标               | Tailwind 表单组件               |
| **响应展示区** | JSON 美化输出                  | `font-mono` + 内阴影卡片         |
| **全局主题**  | 暗色模式优化                     | `dark:bg-slate-900` + 自定义灰阶 |

---

## 🧠 背景原理

**Membership Inference Attack (MIA)** 是用于评估模型是否泄露训练样本隐私的攻击方式。
核心思想：通过观测模型在输入样本上的输出分布（如 PPL、Min-K%、置信度差距等），判断样本是否属于训练集。

MIA-Spector 将该流程模块化，实现：

* 单样本推断 + 批量分析
* 多指标融合与方向性决策
* 可视化 ROC/AUC 评估
* 跨模型阈值复用（基于 YAML）

---

## 📊 输出示例

```json
{
  "decision": "Uncertain",
  "confidence": 0.67,
  "score": -0.76,
  "threshold": -0.91,
  "metric_group": "mink++",
  "subkey": "0.3",
  "direction": "+",
  "mode": "bestJ"
}
```

---

## 🧾 引用与声明

```bibtex
@misc{MIA-Spector2025,
  title  = {MIA-Spector: Unified Platform for Text and Image Membership Inference Analysis},
  author = {Liu, Jiajun and Collaborators},
  year   = {2025},
  url    = {https://github.com/JiajunLiu/MIA-Spector}
}
```

> ⚠️ 本项目仅供隐私安全研究与防御分析使用，任何将其用于攻击或泄露数据的行为与作者无关。
