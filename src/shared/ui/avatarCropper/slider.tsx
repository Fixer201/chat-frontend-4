import * as SliderPrimitive from '@radix-ui/react-slider'
import { forwardRef } from 'react'

import { cn } from '@shared/lib/utils'

type SliderProps = React.ComponentPropsWithoutRef<
    typeof SliderPrimitive.Root
>

export const Slider = forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            'relative flex w-full touch-none items-center select-none',
            className,
        )}
        {...props}
    >
        <SliderPrimitive.Track
            className={`
          relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#e4e4e7]
        `}
        >
            <SliderPrimitive.Range className="absolute h-full bg-[#7f67f8]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
            className={`
          block h-5 w-5 rounded-full border-2 border-white bg-[#7f67f8]
          shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition
          focus-visible:ring-2 focus-visible:ring-[#7f67f8]
          focus-visible:ring-offset-2 focus-visible:ring-offset-white
          focus-visible:outline-none
        `}
        />
    </SliderPrimitive.Root>
))

Slider.displayName = 'Slider'
