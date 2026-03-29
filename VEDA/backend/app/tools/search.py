from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import Tool

search = DuckDuckGoSearchRun()

search_tool = Tool(
    name="WebSearch",
    func=search.run,
    description="Useful for searching the internet for current events, facts, or information you don't know."
)
