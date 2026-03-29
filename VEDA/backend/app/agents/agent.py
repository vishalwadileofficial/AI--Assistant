import requests
import json

class OllamaClient:
    def __init__(self, base_url="http://localhost:11434", model="phi3"):
        self.base_url = base_url
        self.model = model
        self.system_prompt = (
            "You are VEDA, an intelligent AI assistant. Follow these rules strictly:\n"
            "1. When providing code, ALWAYS wrap it in markdown fenced code blocks with the language specified (e.g. ```python, ```javascript, ```bash).\n"
            "2. Use proper markdown formatting: **bold**, *italic*, headers (#), bullet points (-), numbered lists.\n"
            "3. Be concise but thorough. Structure your answers with clear sections.\n"
            "4. For technical explanations, use inline code with backticks for variable names, functions, and commands.\n"
            "5. If asked to write code, write complete, runnable code with proper error handling.\n"
        )

    def is_available(self):
        try:
            requests.get(f"{self.base_url}/api/tags", timeout=2)
            return True
        except Exception:
            return False

    def invoke(self, prompt: str):
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": self.system_prompt,
            "stream": False,
        }
        try:
            res = requests.post(f"{self.base_url}/api/generate", json=payload, timeout=120)
            if res.status_code == 200:
                return res.json().get("response", "Error: Empty response from Ollama")
            return f"Error: Ollama returned status {res.status_code}"
        except requests.Timeout:
            return "Error: Request timed out. The model may be loading — try again in a moment."
        except Exception as e:
            return f"Error querying Ollama: {e}"


from typing import List, Dict, Any
import os
from app.core.config import settings

# Try to import real AI dependencies
try:
    from langchain_community.llms import LlamaCpp
    from langchain.agents import AgentExecutor, create_react_agent
    from langchain_core.prompts import PromptTemplate
    from app.tools.calculator import calculator_tool
    from app.tools.search import search_tool

    DEPENDENCIES_INSTALLED = True
except ImportError:
    # Check for legacy langchain
    try:
        from langchain.llms import LlamaCpp
        from langchain.agents import AgentExecutor, initialize_agent, AgentType
        from langchain.prompts import PromptTemplate
        from app.tools.calculator import calculator_tool
        from app.tools.search import search_tool
        DEPENDENCIES_INSTALLED = True
    except ImportError:
        DEPENDENCIES_INSTALLED = False


class VedaAgent:
    def __init__(self):
        self.llm = None
        self.agent_executor = None

    def initialize(self):
        pass

    def process(self, input_text: str) -> Dict[str, Any]:
        return {"output": "Error: Agent not initialized properly."}


class MockAgent:
    """Fallback agent when no AI backend is available."""
    def process(self, input_text: str) -> Dict[str, Any]:
        return {
            "output": (
                f"**System Status:** 🟢 ONLINE (Mock Mode)\n\n"
                f"I received your message:\n> {input_text}\n\n"
                f"However, the AI Engine is not currently available. "
                f"To enable real AI responses:\n\n"
                f"1. **Install Ollama** from [ollama.com](https://ollama.com)\n"
                f"2. Run `ollama run phi3` in your terminal\n"
                f"3. Restart the backend server\n\n"
                f"VEDA will automatically detect and use Ollama!"
            ),
            "intermediate_steps": []
        }


# Factory to choose the right agent
def get_agent():
    # 1. Try Dependency-based Agent (LlamaCPP / LangChain)
    if DEPENDENCIES_INSTALLED and 'RealVedaAgent' in globals():
        try:
            if os.path.exists(settings.MODEL_PATH):
                return RealVedaAgent()
        except Exception:
            pass

    # 2. Try Ollama (Dependency-Free Fallback)
    ollama = OllamaClient(model="phi3")
    if ollama.is_available():
        print("✓ Ollama detected! Using Ollama as AI Backend.")

        class OllamaAgentWrapper:
            def process(self, input_text: str) -> Dict[str, Any]:
                response = ollama.invoke(input_text)
                return {"output": response, "intermediate_steps": []}
        return OllamaAgentWrapper()

    # 3. Fallback to Mock
    print("⚠ No AI Engine found (LlamaCPP missing, Ollama not running). Running in MOCK MODE.")
    return MockAgent()


# Define RealVedaAgent if dependencies are available
if DEPENDENCIES_INSTALLED:
    try:
        try:
            from langchain_community.llms import LlamaCpp
            from langchain.agents import AgentExecutor, create_react_agent
            from langchain_core.prompts import PromptTemplate
        except ImportError:
            from langchain.llms import LlamaCpp
            from langchain.agents import AgentExecutor, initialize_agent, AgentType
            from langchain.prompts import PromptTemplate

        class RealVedaAgent:
            def __init__(self):
                self.agent_executor = None
                self.tools = [calculator_tool, search_tool]

            def initialize(self):
                self.llm = LlamaCpp(
                    model_path=settings.MODEL_PATH,
                    n_gpu_layers=settings.N_GPU_LAYERS,
                    n_batch=512,
                    n_ctx=2048,
                    f16_kv=True,
                    verbose=True,
                )

                if 'create_react_agent' in globals():
                    template = """You are VEDA, an intelligent AI assistant. Answer questions using available tools when needed.
Always format code in markdown fenced code blocks with the language specified.
Use proper markdown formatting for all responses.

You have access to these tools:
{tools}

Tool names: {tool_names}

Question: {input}
Thought:{agent_scratchpad}"""
                    prompt = PromptTemplate.from_template(template)
                    agent = create_react_agent(self.llm, self.tools, prompt)
                    self.agent_executor = AgentExecutor(
                        agent=agent,
                        tools=self.tools,
                        verbose=True,
                        handle_parsing_errors=True,
                        max_iterations=5,
                    )
                else:
                    self.agent_executor = initialize_agent(
                        tools=self.tools,
                        llm=self.llm,
                        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
                        verbose=True,
                        handle_parsing_errors=True,
                    )

            def process(self, input_text: str) -> Dict[str, Any]:
                if not self.agent_executor:
                    self.initialize()
                return self.agent_executor.invoke({"input": input_text})

    except Exception:
        pass

# Final export
veda_agent = get_agent()
