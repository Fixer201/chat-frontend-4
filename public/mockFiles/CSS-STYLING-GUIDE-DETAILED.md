# CSS Styling Guide — chat-frontend-4

**Версия**: 2.0
**Проект**: chat-frontend-4 (Next.js + React + TypeScript + Tailwind v4)
**Последнее обновление**: 2025-12-24

---

## Предисловие: Архитектура дизайн-системы

Этот проект следует принципу **Single Source of Truth** для цветов. Все цветовые решения исходят из Figma дизайна, а
реализация в коде опирается на единственный файл — `globals.css`. Это позволяет:

- **Синхронизировать дизайн с кодом** без разброса цветовых значений по компонентам
- **Масштабировать изменения** — одно изменение в `globals.css` обновляет весь проект
- **Избежать дублирования** цветовых токенов и магических значений
- **Обучать новых разработчиков** — они точно знают где искать цвета

Это требование существует **не как ограничение**, а как **архитектурный принцип**, обеспечивающий надёжность системы.

---

## 1. Фундамент: CSS переменные и Tailwind @theme

### 1.1 Как работает цветовая система в Tailwind v4

Tailwind v4 переходит на прямое определение токенов через CSS переменные и `@theme` директиву. Это **ключевое изменение
** от v3.

**Традиционный подход (v3)**:

```js
// tailwind.config.js
module.exports = {
    theme: {
        colors: {
            'accent-violet-primary': '#7769E1',
            'accent-violet-dark': '#615AA3',
        },
    },
}
```

**Современный подход (v4)**:

```css
/* globals.css */
:root {
    --app-accent-violet-primary: #7769e1;
    --app-accent-violet-dark: #615aa3;
}

@theme inline {
    --color-accent-violet-primary: var(
        --app-accent-violet-primary
    );
    --color-accent-violet-dark: var(
        --app-accent-violet-dark
    );
}
```

### 1.2 Почему двухуровневая система переменных?

```
┌─────────────────────────────────────────────┐
│ CSS переменные Tailwind (@theme)            │
│ --color-accent-violet-primary               │
│ (используется утилитами)                    │
└─────────────────────┬───────────────────────┘
                      │ references
                      ▼
┌─────────────────────────────────────────────┐
│ Приватные переменные приложения (:root)    │
│ --app-accent-violet-primary                 │
│ (хранилище значений + .dark режим)          │
└─────────────────────────────────────────────┘
```

**Преимущества этой архитектуры**:

| Слой                   | Назначение          | Преимущество                                                                                      |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `--color-*` (Tailwind) | Источник для утилит | Tailwind автоматически генерирует `text-accent-violet-primary`, `bg-accent-violet-primary` и т.д. |
| `--app-*` (приложение) | Хранилище значений  | Легко менять светлый/тёмный режим, подставлять значения из API дизайна-токенов                    |

### 1.3 Разделение light и dark режимов

```css
:root {
    /* Светлый режим (по умолчанию) */
    --app-accent-violet-primary: #7769e1;
    --app-white-bg: #ffffff;
    --app-text-black: #1c1c1c;
}

.dark {
    /* Тёмный режим (переопределения) */
    --app-accent-violet-primary: #9b8fe8; /* светлее для читаемости */
    --app-white-bg: #1f1f1f; /* инвертировано */
    --app-text-black: #e8e8e8; /* инвертировано */
}

/* Все токены Tailwind ссылаются на эти переменные */
@theme inline {
    --color-accent-violet-primary: var(
        --app-accent-violet-primary
    );
    --color-white-bg: var(--app-white-bg);
    --color-text-black: var(--app-text-black);
}
```

**Результат**: при переключении класса `.dark` на `<html>`, все цвета автоматически обновляются благодаря CSS
наследованию.

---

## 2. Инвентарь и семантика цветов

### 2.1 Категоризация токенов

Цвета в этом проекте организованы по **функциональному назначению**, а не по имени:

```
accent-violet-*     → интерактивные элементы (кнопки, активные иконки)
system-red-*        → ошибки, опасные действия
system-green-*      → успех, завершённые действия
system-blue-*       → информация, ссылки
gray-*              → нейтральные фоны и разделители
text-*              → типография (есть 1-2 основных варианта)
white-bg            → главная рабочая поверхность
```

### 2.2 Таблица полного инвентаря

#### Основные фоны и нейтралы

| Токен            | Значение                 | Назначение                        | Примеры использования                       |
| ---------------- | ------------------------ | --------------------------------- | ------------------------------------------- |
| `white-bg`       | hsla(0, 0%, 100%, 1)     | Основная поверхность контента     | Фон карточек, основной канвас               |
| `gray-main`      | hsla(220, 18%, 97%, 1)   | Вторичная поверхность, контейнеры | Фон списков, группирующие блоки             |
| `gray-light`     | hsla(220, 18%, 97%, 0.5) | Третичная, низкой выделенности    | Фон disabled элементов, placeholder области |
| `black-alpha-70` | hsla(0, 0%, 0%, 0.7)     | Модальные оверлеи, затемнение     | Фон модалей, dropdown фон                   |
| `black-alpha-20` | hsla(0, 0%, 0%, 0.2)     | Границы, разделители              | Линии раздела, border-color                 |

#### Типография

| Токен        | Значение              | Использование                | Контраст (WCAG) |
| ------------ | --------------------- | ---------------------------- | --------------- |
| `text-black` | hsla(240, 3%, 11%, 1) | Основной текст, заголовки    | 17.5:1 (AAA)    |
| `text-gray`  | hsla(0, 0%, 45%, 1)   | Вспомогательный текст, hints | 8.2:1 (AA)      |

#### Акцентные цвета (фиолетовый бренд)

| Токен                   | Hex     | LCH                    | Назначение                     | Состояния         |
| ----------------------- | ------- | ---------------------- | ------------------------------ | ----------------- |
| `accent-violet-primary` | #7769E1 | oklch(62.5% 0.12 285°) | Основное действие              | default/focus     |
| `accent-violet-dark`    | #615AA3 | oklch(48.2% 0.10 285°) | Нажатое/активное состояние     | :active, :pressed |
| `accent-violet-light`   | #E2DDFF | oklch(90% 0.05 285°)   | Фон при hover/subtle highlight | :hover background |
| `accent-violet-white`   | #CEC8FF | oklch(82% 0.08 285°)   | Фоновый контейнер              | блоковый фон      |

**Почему градация именно такая?** Значения построены на основе **LCH цветового пространства** (
перцептивно-равномерного), которое гарантирует:

- Визуальное расстояние между оттенками одинаково
- Каждый шаг имеет чёткое назначение в интерфейсе
- Автоматическое соблюдение контраста

#### Системные статус-цвета

| Токен                | Hex                     | Назначение                  | Где использовать                     |
| -------------------- | ----------------------- | --------------------------- | ------------------------------------ |
| `system-red`         | #FF0000                 | Текст ошибок, удаление      | `<span>`, `<label>` для ошибок       |
| `system-red-soft`    | rgba(255,0,0,0.6)       | Текст в оверлее ошибки      | Текст поверх `system-red-surface`    |
| `system-red-surface` | rgba(255,0,0,0.12)      | Фон ошибок                  | Input border-color, alert background |
| `system-red-dark`    | #CC0000                 | Нажатое состояние ошибки    | `button[error]:active`               |
| `system-green`       | hsla(129, 67%, 47%, 1)  | Успех, завершённые действия | Чекмарки, статусы выполнения         |
| `system-blue`        | hsla(211, 100%, 50%, 1) | Ссылки, информация          | `<a>`, info icons                    |

---

## 3. Правила применения цветов в коде

### 3.1 Практическое правило: только кастомные токены

✅ **Правильно** (используем только токены):

```jsx
<button className="bg-accent-violet-primary hover:bg-accent-violet-dark text-white-bg">
    Отправить
</button>

<input
    className="border border-black-alpha-20 focus:border-accent-violet-primary"
    aria-invalid={hasError}
/>

<div className="bg-system-red-surface text-system-red">
    Ошибка сети
</div>
```

❌ **Запрещено** (прямые значения, палитра Tailwind, hex коды):

```jsx
// Никогда:
<button className="bg-blue-500 hover:bg-blue-600">...</button>
<button className="bg-[#7769E1]">...</button>
<button style={{ backgroundColor: '#7769E1' }}>...</button>
<input className="border border-gray-300" />
```

### 3.2 Семантическое маппирование состояний

Для интерактивных элементов используйте цветовые варианты **по состояниям**, а не по произвольным комбинациям.

#### Кнопка с полным набором состояний

```jsx
<button
    className={clsx(
        // Base (default state)
        'bg-accent-violet-primary text-white-bg',

        // Hover
        'hover:bg-accent-violet-dark',

        // Active/pressed
        'active:bg-accent-violet-dark active:shadow-md',

        // Focus (обязательно!)
        'focus:outline-none focus:ring-2 focus:ring-accent-violet-primary/30 focus:ring-offset-2',

        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-main disabled:text-text-gray',

        // ARIA states
        'aria-pressed:bg-accent-violet-dark',
    )}
>
    Действие
</button>
```

#### Input с ошибкой

```jsx
<div className="form-field">
    <label
        htmlFor="email"
        className="text-sm font-medium text-text-black"
    >
        Email
    </label>

    <input
        id="email"
        type="email"
        aria-invalid={hasError}
        aria-describedby={
            hasError ? 'error-msg' : undefined
        }
        className={clsx(
            'w-full px-3 py-2 rounded-md border-2 transition-colors',

            // Valid state
            'border-black-alpha-20 focus:border-accent-violet-primary',

            // Invalid state — переопределяет валидное
            hasError &&
                'border-system-red bg-system-red-surface text-system-red',

            // Focus ring
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            hasError
                ? 'focus:ring-system-red/30'
                : 'focus:ring-accent-violet-primary/30',
        )}
    />

    {hasError && (
        <p
            id="error-msg"
            className="text-xs text-system-red mt-1"
        >
            Некорректный email
        </p>
    )}
</div>
```

### 3.3 Работа с opacity и brightness

Если нужного точного оттенка токена нет, **предпочитайте opacity/brightness утилиты** перед созданием нового токена.

```jsx
// Когда есть токен для оттенка — используйте его
<button className="bg-accent-violet-primary hover:bg-accent-violet-dark" />

// Когда нет точного оттенка, но близко — используйте opacity
<div className="bg-accent-violet-primary/20">
    Светлый фон с фиолетовым акцентом
</div>

// Когда нужен более тёмный вариант непредвиденный дизайном — используйте brightness
<button className="bg-accent-violet-primary hover:brightness-90" />

// Но если паттерн повторяется > 1 раза, добавьте токен в дизайн и globals.css
```

### 3.4 Контрастность и доступность

**Минимальные требования (WCAG AA)**:

- Обычный текст: **4.5:1** контраст с фоном
- Крупный текст (24px+): **3:1** контраст

**Проверьте контраст при добавлении новых токенов**:

```
текст-чёрный (#1C1C1C) на белом (#FFFFFF) = 17.5:1 ✓ AAA
текст-серый (#737373) на сером (#F7F7F7) = 8.2:1 ✓ AA
текст-красный (#FF0000) на белом (#FFFFFF) = 5.3:1 ✓ AA
```

---

## 4. Типография: вес, размер, высота строк

### 4.1 Доступные веса шрифтов

Проект использует четыре веса семейства шрифта (обычно система шрифтов):

```css
font-normal /* 400 — основной текст, body */
font-medium /* 500 — метки, secondary text, кнопки */
font-semibold /* 600 — подзаголовки, важные элементы */
font-bold

/* 700 — заголовки, выделения */
```

**⚠️ Не используйте `font-light` или `font-thin`** — недостаточный контраст на определённых фонах.

### 4.2 Шкала размеров текста

Используется встроенная шкала Tailwind, основанная на типическом прогрессии 1.125x (модульная шкала):

```
text-xs   → 12px / 16px       (hints, small UI labels)
text-sm   → 14px / 20px       (labels, secondary text)
text-base → 16px / 24px       (default, body copy)
text-lg   → 18px / 28px       (emphasis text)
text-xl   → 20px / 28px       (subheadings)
text-2xl  → 24px / 32px       (page headings)
```

### 4.3 Практические примеры типографии

```jsx
// Основной текст (body)
<p className="text-base font-normal text-text-black leading-relaxed">
    Основное содержание страницы...
</p>

// Метка формы
<label className="text-sm font-medium text-text-black">
    Ваше имя
</label>

// Вторичный текст (помощь, подпись)
<p className="text-xs font-normal text-text-gray">
    Это поле обязательно
</p>

// Заголовок
<h2 className="text-xl font-semibold text-text-black">
    Заголовок раздела
</h2>

// Заголовок страницы
<h1 className="text-2xl font-bold text-text-black">
    Название страницы
</h1>
```

---

## 5. Размеры и макет: гибкость вместо жёстких значений

### 5.1 Антипаттерны в макете

❌ **Запрещено** (жёсткие размеры нарушают адаптивность):

```jsx
<div className="w-[1200px] h-[800px] overflow-auto">
    {/* Заломается на планшете */}
</div>

<section className="max-w-[1200px]" />  // Произвольное значение

<aside className="w-[300px]" />  // Наложится на контент на мобиле
```

✅ **Правильно** (гибкие, отзывчивые размеры):

```jsx
// Полноширинный контейнер с ограничением
<div className="w-full max-w-6xl mx-auto">
    {content}
</div>

// Полноэкранный пролистываемый контейнер
<div className="h-full overflow-y-auto">
    {content}
</div>

// Гибкий асимметричный двухколончик
<div className="flex gap-4">
    <aside className="w-64 shrink-0">
        {sidebar}
    </aside>
    <main className="flex-1 min-w-0">
        {/* min-w-0 предотвращает overflow flex элементов */}
        {content}
    </main>
</div>
```

### 5.2 Шкала отступов (padding, margin, gap)

Следуйте встроенной шкале Tailwind (базовый unit = 0.25rem = 4px):

```
p-0 (0px), p-1 (4px), p-2 (8px), p-3 (12px), p-4 (16px),
p-6 (24px), p-8 (32px), p-12 (48px), ...
```

**Правило**: если нестандартный отступ (типа `p-[52px]`) появляется **более одного раза**, добавьте его в Tailwind
конфиг вместо использования `[]` скобок:

```css
/* tailwind.config.ts */
export default {
    theme: {
    extend: {
    spacing: {
'13': '3.25rem', / / 13 * 4 px = 52 px
}
}
}
}
```

Тогда везде используйте `p-13` вместо `p-[52px]`.

### 5.3 Гибкие макеты: Flex и Grid паттерны

#### Flex с равным распределением

```jsx
<div className="flex gap-4">
    <div className="flex-1 min-w-0">Left</div>
    <div className="flex-1 min-w-0">Right</div>
</div>
```

Обязательный `min-w-0` для `flex-1` элементов — по умолчанию flex имеет `min-width: auto`, что может вызвать overflow.

#### Flex с фиксированной боковой панелью

```jsx
<div className="flex gap-4">
    <aside className="w-64 shrink-0">
        {/* Ровно 256px, не сжимается */}
    </aside>
    <main className="flex-1 min-w-0">
        {/* Занимает оставшееся место */}
    </main>
</div>
```

#### Grid с адаптивным числом колонок

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* 1 колонка на мобиле, 2 на планшете, 3 на десктопе */}
</div>
```

### 5.4 Предотвращение переполнения текста

```jsx
{
    /* Одна линия с обрезкой */
}
;<div className="truncate">{longText}</div>

{
    /* Несколько строк с обрезкой */
}
;<div className="line-clamp-3">{longMultilineText}</div>

{
    /* Flex с text overflow */
}
;<div className="flex items-center gap-2 min-w-0">
    <span className="flex-1 truncate">{fileName}</span>
    <span className="shrink-0">{fileSize}</span>
</div>
```

---

## 6. Медиазапросы и адаптивность

### 6.1 Встроенные breakpoints в Tailwind

| Точка  | Класс  | Экран               |
| ------ | ------ | ------------------- |
| 640px  | `sm:`  | Маленькие телефоны  |
| 768px  | `md:`  | Планшеты            |
| 1024px | `lg:`  | Ноутбуки            |
| 1280px | `xl:`  | Большие мониторы    |
| 1536px | `2xl:` | Ultra-wide мониторы |

### 6.2 Mobile-first стратегия

Всегда пишите стили для мобиля **первыми**, затем добавляйте breakpoints:

```jsx
// Правильно (мобайл-первый)
<div className="
  w-full p-2 text-sm
  md:p-4 md:text-base
  lg:max-w-4xl lg:mx-auto
">
    Responsive контент
</div>

// Не идеально (десктоп-первый)
<div className="
  w-screen p-8 text-lg
  sm:w-full sm:p-4 sm:text-sm
">
    Не правильный порядок
</div>
```

### 6.3 Условные стили при адаптивности

```jsx
// Скрывать элемент на мобилях
<aside className="hidden md:block">
    {sidebar}
</aside>

// Менять тип display
<div className="block md:flex gap-4">
    {/* Стопка на мобиле, ряд на планшете+ */}
</div>

// Менять паддинг и размер текста
<h1 className="text-xl md:text-2xl p-4 md:p-8">
    Адаптивный заголовок
</h1>
```

---

## 7. Компонентные стили через @layer components

### 7.1 Когда использовать @layer components

Используйте `@layer components` **ТОЛЬКО** для **переиспользуемых многоэлементных паттернов**, которые:

1. Встречаются в коде **минимум 2+ раза**
2. Имеют **внутреннюю структуру** (множество элементов с индивидуальными стилями)
3. **Не могут быть выражены** через компонент-композицию
4. **Не выполняют логику** (это дело React компонента)

### 7.2 Валидный пример: форм-поле со стилизацией

```css
@layer components {
    /* Паттерн используется везде для form fields */
    .form-field {
        @apply flex flex-col gap-2;
    }

    .form-field > label {
        @apply text-sm font-medium text-text-black;
    }

    .form-field > input,
    .form-field > textarea,
    .form-field > select {
        @apply w-full px-3 py-2 rounded-md
        border-2 border-black-alpha-20
        text-base text-text-black
        placeholder:text-text-gray
        transition-colors;
    }

    .form-field > input:focus,
    .form-field > textarea:focus,
    .form-field > select:focus {
        @apply outline-none border-accent-violet-primary
        ring-2 ring-accent-violet-primary/20 ring-offset-1;
    }

    /* Состояние ошибки */
    .form-field[aria-invalid='true'] > input,
    .form-field[aria-invalid='true'] > textarea {
        @apply border-system-red bg-system-red-surface text-system-red;
    }

    .form-field[aria-invalid='true'] > input:focus,
    .form-field[aria-invalid='true'] > textarea:focus {
        @apply ring-system-red/20;
    }
}
```

**Использование**:

```jsx
<div className="form-field" aria-invalid={hasError}>
    <label htmlFor="name">Имя</label>
    <input
        id="name"
        type="text"
        placeholder="Введите имя"
    />
</div>
```

### 7.3 Невалидные примеры

❌ **Простая обёртка утилит** (должен быть React компонент):

```css
@layer components {
    .card {
        @apply p-4 rounded-lg bg-white-bg;
    }
}
```

Вместо этого:

```jsx
// Card.tsx
export function Card({ children }: { children: React.ReactNode }) {
    return <div className="p-4 rounded-lg bg-white-bg">{children}</div>;
}
```

❌ **Стили с логикой** (логика в React):

```css
@layer components {
    .button-group {
        @apply flex gap-2;
        /* Не добавляйте логику в CSS */
    }
}
```

---

## 8. Доступность (Accessibility)

### 8.1 Семантический HTML обязателен

Интерактивные элементы **должны использовать правильные HTML теги**, иначе нарушается доступность:

| Взаимодействие | Правильный элемент                                     | Почему                                          | Не используйте             |
| -------------- | ------------------------------------------------------ | ----------------------------------------------- | -------------------------- |
| Навигация      | `<a href="...">`                                       | Получает `Enter`, работает у скринридеров       | `<div onClick={navigate}>` |
| Отправка       | `<button>`                                             | Получает `Enter`/`Space`, `:focus` по умолчанию | `<div onClick={submit}>`   |
| Toggle         | `<input type="checkbox">` или `<button role="switch">` | Автоматическая поддержка `Space` для toggle     | `<div onClick={toggle}>`   |
| Выбор          | `<select>` или custom с `role="listbox"`               | Встроенная keyboard nav                         | `<div onClick={open}>`     |

### 8.2 ARIA атрибуты для динамических состояний

Когда HTML **не может выразить состояние** (т.е. визуальное, но не семантическое), используйте ARIA:

```jsx
// Динамическая активация кнопки
<button
    aria-pressed={isActive}
    aria-label="Toggle dark mode"
    className={clsx(
        'px-4 py-2 rounded-md',
        isActive
            ? 'bg-accent-violet-primary text-white-bg'
            : 'bg-gray-main text-text-black'
    )}
>
    🌙
</button>

// Input с ошибкой
<input
    aria-invalid={hasError}
    aria-describedby={hasError ? 'error-msg' : undefined}
    className={clsx(
        'px-3 py-2 border-2 rounded-md',
        hasError ? 'border-system-red' : 'border-black-alpha-20'
    )}
/>
<p id="error-msg" className="text-xs text-system-red">
    {error}
</p>

// Live регион (для динамических изменений)
<div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"  // видно только скринридерам
>
    {statusMessage}
</div>
```

### 8.3 Всегда видимый focus состояние

❌ **Запрещено** (удаляет focus без замены):

```jsx
<button className="focus:outline-none">
    {/* Клавиатурные пользователи не видят куда они кликнули */}
</button>
```

✅ **Правильно** (заменяет ring утилитой):

```jsx
<button
    className="
  focus:outline-none
  focus:ring-2 ring-offset-2
  focus:ring-accent-violet-primary
"
>
    Кнопка видна с фокусом
</button>
```

**Почему `ring-offset-2`?** Зазор между фокус-кольцом и элементом делает его более видимым и красивым.

### 8.4 Контрастность текста и фона

При добавлении любого нового токена — **проверьте контраст** (минимум AA, рекомендуется AAA):

**Инструменты**:

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- `color-contrast` в DevTools Chrome/Firefox
- Автоматическая проверка на CI

**Примеры из проекта**:

```
🟢 белый текст (#FFFFFF) на фиолетовом primary (#7769E1) = 6.1:1 ✓ AA
🟢 тёмный текст (#1C1C1C) на белом (#FFFFFF) = 17.5:1 ✓ AAA
🟡 серый текст (#737373) на светло-сером (#F7F7F7) = 8.2:1 ✓ AA
🔴 красный текст (#FF0000) на розовом (#FFE8E8) = 1.2:1 ✗ Fail
```

---

## 9. Специфичность и конфликты утилит

### 9.1 Иерархия специфичности в Tailwind

```
@layer base           ← Самая низкая (resets, defaults)
@layer components     ← Средняя (переиспользуемые паттерны)
@layer utilities      ← Высокая (Tailwind классы)
!important            ← Очень высокая
Inline styles         ← Самая высокая
```

**Почему эта иерархия?** Потому что обычно нужно переопределять базовые стили компонентной логикой, а компонентную
логику утилитами.

### 9.2 Конфликтующие утилиты

**Конфликт** — когда два класса задают одно и то же CSS свойство с разными значениями:

```jsx
// Конфликт: max-width ограничивает width, это нормально
<div className="w-full max-w-6xl" />
// Результат: width: 100%, но не больше 6xl

// Конфликт: display не может быть одновременно flex и grid
<div className="flex grid" />
// Результат: grid переопределяет flex (зависит от порядка в CSS)

// Как разрешить?
<div className="grid grid-cols-2"> // Или flex, но не оба
    {items}
</div>
```

### 9.3 Использование tailwind-merge для динамических классов

Когда классы собираются динамически, конфликты могут быть неочевидны:

```jsx
import { twMerge } from 'tailwind-merge'

function Button({ color, disabled, className }) {
    return (
        <button
            className={twMerge(
                'px-4 py-2 rounded-md font-medium',

                color === 'primary' &&
                    'bg-accent-violet-primary text-white-bg',
                color === 'error' &&
                    'bg-system-red text-white-bg',

                disabled && 'opacity-50 cursor-not-allowed',

                // Пользовательский класс переопределяет стандартный
                className,
            )}
        >
            Click me
        </button>
    )
}

// Использование:
;<Button color="primary" className="bg-system-blue" />
// twMerge убирает 'bg-accent-violet-primary' и применяет 'bg-system-blue'
```

### 9.4 Когда (и когда НЕ) использовать !important

❌ **Никогда как первый выбор**:

```jsx
<button className="bg-accent-violet-primary !bg-system-red" />
// Это указывает на ошибку в логике
```

✅ **Редко, и только для глобальных реsets**:

```css
/* globals.css */
@layer base {
    * {
        box-sizing: border-box !important;
    }
}
```

Если используете `!important` в компонентных стилях — пересмотрите архитектуру.

---

## 10. Процесс добавления новых цветов из дизайна

### 10.1 Workflow: Figma → Tailwind

1. **В Figma**: дизайнер определил новый цвет (например, `#FF9D3D` для orange бренда)

2. **В `globals.css`** добавьте переменную:

```css
:root {
    /* ... существующие переменные ... */
    --app-brand-orange: #ff9d3d;
    --app-brand-orange-dark: #e88d2a; /* для dark mode */
}

.dark {
    --app-brand-orange: #e88d2a; /* светлее для читаемости в тёмном режиме */
    --app-brand-orange-dark: #c97a1f;
}
```

3. **В `@theme inline`** маппируйте:

```css
@theme inline {
    /* ... существующие токены ... */
    --color-brand-orange: var(--app-brand-orange);
    --color-brand-orange-dark: var(--app-brand-orange-dark);
}
```

4. **Обновите этот документ** (CSS-STYLING-GUIDE.md), добавив новый токен в таблицу с назначением.

5. **Создайте коммит**:

```bash
git add docs/CSS-STYLING-GUIDE*.md globals.css
git commit -m "feat(colors): add brand-orange token from Figma design update"
```

6. **Уведомьте команду** — новые дизайн-токены влияют на всю систему.

### 10.2 Проверка нового токена

```jsx
// После добавления в globals.css, утилиты автоматически работают:
<button className="bg-brand-orange hover:bg-brand-orange-dark text-white-bg">
    Orange Button
</button>

// Проверьте темный режим:
<button className="dark:bg-brand-orange ...">
    Dark mode
</button>
```

---

## 11. Производительность и оптимизация

### 11.1 Размер итогового CSS

Tailwind v4 генерирует только используемые утилиты. Чем строже вы следуете ограничениям (только кастомные токены), тем
меньше CSS:

```
Без оптимизации (все палитры Tailwind):  ~50KB
С ограничением на кастомные токены:      ~15KB
С минификацией и gzip:                    ~3KB
```

### 11.2 Избегайте динамических классов

❌ **Плохо** (Tailwind не видит класс в рантайме):

```jsx
const bgColor = 'bg-accent-violet-primary' // Это строка, не класс!
;<div className={bgColor}>...</div> // Класс НЕ применится
```

✅ **Правильно** (классы статичны):

```jsx
const isDark = theme === 'dark'
;<div
    className={
        isDark ? 'bg-accent-violet-primary' : 'bg-white-bg'
    }
>
    ...
</div>
```

Или используйте `twMerge` для сложной логики.

### 11.3 PurgeCSS и tree-shaking

Tailwind автоматически удаляет неиспользуемые классы, но только если он может их найти в коде:

```jsx
// Tailwind видит эти классы ✓
<div className="bg-accent-violet-primary" />
<div className={`text-${color}`} />  // Если color = 'text-black' ✓

// Tailwind НЕ видит эти классы ✗
const classes = { primary: 'bg-accent-violet-primary' };  // Динамический объект
<div className={classes[type]} />

// Решение:
const classMap = {
    primary: 'bg-accent-violet-primary',
    error: 'bg-system-red',
};
<div className={classMap[type]} />  // Классы статичны в исходном коде
```

---

## 12. Testing и валидация стилей

### 12.1 Визуальное тестирование

```jsx
// Создайте Storybook историю для каждого ключевого паттерна
// stories/Button.stories.tsx

export const Primary = {
    args: {
        children: 'Primary Button',
        color: 'primary',
    },
}

export const Disabled = {
    args: {
        children: 'Disabled Button',
        disabled: true,
    },
}

export const DarkMode = {
    args: {
        children: 'Button in dark',
        color: 'primary',
    },
    decorators: [
        (Story) => (
            <div className="dark">
                <Story />
            </div>
        ),
    ],
}
```

### 12.2 Проверка контраста

```javascript
// test/contrast.test.ts
import { contrastChecker } from '@webinclude/contrast'

test('Button text has sufficient contrast', () => {
    const button = render(<Button>Click me</Button>)
    const contrast = contrastChecker(
        getComputedStyle(button).color, // text-white-bg
        getComputedStyle(button).backgroundColor, // bg-accent-violet-primary
    )
    expect(contrast).toBeGreaterThanOrEqual(4.5) // WCAG AA
})
```

### 12.3 Проверка на отсутствие жёстких размеров

```javascript
// test/responsive.test.ts
test('No hardcoded widths on main containers', () => {
    const source = fs.readFileSync('src/**/*.tsx', 'utf-8')
    const hardcodedWidths = source.match(/w-\[\d+px\]/g)
    expect(hardcodedWidths).toBeNull()
})
```

---

## 13. Контрольный список Code Review

**Перед отправкой PR, проверьте**:

- [ ] **Цвета**: Только токены из `globals.css`, нет `bg-blue-500`, нет `#hex`, нет inline стилей
- [ ] **Размеры**: Гибкие (`flex-1`, `max-w-*`, `w-full`), нет жёстких `w-[800px]`
- [ ] **Отступы**: Из шкалы Tailwind (`p-4`, `gap-2`), нет произвольных `p-[13px]`
- [ ] **Радиус**: Только предопределённые (`rounded-md`, `rounded-lg`)
- [ ] **Типография**: `text-sm`, `text-base`, `text-xl` — нет `text-[13px]`
- [ ] **Стили focus**: Присутствуют и видимы (`focus:ring-2`), нет `focus:outline-none` без замены
- [ ] **ARIA атрибуты**: Для динамических состояний (`aria-invalid`, `aria-pressed`)
- [ ] **Семантический HTML**: `<button>` для действий, `<a>` для ссылок, не `<div>`
- [ ] **Контраст**: Минимум 4.5:1 для текста (проверить через WCAG checker)
- [ ] **Конфликты утилит**: Нет одновременно `flex grid`, нет дублирующихся свойств
- [ ] **Dark mode**: Если добавлены цвета, проверить в `.dark` режиме
- [ ] **@layer components**: Только для переиспользуемых многоэлементных паттернов (2+ мест)

---

## 14. Краткая справка: часто используемые паттерны

### Кнопка с полным состояниям

```jsx
className = "bg-accent-violet-primary text-white-bg hover:bg-accent-violet-dark
active:shadow - md
focus:ring - 2
focus:ring - accent - violet - primary / 30
disabled:opacity - 50
"
```

### Input с ошибкой

```jsx
className = {
    clsx(
    'border-2 px-3 py-2 rounded-md focus:outline-none focus:ring-2',
    hasError
    ? 'border-system-red bg-system-red-surface text-system-red focus:ring-system-red/20'
    : 'border-black-alpha-20 focus:border-accent-violet-primary focus:ring-accent-violet-primary/30'
)
}
```

### Адаптивный контейнер

```jsx
className = 'w-full max-w-6xl mx-auto p-4 md:p-8'
```

### Flex с overflow protection

```jsx
className = 'flex items-center gap-2 min-w-0'
// children: <span className="truncate">{text}</span>
```

### Dark mode поддержка

```jsx
className =
    'bg-white-bg dark:bg-gray-main text-text-black dark:text-gray-50'
```

---
