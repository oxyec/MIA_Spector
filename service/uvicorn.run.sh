#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"   # .../MIA-Spector/service
REPO_ROOT="$(dirname "$SCRIPT_DIR")"          # .../MIA-Spector

cd "$REPO_ROOT"                               # 切到项目根
export PYTHONPATH="$REPO_ROOT"                # 让根目录进 sys.path（能找到 attacks/ 和 src/）
python -m uvicorn app.main:app --app-dir "$SCRIPT_DIR" --host 0.0.0.0 --port 8080 --log-level info


# bash service/uvicorn.run.sh

