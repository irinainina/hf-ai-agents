# Урок 17. Визуальные агенты в smolagents

## Основные концепции

### Возможности визуальных агентов:

- Анализ изображений и визуального контента
- Сравнение изображений
- Верификация личности по фотографиям
- Динамический сбор визуальной информации из интернета

## Практическая реализация

### 1. Статический анализ изображений

**Загрузка изображений:**

```python
from PIL import Image
import requests
from io import BytesIO

image_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/e/e8/The_Joker_at_Wax_Museum_Plus.jpg",
    "https://upload.wikimedia.org/wikipedia/en/9/98/Joker_%28DC_Comics_character%29.jpg"
]

images = []
for url in image_urls:
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    image = Image.open(BytesIO(response.content)).convert("RGB")
    images.append(image)
```

**Создание визуального агента:**

```python
from smolagents import CodeAgent, OpenAIServerModel

model = OpenAIServerModel(model_id="gpt-4o")
agent = CodeAgent(model=model, tools=[], max_steps=20)

response = agent.run(
    """
    Опишите костюм и макияж персонажа на фото.
    Определите, это Джокер или Чудо-женщина.
    """,
    images=images
)
```

**Пример вывода:**

```json
{
  "Costume and Makeup": "Фиолетовый пиджак, желтая рубашка, белый грим",
  "Character Identity": "Джокер"
}
```

### 2. Динамический сбор визуальной информации

**Установка необходимых инструментов:**

```bash
pip install "smolagents[all]" helium selenium python-dotenv
```

**Инструменты для веб-браузинга:**

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import helium

def search_item_ctrl_f(text: str, nth_result: int = 1) -> str:
    """Поиск текста на странице (Ctrl+F)"""
    elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{text}')]")
    if nth_result > len(elements):
        raise Exception(f"Совпадение {nth_result} не найдено")
    elem = elements[nth_result - 1]
    driver.execute_script("arguments[0].scrollIntoView(true);", elem)
    return f"Найдено {len(elements)} совпадений"

def save_screenshot(step_log, agent):
    """Сохранение скриншотов во время работы агента"""
    from time import sleep
    sleep(1.0)
    driver = helium.get_driver()
    png_bytes = driver.get_screenshot_as_png()
    image = Image.open(BytesIO(png_bytes))
    step_log.observations_images = [image.copy()]
```

**Создание агента для веб-поиска:**

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool

agent = CodeAgent(
    tools=[DuckDuckGoSearchTool(), search_item_ctrl_f],
    model=OpenAIServerModel("gpt-4o"),
    step_callbacks=[save_screenshot],
    max_steps=20
)
```

**Пример использования:**

```python
result = agent.run("""
Я Альфред, дворецкий Уэйн Мэнор.
Нужно проверить личность гостя, который утверждает, что он Чудо-женщина.
Найдите изображения Чудо-женщины и опишите её типичный внешний вид.
""")
```

**Пример вывода:**

```
Чудо-женщина обычно изображена в красно-золотом бюстье,
синих шортах со звёздами, золотой тиаре и с Лассом Истины.
```

## Ключевые особенности

1. **Два подхода к работе с изображениями:**

   - Статический анализ (заранее загруженные изображения)
   - Динамический сбор (скриншоты веб-страниц)

2. **Интеграция с браузером:**

   - Автоматический поиск информации
   - Сохранение скриншотов для анализа
   - Навигация по веб-страницам

3. **Рекомендации:**
   - Используйте мощные VLM-модели типа GPT-4o
   - Оптимизируйте процесс сохранения скриншотов
   - Четко формулируйте задачи для агента
   - Комбинируйте текстовый и визуальный анализ

```

```
