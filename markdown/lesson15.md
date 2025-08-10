# Урок 15. Построение Agentic RAG систем

## Основные концепции

### Традиционный RAG vs Agentic RAG

| Характеристика       | Традиционный RAG           | Agentic RAG                      |
| -------------------- | -------------------------- | -------------------------------- |
| Процесс поиска       | Одноэтапный                | Многоэтапный, адаптивный         |
| Формирование запроса | Прямой семантический поиск | Динамическая оптимизация запроса |
| Критика результатов  | Отсутствует                | Анализ релевантности             |
| Гибкость             | Ограниченная               | Высокая                          |

## Базовый поиск с DuckDuckGo

**Пример простого агента для веб-поиска:**

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool, InferenceClientModel

search_tool = DuckDuckGoSearchTool()
model = InferenceClientModel()
agent = CodeAgent(model=model, tools=[search_tool])

response = agent.run(
    "Поищи идеи для роскошной вечеринки в стиле супергероев, включая декор, развлечения и кейтеринг."
)
print(response)
```

**Процесс работы агента:**

1. Анализ запроса
2. Выполнение поиска
3. Синтез информации
4. Сохранение для последующего использования

## Работа с пользовательской базой знаний

### Создание инструмента для семантического поиска

```python
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from smolagents import Tool
from langchain_community.retrievers import BM25Retriever

class PartyPlanningRetrieverTool(Tool):
    name = "party_planning_retriever"
    description = "Семантический поиск идей для вечеринок"

    inputs = {
        "query": {"type": "string", "description": "Запрос, связанный с организацией вечеринки"}
    }
    output_type = "string"

    def __init__(self, docs, **kwargs):
        super().__init__(**kwargs)
        self.retriever = BM25Retriever.from_documents(docs, k=5)

    def forward(self, query: str) -> str:
        docs = self.retriever.invoke(query)
        return "\nНайденные идеи:\n" + "\n\n".join(
            f"===== Идея {i} =====\n{doc.page_content}"
            for i, doc in enumerate(docs)
        )

# Создание тестовой базы знаний
party_ideas = [
    {"text": "Маскарад в стиле супергероев с роскошным декором...", "source": "Идея 1"},
    {"text": "Наймите профессионального DJ для тематической музыки...", "source": "Идея 2"}
]

docs = [Document(page_content=doc["text"], metadata={"source": doc["source"]})
        for doc in party_ideas]

# Разделение документов на чанки
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", " ", ""]
)
docs_processed = text_splitter.split_documents(docs)

# Инициализация агента
agent = CodeAgent(
    tools=[PartyPlanningRetrieverTool(docs_processed)],
    model=InferenceClientModel()
)

response = agent.run("Найди идеи для роскошной вечеринки супергероев")
print(response)
```

## Усовершенствованные методы поиска

### Ключевые стратегии Agentic RAG:

1. **Реформулировка запроса**

   - Оптимизация поисковых терминов
   - Пример: "роскошная вечеринка" → "элитные мероприятия супергерои тематика"

2. **Декомпозиция запроса**  
   Разбиение сложного запроса на подзапросы:

   - Декор
   - Развлечения
   - Кейтеринг

3. **Расширение запроса**  
   Генерация вариаций запроса для более полного покрытия

4. **Переранжирование результатов**  
   Использование Cross-Encoders для оценки релевантности

5. **Многоэтапный поиск**  
   Итеративное уточнение запросов на основе предыдущих результатов

6. **Интеграция источников**  
   Комбинирование данных из:

   - Веб-поиска
   - Локальных баз знаний
   - Специализированных API

7. **Валидация результатов**  
   Проверка:
   - Актуальности
   - Достоверности
   - Релевантности запросу

## Практические рекомендации

- **Выбор инструментов** - зависит от типа запроса и контекста
- **Системы памяти** - для сохранения истории и избежания повторных запросов
- **Резервные стратегии** - обработка случаев, когда основной метод поиска не сработал
- **Валидация** - обязательный этап перед использованием найденной информации
