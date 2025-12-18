'use client'
import Image from 'next/image'

type ContactsDeleteProps = {
    deleteMode: boolean
    onToggleDeleteMode: (mode: boolean) => void
}

export default function ContactsDelete({
    deleteMode,
    onToggleDeleteMode,
}: ContactsDeleteProps) {
    return (
        <>
            {deleteMode ? (
                <div className="w-full h-9 flex justify-between gap-1 bg-[#EFEEF7] pl-4 pt-2.5 pr-4 pb-2.5">
                    <Image
                        src="/images/contacts/arrow.svg"
                        alt="back"
                        width={24}
                        height={24}
                        style={{
                            width: '24px',
                            height: '24px',
                        }}
                        onClick={() =>
                            onToggleDeleteMode(false)
                        }
                    />
                    <p>Удалить контакты</p>
                    <Image
                        src={
                            deleteMode
                                ? '/images/contacts/basketViolet.svg'
                                : '/images/contacts/basket.svg'
                        }
                        alt="delete"
                        width={24}
                        height={24}
                        style={{
                            width: '24px',
                            height: '24px',
                        }}
                    />
                </div>
            ) : (
                <div className="w-full h-9 flex justify-between gap-1 bg-[#EFEEF7] pl-4 pt-2.5 pr-4 pb-2.5">
                    <p>Контакты пользователей А-чата</p>
                    <Image
                        src="/images/contacts/basket.svg"
                        alt="delete"
                        width={24}
                        height={24}
                        style={{
                            width: '24px',
                            height: '24px',
                        }}
                        onClick={() =>
                            onToggleDeleteMode(true)
                        }
                    />
                </div>
            )}
        </>
    )
}
