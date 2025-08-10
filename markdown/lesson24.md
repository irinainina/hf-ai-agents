# Урок 24. Введение в LangGraph

## Основные концепции LangGraph

### Что такое LangGraph?

- Фреймворк для управления workflow приложений с LLM
- Дает контроль над последовательностью выполнения операций
- Работает в связке с LangChain, но может использоваться отдельно

### Когда использовать?

1. **Многоэтапные процессы** с четкой логикой выполнения
2. **Сложные ветвления** на основе решений LLM
3. **Системы с сохранением состояния** между шагами
4. **Процессы с участием человека** (human-in-the-loop)
5. **Продуктовые решения**, требующие предсказуемости

## Ключевые компоненты

### Структура графа:

- **Ноды** (Nodes) - отдельные шаги обработки
- **Ребра** (Edges) - переходы между шагами
- **Состояние** (State) - сохраняемые данные между шагами

### Преимущества перед чистым Python:

- Встроенная визуализация workflow
- Готовые инструменты логирования
- Упрощенное управление состоянием
- Поддержка human-in-the-loop

## Базовый пример workflow

### Установка:

```bash
pip install langgraph
```

### Простой граф с двумя нодами:

```python
from langgraph.graph import Graph
from langgraph.prebuilt import chat_agent_executor

# Определяем ноды
def node1(state):
    return {"data": state["input"] + " обработано"}

def node2(state):
    return {"result": state["data"].upper()}

# Строим граф
workflow = Graph()
workflow.add_node("processor", node1)
workflow.add_node("formatter", node2)
workflow.add_edge("processor", "formatter")
workflow.set_entry_point("processor")

# Запускаем
result = workflow.run({"input": "тестовые данные"})
print(result["result"])  # ТЕСТОВЫЕ ДАННЫЕ ОБРАБОТАНО
```

## Сложные сценарии

### Ветвление на основе решений LLM:

```python
from langchain_core.messages import HumanMessage

def router(state):
    last_message = state["messages"][-1]
    if "таблица" in last_message.content:
        return "table_route"
    return "text_route"

workflow = Graph()
workflow.add_node("router", router)
workflow.add_conditional_edges(
    "router",
    router,
    {
        "table_route": "process_table",
        "text_route": "process_text"
    }
)
```

### Работа с состоянием:

```python
def process_doc(state):
    # Получаем текущее состояние
    doc_type = state["doc_type"]

    # Модифицируем состояние
    state["processed"] = True

    # Добавляем новые данные
    state["metadata"] = {"timestamp": datetime.now()}

    return state
```

## Интеграция с LangChain

### Пример агента для обработки документов:

```python
from langchain.agents import AgentExecutor
from langgraph.prebuilt import ToolNode

# Создаем инструменты
tools = [document_loader, table_extractor]

# Нода для выполнения инструментов
tool_node = ToolNode(tools)

# Добавляем в граф
workflow.add_node("tools", tool_node)
workflow.add_edge("tools", "end")
```

## Ключевые особенности

1. **Гибкость**:

   - Комбинация детерминированных и LLM-шагов
   - Динамическое изменение flow

2. **Масштабируемость**:

   - Простое добавление новых нод
   - Параллельное выполнение задач

3. **Отладка**:
   - Визуализация графа
   - Логирование каждого шага

**Рекомендации**:

- Начинайте с простых линейных графов
- Четко определяйте типы состояний
- Используйте conditional edges для сложной логики
- Интегрируйте с LangChain для работы с инструментами
