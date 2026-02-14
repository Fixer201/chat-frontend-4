'use client'

import { createContext, useContext } from 'react'

const PreviewContext = createContext<boolean>(false)

export const PreviewProvider = PreviewContext.Provider

export function usePreview() {
    return useContext(PreviewContext)
}

export default PreviewProvider
