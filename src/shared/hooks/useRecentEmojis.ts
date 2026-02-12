'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'recent-emojis'
const MAX_RECENT = 11 // 1 row

type Subscriber = () => void

// Helper to check if emoji is a ZWJ sequence (compound emoji)
function isZWJSequence(emoji: string): boolean {
    return emoji.includes('\u200D')
}

// Module-level store for sync across components
let cachedEmojis: string[] | null = null
const subscribers = new Set<Subscriber>()

function getSnapshot(): string[] {
    if (cachedEmojis === null) {
        cachedEmojis = loadFromStorage()
    }
    return cachedEmojis
}

function getServerSnapshot(): string[] {
    return []
}

function subscribe(callback: Subscriber): () => void {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
}

function notifySubscribers(): void {
    subscribers.forEach((cb) => cb())
}

function loadFromStorage(): string[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return []
        const parsed = JSON.parse(stored)
        if (!Array.isArray(parsed)) return []
        // Filter out ZWJ sequences to avoid rendering issues
        return parsed
            .filter((e) => !isZWJSequence(e))
            .slice(0, MAX_RECENT)
    } catch {
        return []
    }
}

function saveToStorage(emojis: string[]): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(emojis),
        )
    } catch {
        // Ignore storage errors (quota exceeded, etc.)
    }
}

export function useRecentEmojis() {
    const recentEmojis = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    )

    const addRecentEmoji = useCallback((emoji: string) => {
        // Don't add ZWJ sequences (compound emojis) to avoid rendering issues
        if (isZWJSequence(emoji)) {
            return
        }

        const current = getSnapshot()

        // Remove if already exists, then add to front
        const filtered = current.filter((e) => e !== emoji)
        const updated = [emoji, ...filtered].slice(
            0,
            MAX_RECENT,
        )

        // Update cache and storage
        cachedEmojis = updated
        saveToStorage(updated)

        // Notify all subscribers
        notifySubscribers()
    }, [])

    return { recentEmojis, addRecentEmoji }
}
