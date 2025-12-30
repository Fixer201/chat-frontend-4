import { forwardRef } from 'react'

import { cn } from '@lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    isInvalid?: boolean
}

const Textarea = forwardRef<
    HTMLTextAreaElement,
    TextareaProps
>(({ className, isInvalid = false, ...props }, ref) => {
    return (
        <textarea
            ref={ref}
            className={cn(
                `
            w-full rounded-md bg-white p-4 text-base text-text-black
            transition-colors outline-none
          `,
                isInvalid &&
                    `
              border-2 border-[var(--color-system-red)]
              focus:border-[var(--color-system-red)] focus:shadow-none
            `,
                className,
            )}
            {...props}
        />
    )
})

Textarea.displayName = 'Textarea'

export default Textarea
