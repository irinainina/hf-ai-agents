# Урок 23. Создание агентных workflow в LlamaIndex

## Основные концепции

Workflow в LlamaIndex позволяют организовать выполнение задач в структурированные последовательные процессы с:

- Четким разделением на шаги
- Управлением состоянием
- Поддержкой сложной логики выполнения
- Интеграцией агентов и инструментов

## Создание простого workflow

### Базовый пример:

```python
from llama_index.core.workflow import StartEvent, StopEvent, Workflow, step

class BasicWorkflow(Workflow):
    @step
    async def first_step(self, ev: StartEvent) -> StopEvent:
        return StopEvent(result="Первый шаг выполнен")

workflow = BasicWorkflow()
result = await workflow.run()
```

## Многошаговые процессы

### Передача данных между шагами:

```python
class DataEvent(Event):
    processed_data: str

class MultiStepWorkflow(Workflow):
    @step
    async def step1(self, ev: StartEvent) -> DataEvent:
        return DataEvent(processed_data="Данные обработаны")

    @step
    async def step2(self, ev: DataEvent) -> StopEvent:
        return StopEvent(result=f"Результат: {ev.processed_data}")
```

## Сложные сценарии

### Ветвление и циклы:

```python
class DecisionEvent(Event):
    should_continue: bool
    payload: str

class ComplexWorkflow(Workflow):
    @step
    async def decision_step(self, ev: StartEvent | DecisionEvent) -> DecisionEvent | StopEvent:
        if isinstance(ev, StartEvent) or ev.should_continue:
            return DecisionEvent(should_continue=False, payload="Новые данные")
        return StopEvent(result="Завершено")
```

## Визуализация

### Генерация диаграммы workflow:

```python
from llama_index.utils.workflow import draw_all_possible_flows

draw_all_possible_flows(workflow, "workflow_diagram.html")
```

## Работа с состоянием

### Сохранение данных в контексте:

```python
from llama_index.core.workflow import Context

class StatefulWorkflow(Workflow):
    @step
    async def save_data(self, ctx: Context, ev: StartEvent) -> StopEvent:
        await ctx.store.set("my_key", "значение")
        value = await ctx.store.get("my_key")
        return StopEvent(result=value)
```

## Мульти-агентные системы

### Создание workflow с несколькими агентами:

```python
from llama_index.core.agent.workflow import AgentWorkflow, ReActAgent

# Инициализация агентов
math_agent = ReActAgent(
    name="Математик",
    tools=[add, multiply],
    llm=llm
)

research_agent = ReActAgent(
    name="Исследователь",
    tools=[query_tool],
    llm=llm
)

# Сборка workflow
workflow = AgentWorkflow(
    agents=[math_agent, research_agent],
    root_agent="Математик",
    initial_state={"counter": 0}
)

# Запуск системы
response = await workflow.run("Посчитай 2+2 и найди информацию")
```

### Инструменты с доступом к состоянию:

```python
async def add(ctx: Context, a: int, b: int) -> int:
    state = await ctx.store.get("state")
    state["operations_count"] += 1
    await ctx.store.set("state", state)
    return a + b
```

## Лучшие практики

1. **Проектирование**:

   - Разбивайте сложные процессы на простые шаги
   - Четко определяйте типы событий

2. **Отладка**:

   - Используйте визуализацию для сложных workflow
   - Логируйте ключевые точки процесса

3. **Производительность**:

   - Оптимизируйте критические шаги
   - Используйте кэширование для тяжелых операций

4. **Безопасность**:
   - Валидируйте входные данные
   - Ограничивайте доступ к состоянию

**Пример комплексного workflow**:

```python
class DocumentProcessingWorkflow(Workflow):
    @step
    async def load_docs(self, ev: StartEvent) -> LoadEvent:
        # Загрузка документов
        return LoadEvent(docs=[...])

    @step
    async def process_content(self, ev: LoadEvent) -> ProcessEvent:
        # Обработка содержимого
        return ProcessEvent(entities=[...])

    @step
    async def generate_report(self, ev: ProcessEvent) -> StopEvent:
        # Генерация отчета
        return StopEvent(result="Отчет готов")
```
