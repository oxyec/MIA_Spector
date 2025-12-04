# Windows 11 & Docker Guide for MIA-Spector

This guide explains how to run MIA-Spector on Windows 11 using either Docker (recommended) or a native setup.

## Prerequisites

- **Git**: [Download Git](https://git-scm.com/downloads)
- **Docker Desktop**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended method)
  - Ensure WSL 2 backend is enabled.
- **Python 3.11** (For native setup only)
- **Node.js 18+** (For native setup only)
- **NVIDIA Drivers**: If you have an NVIDIA GPU and want to use it with Docker, ensure you have the latest drivers and CUDA support in WSL 2.

---

## Method 1: Using Docker (Recommended)

This method spins up both the Backend and Frontend with a single command.

### 1. Setup Environment Variables

Copy the example environment file:

```powershell
cp .env.example .env
```

Edit `.env` if you want to change API keys or disable authentication.

### 2. Run with Docker Compose

Open a terminal (PowerShell or Command Prompt) in the project root and run:

```powershell
docker-compose up --build
```

- The **Backend** will be available at: `http://localhost:8080`
- The **Frontend** will be available at: `http://localhost:5173`

### GPU Support

The `docker-compose.yml` is configured to use NVIDIA GPUs if available.
- If you have an NVIDIA GPU and Docker Desktop with WSL 2, it should work automatically.
- If you do **not** have a GPU, the container will still run, though you might see a warning about missing devices.

### Troubleshooting Docker

- **Port Conflicts**: Ensure ports `8080` and `5173` are not in use.
- **Build Failures**: If the build fails due to network issues, try running `docker-compose build --no-cache`.

---

## Method 2: Native Windows Setup

If you prefer running directly on Windows without Docker.

### 1. Backend Setup

1.  **Install Python 3.11** and ensure it's in your PATH.
2.  Create a virtual environment (optional but recommended):
    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate
    ```
3.  Install dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
4.  Run the backend using the provided PowerShell script:
    ```powershell
    .\service\uvicorn.run.ps1
    ```

### 2. Frontend Setup

1.  **Install Node.js 18+**.
2.  Navigate to the portal directory:
    ```powershell
    cd service\portal
    ```
3.  Install dependencies:
    ```powershell
    npm install
    ```
4.  Start the frontend:
    ```powershell
    npm run dev
    ```

### 3. Usage

Visit [http://localhost:5173](http://localhost:5173) in your browser. Configure the API Base URL to `http://localhost:8080` and enter your API Key.
