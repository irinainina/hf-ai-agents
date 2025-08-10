# Урок 13: Написание действий в виде сниппетов кода или JSON-структур

## Типы агентов в smolagents

1. **Code Agents** - используют Python-сниппеты для выполнения действий
2. **Tool Calling Agents** - используют JSON-структуры для вызова инструментов (стандартный подход OpenAI, Anthropic и др.)

## Разница в подходах

### Пример Code Agent

```python
for query in [
    "Best catering services in Gotham City",
    "Party theme ideas for superheroes"
]:
    print(web_search(f"Search for: {query}"))
```

### Пример Tool Calling Agent (JSON)

```python
[
    {"name": "web_search", "arguments": "Best catering services in Gotham City"},
    {"name": "web_search", "arguments": "Party theme ideas for superheroes"}
]
```

## Особенности Tool Calling Agents

- Генерируют JSON-объекты с указанием инструментов и аргументов
- Подходят для простых систем без сложной обработки переменных
- Используют тот же многошаговый workflow, что и Code Agents

## Пример использования Tool Calling Agent

```python
from smolagents import ToolCallingAgent, DuckDuckGoSearchTool, InferenceClientModel

agent = ToolCallingAgent(tools=[DuckDuckGoSearchTool()], model=InferenceClientModel())

agent.run("Search for the best music recommendations for a party at the Wayne's mansion.")
```

### Результат выполнения

```
╭─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Calling tool: 'web_search' with arguments: {'query': "best music recommendations for a party at Wayne's         │
│ mansion"}                                                                                                       │
╰─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

## Выбор типа агента

- **Code Agents** - лучше подходят для сложных задач
- **Tool Calling Agents** - проще в реализации для базовых сценариев
