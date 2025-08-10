# Урок 10. Создание агента с smolagents

## Основные концепции

### Библиотека smolagents

- Легковесная библиотека для создания AI агентов
- Абстрагирует сложности работы с агентами
- Использует подход "Код как действие" (Code Agent)
- Поддерживает цикл "Мысль → Действие → Наблюдение"

## Создание агента

### Инициализация

```python
from smolagents import CodeAgent, load_tool
from tools.final_answer import FinalAnswerTool

model = InferenceClientModel(
    model_id='Qwen/Qwen2.5-Coder-32B-Instruct',
    max_tokens=2096,
    temperature=0.5
)

agent = CodeAgent(
    model=model,
    tools=[FinalAnswerTool()],
    max_steps=6,
    verbosity_level=1
)
```

## Работа с инструментами

### Пример создания инструмента

```python
def get_current_time(timezone: str) -> str:
    """Получение текущего времени в указанном часовом поясе.
    Аргументы:
        timezone: Часовой пояс (например 'Europe/Moscow')
    """
    try:
        tz = pytz.timezone(timezone)
        return datetime.datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return f"Ошибка: {str(e)}"
```

### Загрузка готовых инструментов

```python
search_tool = DuckDuckGoSearchTool()
image_tool = load_tool("agents-course/text-to-image")
```

## Ключевые особенности smolagents

1. **Автоматизация жизненного цикла**:

   - Обработка действий
   - Управление контекстом
   - Ограничение максимальных шагов

2. **Интеграция инструментов**:

   - Поддержка кастомных функций
   - Работа с готовыми инструментами из Hub
   - Автоматическая документация

3. **Гибкость**:
   - Настройка промптов через YAML
   - Поддержка разных LLM
   - Регулировка параметров генерации

## Развертывание агента

### Через Hugging Face Spaces

1. Дублируем шаблон Space
2. Редактируем app.py
3. Добавляем нужные инструменты
4. Публикуем изменения

### Интерфейс Gradio

```python
from Gradio_UI import GradioUI
GradioUI(agent).launch()
```

## Рекомендации по улучшению

1. Добавлять описания к инструментам
2. Тестировать с разными LLM
3. Контролировать max_steps для баланса
4. Использовать готовые инструменты из сообщества

Пример финального ответа:

```
Окончательный ответ: Текущее время в Москве: 2023-11-15 14:30:45
```

## Следующие шаги

1. Оптимизация работы агента
2. Добавление сложных инструментов
3. Интеграция с внешними API
4. Улучшение обработки ошибок
