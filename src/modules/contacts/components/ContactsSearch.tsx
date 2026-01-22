'use client'
import Image from 'next/image'
type ContactsSearchProps = {
    searchValue: string
    onSearchChange: (value: string) => void
}
export default function ContactsSearch({
    searchValue,
    onSearchChange,
}: ContactsSearchProps) {
    return (
        <>
            <div className="flex h-19 w-full items-center gap-2.5 p-4">
                <div
                    // eslint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping
                    className={`
                      relative flex h-11 w-full items-center gap-2 rounded-lg
                      border border-gray-300 bg-(--color-white-bg) px-3 pr-10
                    `}
                >
                    <Image
                        src="/images/search/iconsSearch.svg"
                        alt="iconsClose"
                        width={24}
                        height={24}
                        style={{
                            width: '24px',
                            height: '24px',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={searchValue}
                        onChange={(e) =>
                            onSearchChange(e.target.value)
                        }
                        // eslint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping
                        className={`
                          h-11 w-full
                          focus:border-transparent focus:outline-none
                        `}
                    />

                    {searchValue && (
                        <button
                            type="button"
                            onClick={() =>
                                onSearchChange('')
                            }
                            // eslint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping
                            className={`
                              absolute top-1/2 right-3 -translate-y-1/2
                              transform cursor-pointer
                            `}
                        >
                            <Image
                                src="/images/search/iconsClose.svg"
                                alt="iconsClose"
                                width={24}
                                height={24}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                }}
                            />
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}
