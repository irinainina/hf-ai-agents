# Урок 20. Компоненты в LlamaIndex

## Основные концепции

### Компонент QueryEngine

- Основа для создания RAG (Retrieval-Augmented Generation) систем
- Решает проблему ограниченных знаний LLM:
  - Достает актуальные данные
  - Обеспечивает контекст для генерации ответов

### 5 этапов RAG-пайплайна:

1. **Загрузка данных** (Loading)
2. **Индексация** (Indexing)
3. **Хранение** (Storing)
4. **Запросы** (Querying)
5. **Оценка** (Evaluation)

## Практическая реализация

### 1. Загрузка документов

```python
from llama_index.core import SimpleDirectoryReader

# Загрузка файлов из директории
reader = SimpleDirectoryReader(input_dir="data/")
documents = reader.load_data()
```

### 2. Обработка и индексация

```python
from llama_index.core.ingestion import IngestionPipeline
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# Пайплайн обработки
pipeline = IngestionPipeline(
    transformations=[
        SentenceSplitter(chunk_size=512, chunk_overlap=20),
        HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
    ]
)

# Асинхронная обработка документов
nodes = await pipeline.arun(documents=documents)
```

### 3. Хранение в векторной БД (ChromaDB)

```python
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore

# Инициализация ChromaDB
db = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = db.get_or_create_collection("documents")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)

# Добавление хранилища в пайплайн
pipeline.vector_store = vector_store
```

### 4. Создание индекса

```python
from llama_index.core import VectorStoreIndex

index = VectorStoreIndex.from_vector_store(
    vector_store,
    embed_model=HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
)
```

## Работа с запросами

### Варианты интерфейсов запросов:

- `as_retriever()` - базовый поиск документов
- `as_query_engine()` - вопрос-ответ
- `as_chat_engine()` - чат с историей

### Пример создания QueryEngine:

```python
from llama_index.llms.huggingface_api import HuggingFaceInferenceAPI

llm = HuggingFaceInferenceAPI(model_name="Qwen/Qwen2.5-Coder-32B-Instruct")
query_engine = index.as_query_engine(
    llm=llm,
    response_mode="tree_summarize"  # Стратегии: refine/compact/tree_summarize
)

response = query_engine.query("Какие битвы произошли в Нью-Йорке во время Американской революции?")
```

## Оценка качества

### Типы оценщиков:

- `FaithfulnessEvaluator` - соответствие ответа контексту
- `AnswerRelevancyEvaluator` - релевантность ответа вопросу
- `CorrectnessEvaluator` - фактическая точность

### Пример оценки:

```python
from llama_index.core.evaluation import FaithfulnessEvaluator

evaluator = FaithfulnessEvaluator(llm=llm)
eval_result = evaluator.evaluate_response(response=response)
print(f"Ответ соответствует контексту: {eval_result.passing}")
```

## Наблюдаемость (Observability)

### Настройка трейсинга:

```python
import llama_index
import os

os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"api_key=<PHOENIX_API_KEY>"
llama_index.core.set_global_handler(
    "arize_phoenix",
    endpoint="https://llamatrace.com/v1/traces"
)
```

## Ключевые особенности

1. **Гибкость обработки**:

   - Различные стратегии разбиения текста
   - Поддержка кастомных эмбеддинг-моделей
   - Множество векторных хранилищ

2. **Стратегии ответов**:

   - Refine - последовательное уточнение
   - Compact - объединение чанков
   - Tree Summarize - древовидная структура

3. **Мониторинг качества**:
   - Встроенные evaluators
   - Интеграция с инструментами observability
   - Трейсинг запросов

**Рекомендации**:

- Начинайте с простых пайплайнов
- Экспериментируйте с разными chunk_size/chunk_overlap
- Обязательно оценивайте качество ответов
- Используйте трейсинг для сложных workflow
