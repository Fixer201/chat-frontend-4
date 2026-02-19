// src/shared/lib/localStorageGroupFiles.ts
import { MockFile } from '@shared/types/file'

const STORAGE_KEY = 'groups_files'

export interface GroupFilesEntry {
  chatKey: string
  files: {
    count: number
    results: MockFile[]
  }
}

// Получить весь объект
function loadAllGroupFiles(): Record<string, GroupFilesEntry['files']> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении файлов групп:', error)
  }
  return {}
}

// Сохранить весь объект
function saveAllGroupFiles(data: Record<string, GroupFilesEntry['files']>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Ошибка при сохранении файлов групп:', error)
  }
}

// Загрузить файлы для конкретной группы (по chatUid)
export function loadGroupFiles(chatUid: string): GroupFilesEntry['files'] | null {
  const all = loadAllGroupFiles()
  return all[chatUid] || null
}

// Сохранить файлы для конкретной группы (по chatUid)
export function saveGroupFiles(chatUid: string, files: GroupFilesEntry['files']): void {
  const all = loadAllGroupFiles()
  all[chatUid] = files
  saveAllGroupFiles(all)
  console.log(`[saveGroupFiles] Сохранено ${files.count} файлов для chatUid ${chatUid}`)
}

// Инициализация файлов для группы (если нет)
export function initGroupFiles(chatUid: string, mockFiles: MockFile[]): GroupFilesEntry['files'] {
  const existing = loadGroupFiles(chatUid)
  if (existing) {
    return existing
  }
  const newFiles = {
    count: mockFiles.length,
    results: mockFiles
  }
  saveGroupFiles(chatUid, newFiles)
  return newFiles
}