# Урок 26. Создание первого графа в LangGraph

## Практический пример: Система обработки email

### 1. Установка и настройка

```python
%pip install langgraph langchain_openai langfuse
```

### 2. Определение состояния

```python
from typing import TypedDict, Optional, List, Dict, Any

class EmailState(TypedDict):
    email: Dict[str, Any]  # Входящее письмо
    email_category: Optional[str]  # Категория
    spam_reason: Optional[str]  # Причина спама
    is_spam: Optional[bool]  # Флаг спама
    email_draft: Optional[str]  # Черновик ответа
    messages: List[Dict[str, Any]]  # История сообщений
```

### 3. Создание узлов графа

**Чтение email:**

```python
def read_email(state: EmailState):
    email = state["email"]
    print(f"Обработка письма от {email['sender']}, тема: {email['subject']}")
    return {}
```

**Классификация email:**

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(temperature=0)

def classify_email(state: EmailState):
    prompt = f"""
    Определите, является ли письмо спамом:
    От: {state['email']['sender']}
    Тема: {state['email']['subject']}
    Текст: {state['email']['body']}
    """
    response = model.invoke([HumanMessage(content=prompt)])
    return {
        "is_spam": "спам" in response.content.lower(),
        "messages": state["messages"] + [
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": response.content}
        ]
    }
```

**Обработка спама:**

```python
def handle_spam(state: EmailState):
    print(f"Спам обнаружен! Причина: {state.get('spam_reason', 'не указана')}")
    return {}
```

**Создание ответа:**

```python
def draft_response(state: EmailState):
    prompt = f"Составьте ответ на письмо: {state['email']['body']}"
    response = model.invoke([HumanMessage(content=prompt)])
    return {
        "email_draft": response.content,
        "messages": state["messages"] + [
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": response.content}
        ]
    }
```

### 4. Маршрутизация

```python
def route_email(state: EmailState) -> str:
    return "spam" if state["is_spam"] else "legitimate"
```

### 5. Сборка графа

```python
from langgraph.graph import StateGraph, START, END

builder = StateGraph(EmailState)

# Добавление узлов
builder.add_node("read", read_email)
builder.add_node("classify", classify_email)
builder.add_node("handle_spam", handle_spam)
builder.add_node("draft", draft_response)

# Связи
builder.add_edge(START, "read")
builder.add_edge("read", "classify")
builder.add_conditional_edges(
    "classify",
    route_email,
    {"spam": "handle_spam", "legitimate": "draft"}
)
builder.add_edge("handle_spam", END)
builder.add_edge("draft", END)

workflow = builder.compile()
```

### 6. Запуск workflow

```python
test_email = {
    "sender": "client@example.com",
    "subject": "Вопрос по проекту",
    "body": "Здравствуйте, хотел бы уточнить сроки выполнения."
}

result = workflow.invoke({
    "email": test_email,
    "messages": []
})
```

## Интеграция с Langfuse для мониторинга

### Настройка:

```python
from langfuse.langchain import CallbackHandler

langfuse_handler = CallbackHandler(
    public_key="pk-lf-...",
    secret_key="sk-lf-...",
    host="https://cloud.langfuse.com"
)

workflow.invoke(
    {"email": test_email, "messages": []},
    config={"callbacks": [langfuse_handler]}
)
```

## Визуализация графа

```python
workflow.get_graph().draw_mermaid_png()
```

## Ключевые компоненты системы

1. **Состояние (State)**:

   - Хранит все данные workflow
   - Определяется как TypedDict
   - Передается между узлами

2. **Узлы (Nodes)**:

   - Основные функции обработки
   - Могут вызывать LLM
   - Возвращают обновления состояния

3. **Маршрутизация (Routing)**:

   - Условные переходы между узлами
   - Решения на основе состояния

4. **Инструменты мониторинга**:
   - Langfuse для трейсинга
   - Визуализация графа

**Советы по реализации:**

- Четко определяйте структуру состояния
- Разделяйте логику на атомарные узлы
- Используйте мониторинг для сложных workflow
- Тестируйте все возможные пути выполнения
