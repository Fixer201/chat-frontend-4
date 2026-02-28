// PreviewContext.tsx
'use client'

import React, { createContext, useContext } from 'react'

// Создаём контекст для хранения флага "режим предпросмотра"
// Значение по умолчанию - false (не в режиме предпросмотра)
const PreviewContext = createContext<boolean>(false)

// Провайдер контекста - оборачивает компоненты, которым нужен доступ к флагу preview
export const PreviewProvider = PreviewContext.Provider

// Хук для использования контекста в дочерних компонентах
export function usePreview() {
    return useContext(PreviewContext)
}

export default PreviewProvider
