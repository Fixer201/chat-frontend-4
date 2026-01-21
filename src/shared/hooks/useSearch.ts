// Хук useSearch для фильтрации массивов данных по строке поиска
import { useMemo } from 'react'

// Вспомогательный тип для безопасного доступа к свойствам
// Определяет допустимые типы значений, которые можно искать
type SafeValue =
    | string
    | number
    | boolean
    | null
    | undefined

// Вспомогательная функция для получения вложенных свойств (по точкам в строке)
// Позволяет искать не только в корневых свойствах, но и во вложенных объектах
const getNestedValue = <T>(
    obj: T,
    path: string,
): SafeValue => {
    const parts = path.split('.') // Разделяем путь по точкам: 'chat.firstName' → ['chat', 'firstName']
    let current: unknown = obj // Начинаем с корневого объекта

    for (const part of parts) {
        // Проверяем, что current - не null/undefined, это объект (не массив) и содержит нужное свойство
        if (
            current !== null &&
            current !== undefined &&
            typeof current === 'object' &&
            !Array.isArray(current) &&
            part in (current as Record<string, unknown>)
        ) {
            current = (current as Record<string, unknown>)[
                part
            ] // Переходим на следующий уровень
        } else {
            return undefined // Если путь не существует - возвращаем undefined
        }
    }

    return current as SafeValue // Возвращаем найденное значение с приведением типа
}

// Вспомогательная функция для проверки, является ли значение безопасным для поиска
// Используется для валидации значений перед поиском
const isSearchableValue = (
    value: unknown,
): value is SafeValue => {
    return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    )
}

// Основной хук для поиска по массиву элементов
// useMemo внутри хука мемоизирует результат фильтрации, предотвращая пересчет при каждом рендере
export const useSearch = <T>(
    items: T[], // Массив элементов для поиска - основная зависимость
    searchValue: string, // Строка поиска - триггер пересчета
    fields?: Array<string | ((item: T) => string)>, // Поля для поиска или функции-селекторы
) => {
    // Мемоизированное значение отфильтрованного массива
    // useMemo выполняет вычисление только при изменении items, searchValue или fields
    const filteredValue = useMemo((): T[] => {
        // Если строка поиска пустая — возвращаем все элементы без фильтрации
        // trim() удаляет пробелы в начале и конце для корректной проверки
        if (!searchValue.trim()) {
            return items
        }

        // Приводим поисковый запрос к нижнему регистру для case-insensitive поиска
        const query = searchValue.toLowerCase().trim()

        // Фильтруем массив items
        return items.filter((item) => {
            // Если не указаны поля для поиска — ищем во всех строковых полях объекта
            // Это поведение по умолчанию для простых случаев
            if (!fields || fields.length === 0) {
                const itemObj = item as Record<
                    string,
                    unknown
                >
                return Object.values(itemObj).some(
                    (value) => {
                        if (typeof value === 'string') {
                            return value
                                .toLowerCase()
                                .includes(query)
                        }
                        return false // Нестроковые значения игнорируем
                    },
                )
            }

            // Ищем в указанных полях (если fields передан)
            // some возвращает true если хотя бы одно поле содержит искомую строку
            return fields.some((field) => {
                // Если поле — функция, вызываем её для получения значения
                // Это позволяет реализовать сложную логику получения данных для поиска
                if (typeof field === 'function') {
                    try {
                        const result = field(item)
                        if (typeof result === 'string') {
                            return result
                                .toLowerCase()
                                .includes(query)
                        }
                        return false // Функция должна возвращать строку для поиска
                    } catch {
                        return false // Если функция выбросила ошибку - игнорируем это поле
                    }
                }

                // Для строковых путей (например, 'chat.firstName')
                let value: SafeValue

                if (field.includes('.')) {
                    // Вложенное свойство (например: 'chat.firstName')
                    // Используем вспомогательную функцию для доступа к вложенным свойствам
                    value = getNestedValue(item, field)
                } else {
                    // Простое свойство (без точек)
                    const itemObj = item as Record<
                        string,
                        unknown
                    >
                    const fieldValue = itemObj[field]
                    value = isSearchableValue(fieldValue)
                        ? fieldValue
                        : undefined
                }

                // Превращаем значение в строку и ищем
                // Проверяем что значение не undefined/null перед преобразованием
                if (value === undefined || value === null) {
                    return false
                }
                // String() преобразует любое значение в строку (числа, булевы значения и т.д.)
                return String(value)
                    .toLowerCase()
                    .includes(query)
            })
        })
    }, [items, searchValue, fields]) // Пересчет только при изменении этих зависимостей

    return { filteredValue } // Возвращаем отфильтрованный массив в виде объекта для удобства деструктуризации
}
