# Урок 14. Tools в smolagents

## Основные понятия

- **Инструменты (Tools)** - функции, которые LLM может вызывать в рамках агентной системы
- Для работы с инструментом LLM нуждается в описании интерфейса:
  - Название инструмента
  - Описание функционала
  - Типы и описания входных параметров
  - Тип возвращаемого значения

## Способы создания инструментов

### 1. Декоратор `@tool`

Рекомендуемый способ для простых инструментов. Smolagents автоматически парсит информацию о функции из Python.

**Пример: инструмент поиска кейтеринга**

```python
from smolagents import CodeAgent, InferenceClientModel, tool

@tool
def catering_service_tool(query: str) -> str:
    """
    This tool returns the highest-rated catering service in Gotham City.

    Args:
        query: A search term for finding catering services.
    """
    services = {
        "Gotham Catering Co.": 4.9,
        "Wayne Manor Catering": 4.8,
        "Gotham City Events": 4.7,
    }
    best_service = max(services, key=services.get)
    return best_service

agent = CodeAgent(tools=[catering_service_tool], model=InferenceClientModel())
result = agent.run("Find the best catering in Gotham City")
print(result)  # Output: Gotham Catering Co.
```

### 2. Класс `Tool`

Подходит для сложных инструментов. Требует явного указания метаданных.

**Пример: генератор тем для вечеринки**

```python
from smolagents import Tool, CodeAgent, InferenceClientModel

class SuperheroPartyThemeTool(Tool):
    name = "superhero_party_theme_generator"
    description = "Suggests superhero-themed party ideas based on a category."

    inputs = {
        "category": {
            "type": "string",
            "description": "Type of superhero party (e.g., 'classic heroes', 'villain masquerade').",
        }
    }
    output_type = "string"

    def forward(self, category: str):
        themes = {
            "classic heroes": "Justice League Gala...",
            "villain masquerade": "Gotham Rogues' Ball...",
            "futuristic Gotham": "Neo-Gotham Night..."
        }
        return themes.get(category.lower(), "Theme not found.")

party_theme_tool = SuperheroPartyThemeTool()
agent = CodeAgent(tools=[party_theme_tool], model=InferenceClientModel())
result = agent.run("Suggest a party theme for 'villain masquerade'")
print(result)  # Output: Gotham Rogues' Ball...
```

## Стандартные инструменты

Smolagents включает предустановленные инструменты:

- `PythonInterpreterTool`
- `FinalAnswerTool`
- `UserInputTool`
- `DuckDuckGoSearchTool`
- `GoogleSearchTool`
- `VisitWebpageTool`

## Работа с инструментами из сообщества

### Публикация инструмента на Hugging Face Hub

```python
party_theme_tool.push_to_hub("username/party_theme_tool", token="API_TOKEN")
```

### Загрузка инструмента с Hub

```python
from smolagents import load_tool
image_generation_tool = load_tool("m-ric/text-to-image", trust_remote_code=True)
```

### Использование Hugging Face Space как инструмента

```python
from smolagents import Tool
image_generation_tool = Tool.from_space(
    "black-forest-labs/FLUX.1-schnell",
    name="image_generator",
    description="Generate an image from a prompt"
)
```

### Интеграция инструментов LangChain

```python
from langchain.agents import load_tools
from smolagents import Tool
search_tool = Tool.from_langchain(load_tools(["serpapi"])[0])
```

### Использование инструментов из MCP серверов

```python
from smolagents import ToolCollection
from mcp import StdioServerParameters

server_parameters = StdioServerParameters(
    command="uvx",
    args=["--quiet", "pubmedmcp@0.1.3"],
    env={"UV_PYTHON": "3.12", **os.environ},
)

with ToolCollection.from_mcp(server_parameters, trust_remote_code=True) as tools:
    agent = CodeAgent(tools=[*tools.tools], model=model)
    agent.run("Find a remedy for hangover")
```
