# Git Flow Guide

## Переводы | Translations

- [Russian](#russian)
- [English](#english)

## Russian

Работайте **ТОЛЬКО** в ветке `dev` своего форка.

### Настройка один раз

```bash
git remote add upstream <ссылка на оригинальный репозиторий>
git remote -v
```

### Перед работой или созданием Pull Request

```bash
git fetch upstream
git checkout dev
git merge upstream/dev
git push origin dev
```

### Работа с кодом

1. Создайте код в своей ветке `dev`.
2. Добавляйте изменения:

```bash
git add .
```

3. Делайте коммит в формате:

```bash
git commit -m "type(scope): description"
```

4. Отправляйте изменения в ваш форк:

```bash
git push origin dev
```

### Pull Request

Создавайте PR:

```
your-fork:dev → origin:dev (оригинальный репозиторий)
```

### Формат коммитов

Подробная структура коммитов описана в [docs/COMMIT-STRUCTURE.md](COMMIT-STRUCTURE.md).

```
type(scope): description
```

- **type:** `feat | fix | refactor | chore | style | test`
- **scope:** модуль или фича (`chat`, `chats-list`, `settings`)
- **description:** краткое описание на английском, в настоящем времени

**Пример:**

```
feat(chat): add ability to enter emojis
```

---

## English

Work **ONLY** in the `dev` branch of your fork.

### One-time setup

```bash
git remote add upstream <original repository URL>
git remote -v
```

### Before starting work or creating a Pull Request

```bash
git fetch upstream
git checkout dev
git merge upstream/dev
git push origin dev
```

### Working with code

1. Write your code in your `dev` branch.
2. Stage changes:

```bash
git add .
```

3. Commit changes using the format:

```bash
git commit -m "type(scope): description"
```

4. Push to your fork:

```bash
git push origin dev
```

### Pull Request

Create a PR:

```
your-fork:dev → origin:dev (original repository)
```

### Commit format

Detailed commit structure is described in [docs/COMMIT-STRUCTURE.md](COMMIT-STRUCTURE.md).

```
type(scope): description
```

- **type:** `feat | fix | refactor | chore | style | test`
- **scope:** module or feature (`chat`, `chats-list`, `settings`)
- **description:** short description in English, present tense

**Example:**

```
feat(chat): add ability to enter emojis
```
