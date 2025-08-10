# Урок 25. Основные компоненты LangGraph

## Ключевые элементы LangGraph

### 1. Состояние (State)

Определяет данные, передаваемые между узлами графа:

```python
from typing_extensions import TypedDict

class AppState(TypedDict):
    current_status: str
    processed_data: dict
```

**Рекомендации:**

- Включайте только необходимые поля
- Используйте понятные названия
- Определяйте типы данных

### 2. Узлы (Nodes)

Функции, обрабатывающие состояние:

```python
def process_input(state: AppState) -> dict:
    return {"current_status": "processing"}

def generate_response(state: AppState) -> dict:
    return {"response": f"Processed: {state['current_status']}"}
```

**Типы узлов:**

- LLM-вызовы
- Инструменты
- Условная логика
- Пользовательский ввод

### 3. Ребра (Edges)

Определяют переходы между узлами:

**Прямое ребро:**

```python
builder.add_edge("start_node", "process_node")
```

**Условное ребро:**

```python
def router(state: AppState) -> str:
    if "urgent" in state["email"]:
        return "priority_path"
    return "standard_path"

builder.add_conditional_edges(
    "router_node",
    router,
    {"priority_path": "fast_process", "standard_path": "normal_process"}
)
```

### 4. StateGraph

Контейнер для всего workflow:

**Сборка графа:**

```python
from langgraph.graph import StateGraph

builder = StateGraph(AppState)

# Добавление узлов
builder.add_node("input_node", process_input)
builder.add_node("response_node", generate_response)

# Связи
builder.add_edge("input_node", "response_node")
builder.add_edge("response_node", END)

# Компиляция
workflow = builder.compile()
```

## Полный пример

### Инициализация графа:

```python
import random
from langgraph.graph import StateGraph, END

class State(TypedDict):
    message: str
    mood: str

def create_message(state: State):
    return {"message": "Привет, как дела?"}

def happy_path(state: State):
    return {"mood": "счастлив", "message": state["message"] + " Отлично!"}

def sad_path(state: State):
    return {"mood": "грустен", "message": state["message"] + " Не очень..."}

def decide_mood(state: State) -> str:
    return "happy" if random.random() > 0.5 else "sad"

# Сборка
builder = StateGraph(State)
builder.add_node("create", create_message)
builder.add_node("happy", happy_path)
builder.add_node("sad", sad_path)
builder.add_edge(START, "create")
builder.add_conditional_edges(
    "create",
    decide_mood,
    {"happy": "happy", "sad": "sad"}
)
builder.add_edge("happy", END)
builder.add_edge("sad", END)

graph = builder.compile()
```

### Запуск workflow:

```python
result = graph.invoke({"message": ""})
print(result["message"])  # Пример: "Привет, как дела? Отлично!"
```

## Визуализация графа

### Генерация диаграммы:

```python
from IPython.display import Image

Image(graph.get_graph().draw_mermaid_png())
```

## Практические советы

1. **Проектирование состояния**:

   - Минимизируйте количество полей
   - Группируйте связанные данные

2. **Организация узлов**:

   - Делайте узлы атомарными
   - Разделяйте обработку и логику маршрутизации

3. **Обработка ошибок**:

   - Добавляйте узлы для обработки сбоев
   - Реализуйте механизмы повтора

4. **Тестирование**:
   - Проверяйте каждый узел отдельно
   - Тестируйте все возможные пути выполнения

**Шаблон для сложных workflow:**

```python
class ComplexState(TypedDict):
    input_data: dict
    processing_steps: list
    current_status: str
    error: Optional[str]

def validation_node(state: ComplexState):
    if not state["input_data"]:
        return {"error": "No input data"}
    return {"current_status": "validated"}
```
