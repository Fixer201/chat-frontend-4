// src/shared/lib/localStorageGroupAudio.ts
import { MockFile } from '@shared/types/file'

const STORAGE_KEY = 'groups_audio'

export interface GroupAudioEntry {
  chatKey: string
  audio: {
    count: number
    results: MockFile[]
  }
}

function loadAllGroupAudio(): Record<string, GroupAudioEntry['audio']> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Ошибка при чтении аудио групп:', error)
  }
  return {}
}

function saveAllGroupAudio(data: Record<string, GroupAudioEntry['audio']>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Ошибка при сохранении аудио групп:', error)
  }
}

export function loadGroupAudio(chatUid: string): GroupAudioEntry['audio'] | null {
  const all = loadAllGroupAudio()
  return all[chatUid] || null
}

export function saveGroupAudio(chatUid: string, audio: GroupAudioEntry['audio']): void {
  const all = loadAllGroupAudio()
  all[chatUid] = audio
  saveAllGroupAudio(all)
  console.log(`[saveGroupAudio] Сохранено ${audio.count} аудиофайлов для chatUid ${chatUid}`)
}

export function initGroupAudio(chatUid: string, mockAudio: MockFile[]): GroupAudioEntry['audio'] {
  const existing = loadGroupAudio(chatUid)
  if (existing) {
    return existing
  }
  const newAudio = {
    count: mockAudio.length,
    results: mockAudio
  }
  saveGroupAudio(chatUid, newAudio)
  return newAudio
}