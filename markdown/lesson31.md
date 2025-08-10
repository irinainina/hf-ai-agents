# Урок 31. Создание интеллектуального агента Alfred для организации мероприятий

## 1. Импорт необходимых компонентов

```python
from smolagents import CodeAgent, InferenceClientModel
from tools import DuckDuckGoSearchTool, WeatherInfoTool, HubStatsTool
from retriever import load_guest_dataset
```

## 2. Инициализация инструментов агента

```python
# Базовые инструменты
model = InferenceClientModel()
search_tool = DuckDuckGoSearchTool()
weather_tool = WeatherInfoTool()
hub_stats_tool = HubStatsTool()
guest_info_tool = load_guest_dataset()
```

## 3. Создание и настройка агента

```python
alfred = CodeAgent(
    tools=[guest_info_tool, weather_tool, hub_stats_tool, search_tool],
    model=model,
    add_base_tools=True,  # Включение базовых инструментов
    planning_interval=3   # Частота планирования действий
)
```

## 4. Практические примеры использования

### Пример 1: Получение информации о госте

```python
response = alfred.run("Расскажи о Леди Аде Лавлейс")
print(response)
```

**Типичный вывод**:

Леди Ада Лавлейс - математик, считается первым программистом.
Email: ada.lovelace@example.com

### Пример 2: Комплексный запрос

```python
response = alfred.run("Какая погода в Париже? Подойдет ли для фейерверков?")
print(response)
```

**Типичный вывод**:
Погода ясная, +25°C - идеально для фейерверков.

## 5. Работа с памятью агента

```python
# Первый запрос
alfred.run("Кто такой Никола Тесла?", reset=False)

# Второй запрос с использованием контекста
alfred.run("Какие у него последние работы?", reset=False)
```

## Ключевые особенности реализации:

1. **Модульная архитектура** - каждый инструмент в отдельном модуле
2. **Гибкая конфигурация** - возможность добавлять/удалять инструменты
3. **Поддержка контекста** - через параметр reset=False
4. **Автоматическое планирование** - каждые 3 шага (planning_interval)

## Важные ограничения:

- Память не сохраняется между разными запусками агента
- Для сложных запросов требуется точная формулировка
