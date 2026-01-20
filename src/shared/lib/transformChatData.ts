// Утилиты для трансформации данных между snake_case и camelCase форматами

// Вспомогательная функция для преобразования строки из snake_case в camelCase
const snakeToCamel = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
    )
}

// Вспомогательная функция для преобразования строки из camelCase в snake_case
const camelToSnake = (str: string): string => {
    return str.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`,
    )
}

// Тип для рекурсивной трансформации ключей объекта из snake_case в camelCase
type TransformToCamelCase<T> =
    T extends Array<infer U>
        ? Array<TransformToCamelCase<U>>
        : T extends object
          ? {
                [K in keyof T as SnakeToCamel<
                    K & string
                >]: TransformToCamelCase<T[K]>
            }
          : T

// Вспомогательный тип для преобразования строки snake_case в camelCase
type SnakeToCamel<S extends string> =
    S extends `${infer T}_${infer U}`
        ? `${T}${Capitalize<SnakeToCamel<U>>}`
        : S

// Тип для рекурсивной трансформации ключей объекта из camelCase в snake_case
type TransformToSnakeCase<T> =
    T extends Array<infer U>
        ? Array<TransformToSnakeCase<U>>
        : T extends object
          ? {
                [K in keyof T as CamelToSnake<
                    K & string
                >]: TransformToSnakeCase<T[K]>
            }
          : T

// Вспомогательный тип для преобразования строки camelCase в snake_case
type CamelToSnake<S extends string> =
    S extends `${infer T}${infer U}`
        ? U extends Uncapitalize<U>
            ? `${Lowercase<T>}${CamelToSnake<U>}`
            : `${Lowercase<T>}_${CamelToSnake<Uncapitalize<U>>}`
        : S

// Рекурсивная функция для трансформации объекта из snake_case в camelCase
const transformKeysToCamelCase = <T>(
    obj: unknown,
): TransformToCamelCase<T> => {
    if (
        obj === null ||
        obj === undefined ||
        typeof obj !== 'object'
    ) {
        return obj as TransformToCamelCase<T>
    }

    if (Array.isArray(obj)) {
        return obj.map((item) =>
            transformKeysToCamelCase(item),
        ) as TransformToCamelCase<T>
    }

    const transformedObj: Record<string, unknown> = {}

    for (const key in obj as Record<string, unknown>) {
        if (
            Object.prototype.hasOwnProperty.call(obj, key)
        ) {
            const camelKey = snakeToCamel(key)
            const value = (obj as Record<string, unknown>)[
                key
            ]

            // Рекурсивно обрабатываем вложенные объекты и массивы
            if (value && typeof value === 'object') {
                transformedObj[camelKey] =
                    transformKeysToCamelCase(value)
            } else {
                transformedObj[camelKey] = value
            }
        }
    }

    return transformedObj as TransformToCamelCase<T>
}

// Рекурсивная функция для трансформации объекта из camelCase в snake_case
const transformKeysToSnakeCase = <T>(
    obj: unknown,
): TransformToSnakeCase<T> => {
    if (
        obj === null ||
        obj === undefined ||
        typeof obj !== 'object'
    ) {
        return obj as TransformToSnakeCase<T>
    }

    if (Array.isArray(obj)) {
        return obj.map((item) =>
            transformKeysToSnakeCase(item),
        ) as TransformToSnakeCase<T>
    }

    const transformedObj: Record<string, unknown> = {}

    for (const key in obj as Record<string, unknown>) {
        if (
            Object.prototype.hasOwnProperty.call(obj, key)
        ) {
            const snakeKey = camelToSnake(key)
            const value = (obj as Record<string, unknown>)[
                key
            ]

            // Рекурсивно обрабатываем вложенные объекты и массивы
            if (value && typeof value === 'object') {
                transformedObj[snakeKey] =
                    transformKeysToSnakeCase(value)
            } else {
                transformedObj[snakeKey] = value
            }
        }
    }

    return transformedObj as TransformToSnakeCase<T>
}

/**
 * Преобразует данные из API формата (snake_case) в UI формат (camelCase)
 * Универсальная функция, работающая с любыми типами данных
 *
 * @template T - тип API данных (snake_case)
 * @param apiData - данные в API формате
 * @returns данные в UI формате (camelCase)
 */
export const transformFromApi = <T>(
    apiData: T,
): TransformToCamelCase<T> => {
    return transformKeysToCamelCase<T>(apiData)
}

/**
 * Преобразует массив данных из API формата в UI формат
 *
 * @template T - тип элемента массива API данных
 * @param apiDataArray - массив данных в API формате
 * @returns массив данных в UI формате
 */
export const transformListFromApi = <T>(
    apiDataArray: T[],
): TransformToCamelCase<T>[] => {
    return apiDataArray.map((item) =>
        transformFromApi<T>(item),
    )
}

/**
 * Преобразует UI данные обратно в API формат (snake_case)
 * Универсальная функция, работающая с любыми типами данных
 *
 * @template T - тип UI данных (camelCase)
 * @param uiData - данные в UI формате
 * @returns данные в API формате (snake_case)
 */
export const transformToApi = <T>(
    uiData: T,
): TransformToSnakeCase<T> => {
    return transformKeysToSnakeCase<T>(uiData)
}

/**
 * Преобразует массив UI данных обратно в API формат
 *
 * @template T - тип элемента массива UI данных
 * @param uiDataArray - массив данных в UI формате
 * @returns массив данных в API формате
 */
export const transformListToApi = <T>(
    uiDataArray: T[],
): TransformToSnakeCase<T>[] => {
    return uiDataArray.map((item) =>
        transformToApi<T>(item),
    )
}

// Экспорт вспомогательных функций для использования в других местах
export const transformUtils = {
    snakeToCamel,
    camelToSnake,
    transformKeysToCamelCase,
    transformKeysToSnakeCase,
} as const

//Использование
// Пример с вашими типами (теперь импорт делается в месте использования)
// import { transformFromApi, transformListFromApi, transformToApi } from './transformers';
// import { ApiChatItem, ChatItem, ChatSettings } from '../types/chat';

// // 1. Трансформация одного элемента
// const apiChatItem: ApiChatItem = { /* ... snake_case поля ... */ };
// const uiChatItem: ChatItem = transformFromApi<ApiChatItem>(apiChatItem);

// // 2. Трансформация массива
// const apiChatList: ApiChatItem[] = [/* ... */];
// const uiChatList: ChatItem[] = transformListFromApi<ApiChatItem>(apiChatList);

// // 3. Обратная трансформация
// const transformedBack: ApiChatItem = transformToApi<ChatItem>(uiChatItem);

// // 4. Для массивов обратно
// const transformedBackList: ApiChatItem[] = transformListToApi<ChatItem>(uiChatList);
