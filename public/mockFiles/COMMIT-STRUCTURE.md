# Переводы | Translations

- [Russian](#ru)
- [English](#en)

## **RU**

**Общая структура:**

```
<type>(<scope>): <subject>
<BLANK LINE>
[optional body]
<BLANK LINE>
[optional footer(s)]
```

---

### 1. Заголовок (Header): `<type>(<scope>): <subject>`

Это **обязательная** и самая важная строка коммита. Она состоит из трех частей:

#### `<type>` (Тип изменения)

- **Что это?** Одно слово, описывающее _категорию_ сделанных изменений.
- **Зачем?**
    - Позволяет мгновенно понять характер коммита, даже не читая дальше.
    - Используется инструментами автоматизации для:
        - Генерации списка изменений (Changelog).
        - Определения следующей версии проекта по правилам семантического версионирования (SemVer). Например, `feat`
          может повышать минорную версию (1.x.0 -> 1.y.0), а `fix` — патч-версию (1.1.x -> 1.1.y). `BREAKING CHANGE` (в
          футере) всегда повышает мажорную версию (x.0.0 -> y.0.0).
- **Основные типы (англ. версия самая распространенная):**
    - `feat`: Внедрение новой функциональности для пользователя (feature).
    - `fix`: Исправление ошибки в коде (bug fix).
    - `refactor`: Изменение существующего кода без исправления багов и добавления новой функциональности (например,
      улучшение читаемости, производительности, структуры кода). Поведение для пользователя не меняется.
    - `perf`: Изменение кода, которое улучшает производительность.
    - `style`: Правки, не влияющие на смысл кода (пробелы, форматирование, точки с запятой, переименование переменных
      для ясности и т.д.). Не путать с CSS-стилями!
    - `test`: Добавление недостающих тестов или исправление существующих.
    - `build`: Изменения, которые влияют на систему сборки проекта или внешние зависимости (например, конфиги Webpack,
      Gulp, Composer, npm, Dockerfile).
    - `ci`: Изменения в файлах и скриптах конфигурации непрерывной интеграции и развертывания (CI/CD), например,
      `.gitlab-ci.yml`, GitHub Actions.
    - `docs`: Изменения только в документации (README, комментарии JSDoc/PHPDoc, Swagger и т.д.).
    - `chore`: Прочие изменения, которые не модифицируют исходный код или тесты. Например, обновление `.gitignore`,
      настройка инструментов разработки, рутинные задачи.
- **Правила:** Всегда пишется строчными буквами.

#### `(<scope>)` (Область видимости / Контекст)

- **Что это?** Необязательное слово (или несколько слов, часто через дефис) в круглых скобках, уточняющее, какую часть
  проекта затронули изменения.
- **Зачем?**
    - Помогает быстро понять, к какому модулю, компоненту или функциональной области относится коммит, особенно в
      больших проектах.
    - Облегчает фильтрацию истории (`git log --grep '\(auth\)'`).
- **Примеры:** `(api)`, `(auth)`, `(checkout)`, `(product-card)`, `(admin-ui)`, `(user-profile)`, `(database)`.
- **Правила:** Пишется строчными буквами. Если не используется, скобки тоже опускаются. Должен быть согласован в рамках
  команды/проекта (например, всегда использовать `auth` или `authentication`, но не оба сразу).

#### `:` (Двоеточие и пробел)

- **Что это?** Разделитель между `<type>(<scope>)` и `<subject>`.
- **Зачем?** Стандартный разделитель, используется парсерами.
- **Правила:** Двоеточие ставится сразу после `<type>` или `(<scope>)`. **Обязательно** ставится один пробел после
  двоеточия.

#### `<subject>` (Тема / Заголовок коммита)

- **Что это?** Краткое (< 50-70 символов) описание _сути_ изменения.
- **Зачем?** Это то, что вы видите в `git log --oneline`. Должно быть максимально информативно и понятно с первого
  взгляда.
- **Правила:**
    - **Пишется в повелительном наклонении (императив),** настоящем времени. Например: `Fix login button`,
      `Add user registration`, `Refactor payment processing`. Как будто вы отдаете команду Git:
      `Git, <subject>, чтобы применить это изменение`. (НЕ `Fixed...`, `Adding...`, `Refactors...`).
    - Начинается со строчной буквы (в англ. варианте). В русском языке можно с заглавной, если так принято в команде ("
      Исправить кнопку...", "Добавить регистрацию..."). Главное — консистентность.
    - Не ставится точка в конце.

---

### 2. Пустая строка (Blank Line)

- **Что это?** Ровно одна пустая строка, отделяющая заголовок от тела коммита.
- **Зачем?** Критически важно для корректной работы инструментов Git (`git log`, `git shortlog`, `git rebase` и др.),
  которые используют эту строку как разделитель между заголовком и остальным текстом.
- **Правила:** Если у коммита нет тела и футера, эта строка не нужна. Если есть хотя бы тело или футер, она \*
  \*обязательна\*\*.

---

### 3. Тело коммита (Optional Body)

- **Что это?** Необязательный блок текста, где можно подробно описать изменения.
- **Зачем?**
    - Объяснить **контекст:** Какую проблему решал коммит? Почему это изменение необходимо?
    - Описать **мотивацию и подход:** Какие были альтернативы? Почему выбран именно этот способ?
    - Детализировать **реализацию:** Особенно для сложных изменений, которые не очевидны из кода или заголовка.
    - **Не заменять комментарии в коде!** Тело коммита – для высокоуровневого объяснения "почему", а комментарии в
      коде – для объяснения "как" работает конкретный сложный участок.
- **Правила:**
    - Пишется обычным текстом, можно использовать абзацы.
    - Часто рекомендуется также использовать повелительное наклонение.
    - Можно использовать Markdown для форматирования (например, списки `*` или `-`).
    - Ограничивайте длину строк (часто до 72 символов), чтобы текст хорошо отображался в терминале без переносов.

---

### 4. Пустая строка (Blank Line)

- **Что это?** Ровно одна пустая строка, отделяющая тело коммита от футера.
- **Зачем?** Аналогично первой пустой строке – стандартный разделитель для инструментов Git.
- **Правила:** Если у коммита есть футер, эта строка **обязательна** (даже если нет тела).

---

### 5. Футер(ы) коммита (Optional Footer(s))

- **Что это?** Необязательный блок (одна или несколько строк), содержащий метаинформацию об изменениях.
- **Зачем?**
    - Для указания **обратно несовместимых изменений (Breaking Changes)**.
    - Для связи коммита с **задачами в трекерах** (Jira, GitHub Issues, YouTrack, etc.).
    - Для указания **соавторов** или **ревьюеров**.
- **Правила:**
    - Каждый элемент метаинформации обычно находится на новой строке.
    - Используются стандартные **токены** (ключевые слова), за которыми следует двоеточие и пробел (`:`), а затем
      значение.
    - **Обратно несовместимые изменения:**
        - Токен: `BREAKING CHANGE:` (именно так, с двоеточием и пробелом).
        - Значение: Подробное описание изменения, которое ломает совместимость, и инструкции по миграции для
          пользователей вашего кода/API.
        - Наличие этого токена автоматически означает мажорное обновление версии (по SemVer).
    - **Связь с задачами:**
        - Токены: `Fixes`, `Closes`, `Resolves` (используются, когда коммит полностью решает/закрывает указанную задачу)
          или `Refs`, `Relates-to` (когда коммит относится к задаче, но не закрывает ее).
        - Значение: Идентификатор задачи (например, `Fixes #123`, `Refs PROJECT-456`). Многие платформы (GitHub, GitLab)
          автоматически создают ссылки и/или закрывают задачи при пуше таких коммитов.

---

**Полные примеры:**

**Простой фикс:**

```
fix(auth): Correct password validation logic on registration

User could register with a short password due to missing length check.
This commit adds the required minimum length validation.
```

**Новая фича с областью и ссылкой на задачу:**

```
feat(cart): Add quantity update buttons to mini-cart

Allow users to change item quantities directly in the header mini-cart
without going to the full cart page. Improves user experience for
quick adjustments.

Resolves #42
```

**Рефакторинг с подробным телом и Breaking Change:**

```
refactor(api): Standardize all API responses to use JSend format

Previously, API endpoints returned data in inconsistent formats.
This refactor updates all controllers to return data wrapped
in the JSend specification ({ status, data } or { status, message }).

See JSend spec: https://github.com/omniti-labs/jsend

BREAKING CHANGE: API response structure has changed. Clients
consuming the API must be updated to expect the new JSend wrapper.
Specifically, data previously at the root level is now under the `data` key.
```

**Chore без тела, но с ссылкой:**

```
chore: Update ESLint configuration

Refs #115
```

---

## **EN**

**General structure:**

```
<type>(<scope>): <subject>
<BLANK LINE>
[optional body]
<BLANK LINE>
[optional footer(s)]
```

---

### 1. Header: `<type>(<scope>): <subject>`

This is the **required** and most important line of the commit. It consists of three parts:

#### `<type>` (Type of change)

- **What is it?** A single word describing the _category_ of the changes made.
- **Why is it needed?**
    - Allows you to immediately understand the nature of the commit without reading further.
    - Used by automation tools for:
        - Generating a Changelog.
        - Determining the next project version according to Semantic Versioning (SemVer). For example, `feat` may bump
          the minor version (1.x.0 -> 1.y.0), while `fix` may bump the patch version (1.1.x -> 1.1.y). A
          `BREAKING CHANGE` (in the footer) always implies a major version bump (x.0.0 -> y.0.0).
- **Common types (English version is the standard):**
    - `feat`: Introduces new user-facing functionality (feature).
    - `fix`: Fixes a bug in the code.
    - `refactor`: Changes existing code without fixing bugs or adding new features (e.g., readability, structure,
      performance improvements). Does not change behavior for the user.
    - `perf`: Improves performance through code changes.
    - `style`: Changes that do not affect logic or behavior (formatting, whitespace, renaming variables for clarity,
      etc.). Not related to CSS styles.
    - `test`: Adds or updates tests.
    - `build`: Changes related to the build system or external dependencies (Webpack, npm, Composer, Dockerfile, etc.).
    - `ci`: Changes to CI/CD configuration or scripts (.gitlab-ci.yml, GitHub Actions, etc.).
    - `docs`: Documentation only (README, JSDoc/PHPDoc comments, Swagger, etc.).
    - `chore`: Miscellaneous tasks that do not affect source code or tests. For example, updating `.gitignore`,
      development tools configuration, routine maintenance.
- **Rules:** Always written in lowercase.

#### `(<scope>)` (Scope / Context)

- **What is it?** An optional word (or several words, often hyphenated) in parentheses specifying which part of the
  project the commit affects.
- **Why is it needed?**
    - Helps understand which module, component, or domain the commit relates to, especially in large projects.
    - Simplifies filtering history (`git log --grep '\(auth\)'`).
- **Examples:** `(api)`, `(auth)`, `(checkout)`, `(product-card)`, `(admin-ui)`, `(user-profile)`, `(database)`.
- **Rules:** Lowercase. If not used, do not include parentheses. It must be consistent within the team (always use the
  same naming, e.g., `auth` vs. `authentication`).

#### `:` (Colon and space)

- **What is it?** A separator between `<type>(<scope>)` and `<subject>`.
- **Why is it needed?** Standardized syntax recognized by parsers.
- **Rules:** A colon is placed immediately after `<type>` or `(<scope>)`. **Exactly one space** must follow the colon.

#### `<subject>` (Subject / Commit title)

- **What is it?** A short (< 50–70 characters) summary of the change.
- **Why is it needed?** Appears in `git log --oneline`. Should be clear at first glance.
- **Rules:**
    - **Written in imperative mood**, present tense. Example: `Fix login button`, `Add user registration`,
      `Refactor payment processing`. Like giving Git a command.
    - Starts with a lowercase letter (in English). Consistency is the key.
    - No period at the end.

---

### 2. Blank line

- **What is it?** Exactly one empty line separating the header from the body.
- **Why is it needed?** Required for correct parsing by Git tools (`git log`, `git shortlog`, `git rebase`).
- **Rules:** If the commit has no body or footer, this line is not needed. If a body or footer exists, it is **mandatory
  **.

---

### 3. Commit body (Optional Body)

- **What is it?** An optional block of text for detailed explanation.
- **Why is it needed?**
    - Describe **context**: What problem does the commit solve?
    - Explain **motivation and reasoning**: Why this approach?
    - Provide **technical detail** for complex changes.
    - Does **not** replace code comments. The body explains “why”, comments explain “how”.
- **Rules:**
    - Free text, paragraphs allowed.
    - Often written in imperative mood as well.
    - Markdown formatting allowed (e.g., lists, code blocks).
    - Keep lines reasonably short (often ~72 characters).

---

### 4. Blank line

- **What is it?** Separates the body from the footer.
- **Why is it needed?** Required for parser compatibility.
- **Rules:** If a footer is present, the blank line is **mandatory**.

---

### 5. Commit footer(s) (Optional Footer(s))

- **What is it?** One or more lines containing metadata.
- **Why is it needed?**
    - To indicate **breaking changes**.
    - To reference or close **issue tracker tickets** (Jira, GitHub Issues, YouTrack).
    - To specify **co-authors** or **reviewers**.
- **Rules:**
    - Each entry on its own line.
    - Use standard tokens: keyword + colon + space.
    - **Breaking changes:**
        - Token: `BREAKING CHANGE:` (exact format)
        - Description: What changed and how to migrate.
        - Automatically implies a major SemVer bump.
    - **Issue references:**
        - Tokens: `Fixes`, `Closes`, `Resolves` (when the commit finishes a task)
        - Tokens: `Refs`, `Relates-to` (when it does not close the task)
        - Example: `Fixes #123`, `Refs PROJECT-456`.

---

**Complete examples:**

**Simple fix:**

```
fix(auth): correct password validation logic on registration

User could register with a short password due to missing length check.
This commit adds the required minimum length validation.
```

**New feature with scope and ticket reference:**

```
feat(cart): add quantity update buttons to mini-cart

Allow users to change item quantities directly in the header mini-cart
without going to the full cart page. Improves user experience for
quick adjustments.

Resolves #42
```

**Refactor with detailed body and Breaking Change:**

```
refactor(api): standardize all API responses to use JSend format

Previously, API endpoints returned data in inconsistent formats.
This refactor updates all controllers to return data wrapped
in the JSend specification ({ status, data } or { status, message }).

See JSend spec: https://github.com/omniti-labs/jsend

BREAKING CHANGE: API response structure has changed. Clients
consuming the API must be updated to expect the new JSend wrapper.
Specifically, data previously at the root level is now under the `data` key.
```

**Chore without body but with reference:**

```
chore: update ESLint configuration

Refs #115
```

---
