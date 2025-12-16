import { useMemo } from "react"

// Вспомогательный тип для безопасного доступа к свойствам
type SafeValue = string | number | boolean | null | undefined

// Вспомогательная функция для получения вложенных свойств
const getNestedValue = <T>(obj: T, path: string): SafeValue => {
    const parts = path.split('.')
    let current: unknown = obj
    
    for (const part of parts) {
        if (
            current !== null && 
            current !== undefined &&
            typeof current === 'object' && 
            !Array.isArray(current) &&
            part in (current as Record<string, unknown>)
        ) {
            current = (current as Record<string, unknown>)[part]
        } else {
            return undefined
        }
    }
    
    return current as SafeValue
}

// Вспомогательная функция для проверки, является ли значение безопасным для поиска
const isSearchableValue = (value: unknown): value is SafeValue => {
    return (
        value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    )
}

export const useSearch = <T>(
    items: T[], 
    searchValue: string,
    fields?: Array<string | ((item: T) => string)>
) => {
    const filteredValue = useMemo((): T[] => {
        // Если строка поиска пустая — возвращаем все элементы
        if (!searchValue.trim()) {
            return items
        }
        
        const query = searchValue.toLowerCase().trim()
        
        return items.filter(item => {
            // Если не указаны поля для поиска — ищем во всех строковых полях
            if (!fields || fields.length === 0) {
                const itemObj = item as Record<string, unknown>
                return Object.values(itemObj).some(value => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(query)
                    }
                    return false
                })
            }
            
            // Ищем в указанных полях
            return fields.some(field => {
                // Если поле — функция, вызываем её
                if (typeof field === 'function') {
                    try {
                        const result = field(item)
                        if (typeof result === 'string') {
                            return result.toLowerCase().includes(query)
                        }
                        return false
                    } catch {
                        return false
                    }
                }
                
                // Для строковых путей
                let value: SafeValue
                
                if (field.includes('.')) {
                    // Вложенное свойство
                    value = getNestedValue(item, field)
                } else {
                    // Простое свойство (без точек)
                    const itemObj = item as Record<string, unknown>
                    const fieldValue = itemObj[field]
                    value = isSearchableValue(fieldValue) ? fieldValue : undefined
                }
                
                // Превращаем значение в строку и ищем
                if (value === undefined || value === null) {
                    return false
                }
                return String(value).toLowerCase().includes(query)
            })
        })
        
    }, [items, searchValue, fields])
    
    return { filteredValue }
}