# Урок 22. Использование агентов в LlamaIndex

## Типы агентов в LlamaIndex

1. **Function Calling Agents** - работают с моделями, поддерживающими вызов функций
2. **ReAct Agents** - подходят для любых LLM, обеспечивают сложные цепочки рассуждений
3. **Advanced Custom Agents** - для сложных задач и workflow

## Создание базового агента

### Инициализация агента с инструментами:

```python
from llama_index.core.agent import ReActAgent
from llama_index.core.tools import FunctionTool

def multiply(a: int, b: int) -> int:
    """Умножает два числа и возвращает результат"""
    return a * b

# Создаем инструмент из функции
multiply_tool = FunctionTool.from_defaults(multiply)

# Инициализируем агента
agent = ReActAgent.from_tools(
    tools=[multiply_tool],
    llm=llm,  # Предполагается, что llm уже инициализирован
    verbose=True  # Для вывода цепочки рассуждений
)

# Использование агента
response = agent.chat("Сколько будет 5 умножить на 3?")
print(response)
```

## Работа с состоянием (контекстом)

### Сохранение контекста между запросами:

```python
from llama_index.core.agent import AgentChatResponse
from llama_index.core.chat_engine.types import ChatHistory

# Создаем историю чата
chat_history = ChatHistory()

# Первый запрос
response: AgentChatResponse = agent.chat(
    "Меня зовут Иван",
    chat_history=chat_history
)

# Второй запрос с учетом истории
response = agent.chat(
    "Как меня зовут?",
    chat_history=chat_history
)
```

## Создание RAG-агента

### Использование QueryEngine в качестве инструмента:

```python
from llama_index.core.tools import QueryEngineTool

# Создаем инструмент из QueryEngine
rag_tool = QueryEngineTool.from_defaults(
    query_engine=query_engine,  # Предполагается, что query_engine создан ранее
    name="document_search",
    description="Поиск информации в документах"
)

# Инициализируем RAG-агента
rag_agent = ReActAgent.from_tools(
    tools=[rag_tool],
    llm=llm,
    system_prompt="Вы помощник с доступом к базе документов."
)
```

## Мульти-агентные системы

### Пример системы с двумя агентами:

```python
from llama_index.core.agent import AgentWorkflow

# Агент-калькулятор
calc_agent = ReActAgent.from_tools(
    tools=[multiply_tool],
    llm=llm,
    name="Калькулятор",
    description="Выполняет математические операции"
)

# Агент для поиска информации
search_agent = ReActAgent.from_tools(
    tools=[rag_tool],
    llm=llm,
    name="Поисковик",
    description="Ищет информацию в документах"
)

# Создаем workflow
workflow = AgentWorkflow(
    agents=[calc_agent, search_agent],
    root_agent="Калькулятор"  # Стартовый агент
)

# Запускаем систему
response = await workflow.run("Сначала умножь 2 на 3, затем найди информацию о погоде")
```

## Ключевые особенности

1. **Гибкость выбора агентов**:

   - Function Calling для моделей с поддержкой вызова функций
   - ReAct для сложных цепочек рассуждений
   - Возможность создания кастомных агентов

2. **Управление состоянием**:

   - Сохранение контекста между запросами
   - Возможность сброса состояния

3. **Интеграция инструментов**:
   - Простое добавление новых возможностей
   - Комбинирование разных типов инструментов

**Рекомендации по использованию**:

- Начинайте с простых агентов, постепенно усложняя
- Четко описывайте инструменты (name и description)
- Используйте verbose=True для отладки
- Для сложных задач применяйте мульти-агентные системы
