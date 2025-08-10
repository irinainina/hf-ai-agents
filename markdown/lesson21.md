# Урок 21. Использование инструментов в LlamaIndex

## Типы инструментов в LlamaIndex

1. **FunctionTool** - обертка для Python-функций
2. **QueryEngineTool** - инструмент для работы с QueryEngine
3. **Toolspecs** - наборы инструментов для специфичных задач
4. **Utility Tools** - утилиты для работы с большими данными

## 1. Создание FunctionTool

### Базовый пример:

```python
from llama_index.core.tools import FunctionTool

def get_weather(location: str) -> str:
    """Получение погоды для указанного местоположения"""
    return f"Погода в {location}: солнечно"

weather_tool = FunctionTool.from_defaults(
    fn=get_weather,
    name="weather_tool",
    description="Получает текущую погоду для указанного города"
)

# Пример вызова
print(weather_tool.call("Москва"))
```

**Ключевые параметры:**

- `fn`: Python-функция для обертки
- `name`: уникальное название инструмента
- `description`: описание для LLM (очень важно!)

## 2. Создание QueryEngineTool

### Пример преобразования QueryEngine в инструмент:

```python
from llama_index.core.tools import QueryEngineTool

query_engine = index.as_query_engine(llm=llm)
engine_tool = QueryEngineTool.from_defaults(
    query_engine=query_engine,
    name="doc_search",
    description="Поиск информации в документах"
)
```

## 3. Работа с Toolspecs

### Пример использования Gmail Toolspec:

```python
from llama_index.tools.google import GmailToolSpec

# Инициализация набора инструментов
gmail_tools = GmailToolSpec().to_tool_list()

# Просмотр доступных инструментов
for tool in gmail_tools:
    print(f"{tool.metadata.name}: {tool.metadata.description}")
```

### Интеграция с MCP (Model Context Protocol):

```python
from llama_index.tools.mcp import BasicMCPClient, McpToolSpec

mcp_client = BasicMCPClient("http://localhost:8000/sse")
mcp_tools = McpToolSpec(client=mcp_client).to_tool_list()
```

## 4. Utility Tools - специальные инструменты

### OnDemandToolLoader:

```python
from llama_index.core.tools import OnDemandToolLoader
from llama_index.readers.web import SimpleWebPageReader

# Создание инструмента из загрузчика
web_loader_tool = OnDemandToolLoader.from_defaults(
    reader=SimpleWebPageReader(),
    name="web_loader"
)
```

### LoadAndSearchToolSpec:

```python
from llama_index.core.tools import LoadAndSearchToolSpec

# Создание пары инструментов загрузки+поиска
load_search_tools = LoadAndSearchToolSpec(
    base_tool=web_loader_tool
).to_tool_list()
```

## Практические рекомендации

1. **Нейминг и описание**:

   - Используйте четкие и описательные названия
   - Подробно описывайте параметры в docstring

2. **Композиция инструментов**:

   - Объединяйте связанные инструменты в Toolspecs
   - Используйте Utility Tools для сложных операций

3. **Безопасность**:

   - Ограничивайте доступ к чувствительным API
   - Валидируйте входные параметры

4. **Производительность**:
   - Кэшируйте результаты тяжелых операций
   - Оптимизируйте работу с контекстом LLM

**Пример комплексного использования:**

```python
# Создаем набор инструментов
tools = [
    weather_tool,
    engine_tool,
    *gmail_tools,
    *mcp_tools,
    *load_search_tools
]

# Инициализируем агента с инструментами
from llama_index.core.agent import ReActAgent
agent = ReActAgent.from_tools(tools, llm=llm)

# Используем агента
response = agent.query("Проверь почту и расскажи о погоде в Москве")
```
