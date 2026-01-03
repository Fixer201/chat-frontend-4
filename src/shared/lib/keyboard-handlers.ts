/**
 * Keyboard event handlers for accessibility
 * Implements W3C WAI-ARIA keyboard interaction patterns
 * Reference: https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR2.html
 */

/**
 * Creates a handler for button-like elements that respond to Enter and Space keys
 * Follows WAI-ARIA button pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
export const createButtonKeyHandler = (
    callback: () => void,
) => {
    return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            callback()
        }
    }
}

/**
 * Creates a handler for dialog/modal elements that respond to Escape key
 * Follows WAI-ARIA dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
 */
export const createEscapeKeyHandler = (
    callback: () => void,
) => {
    return (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            callback()
        }
    }
}

/**
 * Creates a handler for dialog overlay that responds to Escape key with condition
 * Uses conditional logic to check if overlay click should close the dialog
 */
export const createEscapeKeyHandlerWithCondition = (
    callback: () => void,
    condition: boolean = true,
) => {
    return (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && condition) {
            e.preventDefault()
            callback()
        }
    }
}

/**
 * Creates paired mouse and keyboard handlers for element interaction
 * Ensures device-independent interaction as per W3C guidelines
 */
export const createMouseAndKeyboardHandler = (
    callback: () => void,
    keys: string[] = ['Enter', ' '],
) => {
    return (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e) {
            // Keyboard event
            if (keys.includes(e.key)) {
                e.preventDefault()
                callback()
            }
        } else {
            // Mouse event
            callback()
        }
    }
}
