// src/shared/lib/localStorageContacts.ts
import { Contact } from '@shared/types/contact'
import { ContactsListDB } from '@shared/config/constants'

const STORAGE_KEY = 'contacts_cache'

/**
 * Загружает массив контактов из localStorage
 */
export function loadContactsFromStorage(): Contact[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed as Contact[]
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении контактов из localStorage:', error)
  }
  return null
}

/**
 * Сохраняет массив контактов в localStorage
 */
export function saveContactsToStorage(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch (error) {
    console.error('Ошибка при сохранении контактов в localStorage:', error)
  }
}

/**
 * Инициализирует контакты: берёт из localStorage или из базы по умолчанию и кэширует
 */
export function initializeContacts(): Contact[] {
  const stored = loadContactsFromStorage()
  if (stored) {
    return stored
  }
  // Если в localStorage нет, сохраняем базу по умолчанию и возвращаем её
  saveContactsToStorage(ContactsListDB)
  return ContactsListDB
}

/**
 * Добавляет новый контакт в существующий список в localStorage
 */
export function addContactToStorage(newContact: Contact): void {
  const existing = loadContactsFromStorage() || []
  const exists = existing.some(c => c.uid === newContact.uid)
  if (!exists) {
    existing.push(newContact)
    saveContactsToStorage(existing)
  }
}

/**
 * Удаляет контакты по uid из localStorage
 */
export function removeContactsFromStorage(uids: string[]): void {
  const existing = loadContactsFromStorage() || []
  const filtered = existing.filter(c => !uids.includes(c.uid))
  saveContactsToStorage(filtered)
}