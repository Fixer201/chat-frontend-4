'use client'
import Image from 'next/image'
type ContactsSearchProps = {
    searchValue: string
    onSearchChange: (value: string) => void
}
export default function ContactsSearch({ searchValue, onSearchChange }: ContactsSearchProps) {
    return <>
        <div className="flex w-[360px] h-[76px] p-4 gap-2.5 items-center">
            <Image
                    src="/images/search/iconsSearch.svg"
                    alt="iconsClose"
                    width={24}
                    height={24}
                    style={{
                        width: '24px',
                        height: '24px',
                        position: 'relative'
                        
                    }}
                />
            <div className="relative">
                
                <input
                    type="text"
                    placeholder="Search contacts"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-[328px] h-11 px-3 pr-10 rounded-lg border border-gray-300 gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                

                {/* Иконка закрыть появляется если есть текст */}
                {searchValue && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
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
    </>;
}
