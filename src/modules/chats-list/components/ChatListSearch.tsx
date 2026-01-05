import Image from 'next/image'
interface ChatListSearchProps {
    searchValue: string
    setSearchValue: (value: string) => void
    clearSearchInput: () => void
    placeholder?: string
}
export default function ChatListSearch({
    searchValue,
    setSearchValue,
    clearSearchInput,
    placeholder,
}: ChatListSearchProps) {
    return (
        <div className="flex h-1/12 min-h-15 items-center bg-[#F5F6F8] px-4">
            <div className="relative w-full">
                <div
                    className={`
                      pointer-events-none absolute top-1/2 left-3
                      -translate-y-1/2 transform
                    `}
                >
                    <svg
                        viewBox="0 0 17.4883 17.4883"
                        xmlns="http://www.w3.org/2000/svg"
                        width="17.488281"
                        height="17.488281"
                        fill="none"
                    >
                        <path
                            id="Vector"
                            d="M12.5 11L11.71 11L11.43 10.73C12.41 9.59 13 8.11 13 6.5C13 
                            2.91 10.09 0 6.5 0C2.91 0 0 2.91 0 6.5C0 10.09 2.91 13 6.5 
                            13C8.11 13 9.59 12.41 10.73 11.43L11 11.71L11 12.5L16 17.49L17.49 
                            16L12.5 11ZM6.5 11C4.01 11 2 8.99 2 6.5C2 4.01 4.01 2 6.5 2C8.99 
                            2 11 4.01 11 6.5C11 8.99 8.99 11 6.5 11Z"
                            fill={'#747474'}
                            fillRule="nonzero"
                        />
                    </svg>
                </div>

                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) =>
                        setSearchValue(e.target.value)
                    }
                    className={`
                          box-border w-full rounded-lg border border-[#EEEEEE]
                          bg-white py-2.5 pr-4 pl-10 text-sm transition-all
                          duration-200
                          placeholder:text-gray-400
                          focus:border-[#EEEEEE] focus:ring-0 focus:outline-none
                        `}
                />
                {searchValue && (
                    <button
                        type="button"
                        onClick={clearSearchInput}
                        className={`
                              absolute top-1/2 right-3 -translate-y-1/2
                              transform rounded-full p-1 transition-all
                              duration-200
                              hover:bg-gray-100
                            `}
                        aria-label="Очистить поиск"
                    >
                        <Image
                            src="/images/chatHeader/closeSearch.svg"
                            alt="Clear search"
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
