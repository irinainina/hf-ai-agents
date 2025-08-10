# Урок 33. Практическое руководство по отправке агента на GAIA Benchmark

## 1. Рабочий процесс отправки

### Шаги для участия:

1. Получить вопросы через API
2. Обработать их вашим агентом
3. Отправить ответы на оценку

## 2. API Endpoints

| Метод | Путь               | Описание                   |
| ----- | ------------------ | -------------------------- |
| GET   | `/questions`       | Получить все вопросы       |
| GET   | `/random-question` | Получить случайный вопрос  |
| GET   | `/files/{task_id}` | Загрузить файлы для задачи |
| POST  | `/submit`          | Отправить ответы           |

## 3. Базовый шаблон агента

```python
import requests
from smolagents import CodeAgent

class GaiaSubmissionAgent:
    def __init__(self):
        self.agent = CodeAgent(tools=[...])
        self.base_url = "https://gaia-api.example.com"

    def get_questions(self):
        response = requests.get(f"{self.base_url}/questions")
        return response.json()

    def submit_answers(self, answers):
        payload = {
            "username": "your_hf_username",
            "agent_code": "https://hf.co/your_space/tree/main",
            "answers": answers
        }
        response = requests.post(f"{self.base_url}/submit", json=payload)
        return response.json()
```

## 4. Пример рабочего процесса

```python
# Инициализация агента
agent = GaiaSubmissionAgent()

# Получение вопросов
questions = agent.get_questions()

# Генерация ответов
answers = []
for q in questions:
    response = agent.agent.run(q["question_text"])
    answers.append({
        "task_id": q["task_id"],
        "submitted_answer": response.strip()  # Важно: без "FINAL ANSWER"
    })

# Отправка результатов
results = agent.submit_answers(answers)
print(f"Your score: {results['score']}%")
```

## 5. Критические требования

1. **Формат ответа**:

   - Только чистый ответ, без префиксов типа "FINAL ANSWER"
   - Точно соответствует ожидаемому формату

2. **Публикация кода**:

   - Обязательно публичное HF Space
   - Ссылка на код (`.../tree/main`)

3. **Идентификация**:
   - Ваш Hugging Face username
   - Корректные task_id для каждого ответа

## 6. Оптимизация производительности

1. **Для Level 1 вопросов**:

   - Фокус на 1-3 инструмента
   - Лимит 5 шагов выполнения
   - Простые текстовые ответы

2. **Обработка ошибок**:

```python
try:
    response = agent.run(question)
    answer = response.strip()
except Exception as e:
    answer = ""  # Пустой ответ при ошибке
```

## 7. Полезные советы

- Начните с `/random-question` для тестирования
- Проверяйте точное соответствие ожидаемому формату ответа
- Оптимизируйте обработку мультимедийных вопросов
- Мониторьте лидерборд для отслеживания прогресса

[Ссылка на лидерборд](https://huggingface.co/spaces/gaia-benchmark/leaderboard)
