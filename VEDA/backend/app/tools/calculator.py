from langchain_core.tools import Tool
from sympy import sympify, N

def calculate_expression(expression: str) -> str:
    """Evaluate a mathematical expression using SymPy."""
    try:
        # Safety: sympify uses eval, but is generally safer than pure eval. 
        # For a local assistant, this is acceptable.
        expr = sympify(expression)
        result = N(expr) # Numeric evaluation
        return str(result)
    except Exception as e:
        return f"Error calculating: {str(e)}"

calculator_tool = Tool(
    name="Calculator",
    func=calculate_expression,
    description="Useful for solving math problems. Input should be a mathematical expression like '2 + 2' or 'sqrt(5)'."
)
