# Урок 27. Document Analysis Graph

## Основные концепции

Система анализа документов с использованием LangGraph для:

- Обработки изображений
- Извлечения текста (Vision Language Model)
- Выполнения расчетов
- Анализа содержимого
- Выполнения инструкций

## 1. Настройка окружения

```python
%pip install langgraph langchain_openai langchain_core
```

### Необходимые импорты

```python
import base64
from typing import List, TypedDict, Annotated, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import AnyMessage, SystemMessage, HumanMessage
from langgraph.graph.message import add_messages
from langgraph.graph import START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
```

## 2. Состояние агента

```python
class AgentState(TypedDict):
    input_file: Optional[str]  # Путь к файлу (PDF/PNG)
    messages: Annotated[list[AnyMessage], add_messages]
```

## 3. Инструменты системы

### Извлечение текста из изображения

```python
def extract_text(img_path: str) -> str:
    with open(img_path, "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode()

    response = ChatOpenAI(model="gpt-4o").invoke([
        HumanMessage(content=[
            {"type": "text", "text": "Извлеки текст из изображения"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_base64}"}}
        ])
    ])
    return response.content
```

### Математические операции

```python
def divide(a: int, b: int) -> float:
    return a / b
```

### Инициализация инструментов

```python
tools = [divide, extract_text]
llm = ChatOpenAI(model="gpt-4o").bind_tools(tools)
```

## 4. Построение графа

### Узел ассистента

```python
def assistant(state: AgentState):
    system_msg = SystemMessage(content="Вы помощник Альфред. Доступные инструменты: ...")
    return {
        "messages": [llm.invoke([system_msg] + state["messages"])],
        "input_file": state["input_file"]
    }
```

### Сборка графа

```python
builder = StateGraph(AgentState)
builder.add_node("assistant", assistant)
builder.add_node("tools", ToolNode(tools))

builder.add_edge(START, "assistant")
builder.add_conditional_edges("assistant", tools_condition)
builder.add_edge("tools", "assistant")

graph = builder.compile()
```

## Примеры работы

### Пример 1: Деление чисел

```python
graph.invoke({
    "messages": [HumanMessage(content="Раздели 6790 на 5")],
    "input_file": None
})
```

### Пример 2: Анализ меню

```python
graph.invoke({
    "messages": [HumanMessage(content="Что нужно купить по списку?")],
    "input_file": "menu.png"
})
```

## Архитектура системы

ReAct Pattern:

- Reason - Анализ запроса
- Act - Вызов инструмента
- Observe - Обработка результата
- Повтор до получения ответа

## Ключевые особенности

- Поддержка мультимодальности (текст + изображения)
- Расширяемая система инструментов
- Поддержка контекста диалога
- Обработка ошибок
