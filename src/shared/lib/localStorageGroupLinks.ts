// src/shared/lib/localStorageGroupLinks.ts
import { MockLink } from '@shared/types/link'

const STORAGE_KEY = 'groups_links'

function loadAllGroupLinks(): Record<string, { count: number; results: MockLink[] }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении ссылок групп:', error)
  }
  return {}
}

function saveAllGroupLinks(data: Record<string, { count: number; results: MockLink[] }>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Ошибка при сохранении ссылок групп:', error)
  }
}

export function loadGroupLinks(chatUid: string): { count: number; results: MockLink[] } | null {
  const all = loadAllGroupLinks()
  return all[chatUid] || null
}

export function saveGroupLinks(chatUid: string, links: { count: number; results: MockLink[] }): void {
  const all = loadAllGroupLinks()
  all[chatUid] = links
  saveAllGroupLinks(all)
  console.log(`[saveGroupLinks] Сохранено ${links.count} ссылок для chatUid ${chatUid}`)
}

export function initGroupLinks(chatUid: string, mockLinks: MockLink[]): { count: number; results: MockLink[] } {
  const existing = loadGroupLinks(chatUid)
  if (existing) {
    return existing
  }
  const newLinks = {
    count: mockLinks.length,
    results: mockLinks
  }
  saveGroupLinks(chatUid, newLinks)
  return newLinks
}