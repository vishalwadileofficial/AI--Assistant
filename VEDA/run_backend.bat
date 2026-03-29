@echo off
echo Starting VEDA AI Backend...
cd /d "%~dp0\backend"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
    echo Dependencies installed.
) else (
    call venv\Scripts\activate.bat
)

if not exist "models" (
    mkdir models
    echo WARNING: You need to place 'phi-3-mini-4k-instruct.gguf' in backend/models/
    echo Opening download page...
    start https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf
)

echo Running Server...
venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
