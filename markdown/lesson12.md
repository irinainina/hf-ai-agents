# Урок 12. Почему выбирают smolagents

## Основные преимущества smolagents

### Ключевые особенности фреймворка:

1. **Простота использования**

   - Минималистичный код
   - Понятные абстракции
   - Быстрый старт проектов

2. **Гибкость работы с LLM**

   ```python
   # Пример подключения разных моделей
   from smolagents import InferenceClientModel, TransformersModel

   hf_model = InferenceClientModel(model_id="meta-llama/Llama-3-70B")
   local_model = TransformersModel(model="mistral-7b")
   ```

3. **Code-First подход**

   - Прямая генерация исполняемого кода вместо JSON
   - Не требует сложного парсинга

4. **Интеграция с экосистемой HF**
   - Использование инструментов из Hugging Face Hub
   - Развертывание через Gradio Spaces

## Когда выбирать smolagents?

### Идеальные сценарии:

- Прототипирование и эксперименты
- Простые и средние по сложности задачи
- Проекты, где важна скорость разработки

### Альтернативы для других случаев:

- Сверхсложные workflow → LangGraph
- Готовые продакшн-решения → LlamaIndex

## Сравнение подходов к действиям

| Параметр      | Code Agents            | JSON Agents                    |
| ------------- | ---------------------- | ------------------------------ |
| Формат вывода | Исполняемый Python-код | JSON-структура                 |
| Парсинг       | Не требуется           | Обязателен                     |
| Гибкость      | Высокая                | Ограниченная                   |
| Пример        | ```python              | ```json                        |
|               | get_weather("London")  | {"action":"get_weather",       |
|               | ```                    | "input":{"location":"London"}} |

## Типы агентов в smolagents

### MultiStepAgent (базовый класс)

1. Генерация "мысли"
2. Вызов инструмента
3. Исполнение действия

### Основные реализации:

```python
from smolagents import CodeAgent, ToolCallingAgent

# Агент, генерирующий код
code_agent = CodeAgent(tools=[python_executor])

# Агент, работающий через JSON
tool_agent = ToolCallingAgent(tools=[api_caller])
```

## Подключение моделей

### Доступные варианты:

1. **Локальные модели**:

   ```python
   TransformersModel("mistral-7b")
   ```

2. **Бессерверные HF-модели**:

   ```python
   InferenceClientModel("meta-llama/Llama-3-70B")
   ```

3. **Сторонние API**:
   ```python
   LiteLLMModel(provider="openai", model="gpt-4")
   ```

## Практические рекомендации

1. **Для начинающих**:

   - Начинать с CodeAgent
   - Использовать InferenceClientModel

2. **Для production**:

   - Добавлять обработку ошибок
   - Тестировать с разными моделями

3. **Для сложных задач**:
   - Комбинировать CodeAgent и ToolCallingAgent
   - Использовать мультиагентные системы

Пример workflow:

````
Мысль: Нужно узнать погоду для планирования встречи
Действие:

```python
get_weather("London")
````

Наблюдение: Температура 20°C, солнечно
Окончательный ответ: Погода подходит для встречи на улице

```

```
