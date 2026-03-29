from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.core.config import settings
from app.agents.agent import veda_agent
from app.auth.auth import router as auth_router
import asyncio
import json

app = FastAPI(
    title="VEDA AI",
    version="2.0.0",
    description="Autonomous AI Assistant Backend",
)

# CORS setup for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount auth router
app.include_router(auth_router)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
async def root():
    return {"message": "VEDA AI Backend is running", "status": "online", "version": "2.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        response = veda_agent.process(request.message)
        return {
            "output": response["output"],
            "intermediate_steps": response.get("intermediate_steps", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """Server-Sent Events endpoint for streaming responses."""
    async def event_generator():
        try:
            # Process message (in real streaming, this would yield tokens)
            response = await asyncio.to_thread(veda_agent.process, request.message)
            output = response.get("output", "")

            # Simulate token-by-token streaming for UX
            words = output.split(" ")
            buffer = ""
            for i, word in enumerate(words):
                buffer += word + " "
                yield f"data: {json.dumps({'token': word + ' ', 'done': False})}\n\n"
                await asyncio.sleep(0.02)  # Small delay for streaming effect

            yield f"data: {json.dumps({'token': '', 'done': True, 'full_output': output})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
