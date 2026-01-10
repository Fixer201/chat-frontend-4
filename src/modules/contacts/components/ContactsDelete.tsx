/* eslint-disable better-tailwindcss/enforce-consistent-line-wrapping */
'use client'
import Image from 'next/image'

type ContactsDeleteProps = {
    deleteMode: boolean
    onToggleDeleteMode: (mode: boolean) => void
    selectedContacts: string[]
    onClearSelection: () => void
}

export default function ContactsDelete({
    deleteMode,
    onToggleDeleteMode,
    selectedContacts,
    onClearSelection,
}: ContactsDeleteProps) {
    return (
        <>
            {deleteMode ? (
                <div
                    className={`
                      flex h-9 w-full justify-between gap-1 bg-gray-light pt-2.5
                      pr-4 pb-2.5 pl-4
                    `}
                >
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
                    {selectedContacts.length > 0 ? (
                        <Image
                            src="/images/contacts/iconCancel.svg"
                            alt="cancel selection"
                            width={24}
                            height={24}
                            style={{
                                width: '24px',
                                height: '24px',
                            }}
                            onClick={onClearSelection}
                            className="cursor-pointer"
                            aria-label="Отменить выделение всех контактов"
                        />
                    ) : (
                        <Image
                            src="/images/contacts/basketViolet.svg"
                            alt="delete"
                            width={24}
                            height={24}
                            style={{
                                width: '24px',
                                height: '24px',
                            }}
                        />
                    )}
                </div>
            ) : (
                <div
                    className={`
                      flex h-9 w-full justify-between gap-1 bg-gray-light pt-2.5
                      pr-4 pb-2.5 pl-4
                    `}
                >
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
