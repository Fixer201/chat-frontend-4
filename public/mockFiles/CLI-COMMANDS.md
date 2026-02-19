# CLI Commands

## Linting & Formatting

### npm run lint

Проверить код на ошибки ESLint (доступность, Tailwind, импорты)

- Выводит все ошибки и предупреждения
- Не меняет файлы
- Для запуска перед push в git

### npm run lint:fix

Автоматически исправить ошибки ESLint

- Исправляет все fixable ошибки (порядок классов, импортов и т.д.)
- Нереальные ошибки остаются (нужно исправить вручную)
- Для использования когда много ошибок ESLint

### npm run format

Переформатировать весь код согласно Prettier

- Меняет отступы, кавычки, переносы строк и т.д.
- Использует конфиг из .prettierrc.json (printWidth: 80)
- Безопасно запускать на всём проекте

### npm run format:check

Проверить форматирование без изменений

- Показывает какие файлы не соответствуют Prettier
- Не меняет файлы
- Для CI/CD pipeline'а

## Development

### npm run dev

Запустить Next.js dev сервер

- Hot reload при изменении файлов
- Доступен на http://localhost:3000
- Для локальной разработки

### npm run build

Собрать production бундл

- Проверяет TypeScript ошибки
- Оптимизирует код
- Создаёт .next папку
- Для деплоя

### npm run start

Запустить production сервер

- Требует предварительно запустить npm run build
- Использует оптимизированный код

## Workflow рекомендации

**Перед началом работы**:

```bash
npm run lint:fix    # исправить ошибки ESLint
npm run format      # переформатировать код
```

**Перед commit'ом**:

- Husky автоматически запустит lint-staged
- Он исправит ошибки ESLint и Prettier
- Если остались нереальные ошибки — commit заблокируется

**Перед push'ем**:

```bash
npm run lint        # финальная проверка
npm run build       # убедиться что проект собирается
```

## Как работает Husky (Pre-commit hook)

Когда ты делаешь `git commit`:

1. Husky перехватывает commit
2. Запускает lint-staged на изменённых файлах
3. ESLint --fix исправляет ошибки
4. Prettier --write переформатирует
5. Если всё OK → commit проходит
6. Если ошибки → commit блокируется (нужно исправить вручную)

Пример блокирования:

```
❌ Commit failed: ESLint found errors in src/Button.tsx
   - jsx-a11y/alt-text: Missing alt text on image

✓ Исправил ошибку, попробовал снова
✓ Commit прошёл
```

## Если что-то не работает

**Правило #1**: Читай документацию инструмента:

- Husky: https://typicode.github.io/husky/
- lint-staged: https://github.com/okonet/lint-staged
- ESLint: смотри docs/SETUP-PROGRESS.md

**Правило #2**: Не гадай — гугли точную ошибку

```bash
npm run lint
npm run format:check
```

**Правило #3**: Проверь что файлы существуют:

- `.husky/pre-commit` создан?
- `package.json` содержит `lint-staged`?
- `.prettierrc.json` и `.eslintrc.mjs` корректны?
