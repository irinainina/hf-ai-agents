# Урок 9. Библиотека Фиктивного Агента

## Основные концепции

### Независимость от фреймворков

- Фокус на архитектуре AI агентов
- Возможность применения знаний с любыми инструментами
- Постепенное усложнение: от простых функций к smolagents/LangGraph

## Работа с Hugging Face API

### Инициализация клиента

```python
import os
from huggingface_hub import InferenceClient

os.environ["HF_TOKEN"] = "hf_xxxxxxxxxxxxxx"  # Токен с правами 'read'
client = InferenceClient(model="meta-llama/Llama-3-70B-Instruct")
```

### Методы генерации:

1. **Базовый метод (для обучения)**

```python
output = client.text_generation("Столица Франции -", max_new_tokens=100)
```

2. **Рекомендуемый chat-метод**

```python
response = client.chat.completions.create(
    messages=[{"role": "user", "content": "Столица Франции - это"}],
    stream=False,
    max_tokens=1024
)
```

## Архитектура фиктивного агента

### Системный промт содержит:

1. Описание доступных инструментов
2. Инструкции по циклу "Мысль → Действие → Наблюдение"
3. Формат вывода (JSON для действий)

````python
SYSTEM_PROMPT = """
Ответить на вопросы используя инструменты.
Формат действий:
```json
{"action":"tool_name","action_input":{params}}
````

Обязательно завершай вывод меткой 'Окончательный ответ:'
"""

````

## Жизненный цикл агента

1. **Генерация действия с контролем**
```python
output = client.text_generation(
    prompt,
    max_new_tokens=200,
    stop=["Observation:"]
)
````

2. **Исполнение инструмента**

```python
def get_weather(location):
    return f"Погода в {location}: солнечно, 20°C"
```

3. **Обработка и продолжение**

```python
new_prompt = prompt + output + get_weather('Лондон')
final_output = client.text_generation(new_prompt, max_new_tokens=200)
```

## Типовые проблемы и решения

| Проблема            | Решение                  |
| ------------------- | ------------------------ |
| Галлюцинации модели | Контроль стоп-слов       |
| Неправильный формат | Четкие шаблоны в промте  |
| Ошибки исполнения   | Валидация входных данных |

## Переход к продвинутым агентам

1. Автоматизация жизненного цикла
2. Обработка сложных сценариев
3. Интеграция с реальными API
4. Использование smolagents/LangGraph

Пример финального вывода:

```
Окончательный ответ: Погода в Лондоне: солнечно, 20°C
```
