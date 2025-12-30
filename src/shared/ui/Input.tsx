import { forwardRef } from 'react'

import { cn } from '@lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    isInvalid?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, isInvalid = false, ...props }, ref) => {
        return (
            <input
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
    },
)

Input.displayName = 'Input'

export default Input
