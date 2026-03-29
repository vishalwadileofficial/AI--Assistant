from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VEDA AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Model Settings (Default to Phi-3 Mini GGUF path)
    MODEL_PATH: str = "models/phi-3-mini-4k-instruct.gguf"
    N_GPU_LAYERS: int = -1  # Offload all to GPU
    
    class Config:
        env_file = ".env"

settings = Settings()
