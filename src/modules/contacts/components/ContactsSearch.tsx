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
            <div className="flex w-full h-19 p-4 gap-2.5 items-center">
                <div className="relative flex w-full items-center rounded-lg border border-gray-300 gap-2 h-11 px-3 pr-10 bg-(--color-white-bg)">
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
                        className="w-full h-11 focus:outline-none focus:border-transparent"
                    />

                    {searchValue && (
                        <button
                            type="button"
                            onClick={() =>
                                onSearchChange('')
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
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
