# VEDA — Autonomous AI Assistant

<p align="center">
  <strong>A privacy-focused, local-first AI assistant.</strong><br>
  No data leaves your machine. Runs entirely on your hardware.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-Next.js_16-000?style=flat-square" alt="Next.js">
  <img src="https://img.shields.io/badge/LLM-Ollama%20%2F%20LlamaCPP-blue?style=flat-square" alt="LLM">
  <img src="https://img.shields.io/badge/License-Open_Source-green?style=flat-square" alt="License">
</p>

---

## 🚀 Overview

VEDA is an autonomous AI assistant built with a **Python/FastAPI** backend and a **Next.js/React** frontend. It connects to locally-running LLMs (via Ollama or llama-cpp-python) to provide intelligent responses, code generation, web search, and math calculations — all without sending data to external servers.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Privacy-First** | 100% local execution — no data leaves your machine |
| 🤖 **AI Chat** | Natural language conversations with markdown-formatted responses |
| 💻 **Code Generation** | Syntax-highlighted code blocks with copy-to-clipboard |
| 🔍 **Web Search** | DuckDuckGo-powered search for real-time information |
| 🧮 **Calculator** | SymPy-powered mathematical expression evaluation |
| 🎨 **Modern UI** | Glassmorphism design, animated orb, sidebar navigation |
| 🔐 **Login System** | JWT-based authentication with demo credentials |
| 📱 **Responsive** | Works on desktop, tablet, and mobile devices |
| ⚡ **Streaming** | Server-Sent Events for real-time token streaming |

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **LLM Engine:** Ollama / llama-cpp-python
- **Auth:** JWT via python-jose
- **Tools:** DuckDuckGo Search, SymPy Calculator
- **Vector Store:** ChromaDB (optional)

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Styling:** TailwindCSS 3
- **Animations:** Framer Motion
- **Markdown:** react-markdown + rehype-highlight + remark-gfm
- **Language:** TypeScript

---

## 📋 Prerequisites

- **Python 3.11+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **Ollama** (Recommended) — [ollama.com](https://ollama.com)
- **GPU** (Optional) — RTX 3050+ for faster local inference

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/veda-ai.git
cd veda-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. AI Model Setup (Choose One)

#### Option A: Ollama (Recommended)

1. Download & install [Ollama](https://ollama.com)
2. Pull a model:
   ```bash
   ollama run phi3
   ```
3. Ollama runs on `http://localhost:11434` — VEDA auto-detects it

#### Option B: LlamaCPP (Manual GGUF)

1. Download a GGUF model (e.g., `phi-3-mini-4k-instruct.gguf`)
2. Place it in `backend/models/`
3. Update `backend/.env`:
   ```env
   MODEL_PATH=models/phi-3-mini-4k-instruct.gguf
   N_GPU_LAYERS=-1
   ```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

---

## ▶️ Running Locally

### Quick Start (Windows)

```bash
# Terminal 1 — Backend
run_backend.bat

# Terminal 2 — Frontend
run_frontend.bat
```

### Manual Start

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Linux/macOS
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Demo Login

| Field | Value |
|-------|-------|
| Email | `admin@veda.ai` |
| Password | `veda2024` |

---

## 📁 Folder Structure

```
VEDA/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   └── agent.py          # AI agent (Ollama/LlamaCPP/Mock)
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   └── auth.py           # JWT login/verify endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py         # Settings (pydantic-settings)
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── calculator.py     # SymPy math tool
│   │   │   └── search.py         # DuckDuckGo search tool
│   │   └── __init__.py
│   ├── models/                    # GGUF model files (gitignored)
│   ├── .env                       # Environment variables
│   ├── main.py                    # FastAPI entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login page
│   │   │   ├── globals.css        # Design system
│   │   │   ├── layout.tsx         # Root layout + AuthProvider
│   │   │   └── page.tsx           # Main chat page (protected)
│   │   ├── components/
│   │   │   ├── AuthContext.tsx     # Auth state management
│   │   │   ├── ChatInterface.tsx   # Main chat with sidebar
│   │   │   ├── MarkdownRenderer.tsx# Markdown + code highlighting
│   │   │   └── ThreeScene.tsx      # Animated AI orb
│   │   └── lib/
│   │       └── api.ts             # API client + streaming
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.ts
├── run_backend.bat                 # Windows backend launcher
├── run_frontend.bat                # Windows frontend launcher
└── README.md
```

---

## 🌐 Deployment

### Vercel (Frontend Only)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Set **Root Directory** to `frontend`
5. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
6. Click **Deploy**

> **Note:** You'll need to deploy the backend separately (see below) and update the `API_URL` in `frontend/src/lib/api.ts`.

### Netlify (Frontend Only)

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → **New site from Git**
3. Set **Base directory** to `frontend`
4. Set **Build command** to `npm run build`
5. Set **Publish directory** to `frontend/.next`
6. Add environment variables as needed
7. Click **Deploy site**

### Self-Hosted (Full Stack)

```bash
# On your server:
git clone https://github.com/your-username/veda-ai.git
cd veda-ai

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Install Ollama and pull a model
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 &

# Frontend
cd ../frontend
npm install
npm run build
npm start  # Runs on port 3000
```

Use **nginx** or **Caddy** as a reverse proxy to serve both on a single domain.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_NAME` | `VEDA AI` | Application name |
| `MODEL_PATH` | `models/phi-3-mini-4k-instruct.gguf` | Path to GGUF model file |
| `N_GPU_LAYERS` | `-1` | GPU layers to offload (-1 = all) |

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Status check |
| `GET` | `/health` | Health check |
| `POST` | `/chat` | Send message, get response |
| `POST` | `/chat/stream` | SSE streaming response |
| `POST` | `/auth/login` | Login with credentials |
| `GET` | `/auth/verify?token=...` | Verify JWT token |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by the VEDA team
</p>
