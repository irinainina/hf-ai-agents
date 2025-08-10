# Урок 11. Введение в агентные фреймворки

## Ключевые концепции

### Когда использовать фреймворки

- **Простые задачи**: цепочки промптов без фреймворков
- **Сложные сценарии**:
  - Динамический workflow
  - Вызов внешних функций
  - Мультиагентные системы

### Критические компоненты:

1. LLM движок
2. Набор инструментов
3. Парсер действий
4. Системный промпт
5. Механизмы памяти
6. Обработка ошибок

## Сравнение фреймворков

| Фреймворк  | Основная специализация      | Преимущества                  |
| ---------- | --------------------------- | ----------------------------- |
| smolagents | Легковесные Python-агенты   | Простота, интеграция с HF     |
| LlamaIndex | Production-готовые решения  | Готовые шаблоны для продакшна |
| LangGraph  | Сложная оркестрация агентов | Stateful-взаимодействия       |

## Глубокий разбор smolagents

### Основные типы агентов

```python
# CodeAgent - генерация исполняемого кода
from smolagents import CodeAgent
coder = CodeAgent(tools=[python_executor])

# ToolCallingAgent - классический JSON-подход
from smolagents import ToolCallingAgent
tool_agent = ToolCallingAgent(tools=[api_caller])
```

### Работа с инструментами

```python
@tool
def get_weather(location: str) -> dict:
    """Получение текущей погоды
    Args:
        location: Город/страна
    Returns:
        Словарь с температурой и условиями
    """
    return weather_api.fetch(location)
```

### Ключевые возможности:

1. **Гибкие агенты**:

   - CodeAgents для сложной логики
   - ToolCallingAgents для API-интеграций

2. **Retrieval Augmented Generation**:

   - Поиск по векторным БД
   - Веб-браузинг

3. **Мультиагентные системы**:

   ```python
   from smolagents import MultiAgentSystem
   team = MultiAgentSystem([researcher, writer, checker])
   ```

4. **Компьютерное зрение**:
   - Интеграция с VLMs (Llava, GPT-4V)
   - Анализ изображений/скриншотов

## Практический пример

```python
# Инициализация агента-планировщика
planner = CodeAgent(
    tools=[calendar_api, email_sender],
    max_steps=10
)

# Запуск задачи
response = planner.run(
    "Запланируй встречу с клиентом на следующую среду в 15:00"
)
```

**Результат**:

```
Окончательный ответ: Встреча с клиентом запланирована на 12.06.2024 15:00. Приглашение отправлено.
```

## Рекомендации по выбору

1. **smolagents** - для быстрого прототипирования
2. **LlamaIndex** - для готовых production-решений
3. **LangGraph** - для сложных stateful-взаимодействий

## Что дальше?

- Unit 2.2: Продвинутые техники в LlamaIndex
- Unit 2.3: Оркестрация агентов в LangGraph
