/**
 * Скачивает файл по URL
 * @param url - URL файла (может быть относительным)
 * @param filename - имя сохраняемого файла
 */
export function downloadFileFromUrl(
    url: string,
    filename: string,
): void {
    try {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } catch (error) {
        console.error('Ошибка при скачивании файла:', error)
    }
}

/**
 * Скачивает файл из Blob-данных
 * @param blob - Blob данные
 * @param filename - имя сохраняемого файла
 */
export function downloadBlob(
    blob: Blob,
    filename: string,
): void {
    try {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Ошибка при скачивании Blob:', error)
    }
}
