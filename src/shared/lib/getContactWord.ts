// Функция для склонения слова "контакт"
export const getContactWord = (count: number): string => {
    if (count % 10 === 1 && count % 100 !== 11)
        return 'контакт'
    if (
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        (count % 100 < 10 || count % 100 >= 20)
    )
        return 'контакта'
    return 'контактов'
}
