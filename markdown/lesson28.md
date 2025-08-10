# Урок 28. Agentic RAG для организации гала-ужина

## Основная концепция

Создание агента Alfred с использованием Agentic RAG для:

- Ответов на вопросы о гостях
- Получения актуальной информации (погода, новости)
- Управления событиями вечера
- Избегания конфликтных тем

## Архитектура решения

### Компоненты системы

1. **RAG-модуль** - поиск в базе данных гостей
2. **Web Search** - актуальные данные из интернета
3. **Weather API** - прогноз погоды для фейерверков
4. **Контроль тем** - фильтр запрещенных тем (политика, религия)

## Реализация

### 1. Настройка окружения

```python
%pip install langchain openai weaviate-client requests
```

### 2. База данных гостей (RAG)

```python
from langchain.vectorstores import Weaviate
from langchain.embeddings import OpenAIEmbeddings

vectorstore = Weaviate.from_documents(
    documents=guest_profiles,
    embedding=OpenAIEmbeddings(),
    weaviate_url="http://localhost:8080"
)

def retrieve_guest_info(query: str) -> str:
    docs = vectorstore.similarity_search(query, k=3)
    return "\n\n".join([d.page_content for d in docs])
```

### 3. Инструменты агента

```python
from langchain.tools import tool
import requests

@tool
def get_weather(city: str) -> str:
    """Получить текущую погоду для планирования фейерверков"""
    response = requests.get(f"https://api.weatherapi.com/v1/current.json?key=API_KEY&q={city}")
    return response.json()["current"]["condition"]

@tool
def web_search(query: str) -> str:
    """Поиск актуальной информации в интернете"""
    return DuckDuckGoSearchResults().run(query)
```

### 4. Инициализация агента

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

tools = [retrieve_guest_info, get_weather, web_search]
agent = create_openai_tools_agent(llm, tools, prompt_template)
agent_executor = AgentExecutor(agent=agent, tools=tools)
```

## Примеры использования

### Запрос о госте

```python
response = agent_executor.invoke({
    "input": "Расскажи о профессиональных достижениях Марии Кюри",
    "restricted_topics": ["политика", "религия"]
})
```

### Планирование фейерверков

```python
response = agent_executor.invoke({
    "input": "Когда лучше запускать фейерверк учитывая погоду?",
    "location": "Париж"
})
```

## Безопасность и ограничения

```python
def topic_filter(response: str) -> str:
    restricted = ["политика", "религия"]
    if any(topic in response.lower() for topic in restricted):
        return "Извините, эта тема не для обсуждения на гала-ужине"
    return response
```

## Ключевые особенности

1. **Динамический поиск** - комбинация RAG и веб-поиска
2. **Контекстная осведомленность** - знание о гостях и событиях
3. **Безопасность** - автоматическая фильтрация тем
4. **Интеграция с API** - погода, новости в реальном времени
