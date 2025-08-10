# Урок 16. Мульти-агентные системы

## Основные концепции

### Преимущества мульти-агентных систем:

- **Специализация** - каждый агент выполняет свою узкую задачу
- **Модульность** - легко добавлять/удалять агентов
- **Масштабируемость** - распределение нагрузки
- **Отказоустойчивость** - при падении одного агента система продолжает работать

### Типичная архитектура:

1. **Менеджер-агент** - координирует работу других агентов
2. **Агент-интерпретатор кода** - выполняет Python код
3. **Агент веб-поиска** - ищет информацию в интернете

## Практическая реализация

### Пример: поиск мест съемок Бэтмена

**Установка необходимых пакетов:**

```python
pip install 'smolagents[litellm]' plotly geopandas shapely kaleido -q
```

**Инструмент для расчета времени перелета:**

```python
from smolagents import tool
import math

@tool
def calculate_cargo_travel_time(
    origin_coords: tuple[float, float],
    destination_coords: tuple[float, float],
    cruising_speed_kmh: float = 750.0
) -> float:
    """Рассчитывает время перелета между двумя точками на Земле"""
    # Реализация формулы гаверсинусов
    lat1, lon1 = map(math.radians, origin_coords)
    lat2, lon2 = map(math.radians, destination_coords)

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2*math.asin(math.sqrt(a))
    distance = 6371 * c * 1.1  # Добавляем 10% на маршрут

    return round((distance / cruising_speed_kmh) + 1.0, 2)  # +1 час на взлет/посадку
```

### Настройка агентов

**Агент веб-поиска:**

```python
from smolagents import CodeAgent, GoogleSearchTool, VisitWebpageTool

web_agent = CodeAgent(
    model=InferenceClientModel("Qwen/Qwen2.5-Coder-32B-Instruct"),
    tools=[
        GoogleSearchTool(provider="serper"),
        VisitWebpageTool(),
        calculate_cargo_travel_time
    ],
    name="web_agent",
    description="Поиск информации в интернете",
    max_steps=10
)
```

**Менеджер-агент:**

```python
manager_agent = CodeAgent(
    model=InferenceClientModel("deepseek-ai/DeepSeek-R1"),
    tools=[calculate_cargo_travel_time],
    managed_agents=[web_agent],
    additional_authorized_imports=[
        "geopandas", "plotly", "shapely",
        "pandas", "numpy"
    ],
    planning_interval=5,
    max_steps=15
)
```

### Визуализация структуры агентов

```python
manager_agent.visualize()
```

Вывод показывает иерархию агентов и доступные инструменты.

## Пример задачи

**Поиск мест съемок и фабрик суперкаров:**

```python
task = """
Найти все места съемок Бэтмена в мире, рассчитать время перелета до Готэма (40.7128° N, 74.0060° W).
Добавить фабрики суперкаров с аналогичным временем перелета.
Построить карту с цветовым кодированием по времени перелета.
"""

result = manager_agent.run(task)
```

**Пример вывода (таблица):**
| Location | Travel Time (hours) |
|------------------------------|---------------------|
| Necropolis Cemetery, Glasgow | 8.60 |
| St. George's Hall, Liverpool | 8.81 |
| Woking, UK (McLaren) | 9.13 |

**Пример построения карты:**

```python
import plotly.express as px

fig = px.scatter_map(
    df,
    lat="lat",
    lon="lon",
    color="travel_time",
    hover_name="location",
    color_continuous_scale=px.colors.sequential.Magma
)
fig.write_image("batman_locations_map.png")
```

## Ключевые особенности мульти-агентных систем

1. **Разделение памяти** - уменьшает количество токенов в контексте
2. **Специализация агентов** - повышает качество выполнения задач
3. **Планирование** - менеджер разбивает сложные задачи на подзадачи
4. **Валидация результатов** - проверка корректности выполнения

**Советы по реализации:**

- Начинайте с простых агентов, затем усложняйте архитектуру
- Четко определяйте роли каждого агента
- Используйте визуализацию для понимания взаимодействий
- Регулярно проверяйте качество работы отдельных агентов
