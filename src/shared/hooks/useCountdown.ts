import { useState, useEffect, useCallback } from 'react'

export function useCountdown(initialTime: number) {
    const [timeLeft, setTimeLeft] = useState(initialTime)
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [isActive, timeLeft])

    const reset = useCallback(() => {
        setTimeLeft(initialTime)
        setIsActive(true)
    }, [initialTime])

    const stop = useCallback(() => setIsActive(false), [])

    return { timeLeft, reset, stop, isActive }
}
