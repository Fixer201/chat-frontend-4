'use client'
import Image from 'next/image'

type SearchProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    leftIconSrc?: string
    clearIconSrc?: string
    showClearButton?: boolean
    className?: string
    inputClassName?: string
    ariaLabel?: string
}

export default function Search({
    value,
    onChange,
    placeholder = '',
    leftIconSrc = '/images/search/iconsSearch.svg',
    clearIconSrc = '/images/search/iconsClose.svg',
    showClearButton = true,
    className = '',
    inputClassName = '',
    ariaLabel = 'Поиск',
}: SearchProps) {
    return (
        <div
            className={`
              min-w-0 flex-1
              ${className}
            `}
        >
            <div
                className={`
                  relative flex h-11 w-full min-w-0 items-center gap-2
                  rounded-lg border border-gray-border bg-white-bg px-3 pr-10
                `}
            >
                {leftIconSrc && (
                    <Image
                        src={leftIconSrc}
                        alt="search icon"
                        width={24}
                        height={24}
                        style={{
                            width: '24px',
                            height: '24px',
                        }}
                    />
                )}

                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    aria-label={ariaLabel}
                    className={`
                      h-11 w-full min-w-0 bg-transparent py-2.5 text-sm
                      placeholder:text-text-gray
                      focus:border-transparent focus:outline-none
                      ${inputClassName}
                    `}
                />

                {showClearButton && value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className={`
                          absolute top-1/2 right-3 -translate-y-1/2 transform
                          rounded-full p-1 transition-all duration-200
                          hover:bg-gray-light
                        `}
                        aria-label="Очистить поиск"
                    >
                        <Image
                            src={clearIconSrc}
                            alt="clear"
                            width={14}
                            height={14}
                            className={`
                              opacity-60 transition-opacity
                              hover:opacity-100
                            `}
                        />
                    </button>
                )}
            </div>
        </div>
    )
}
