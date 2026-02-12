'use client'

import Image from 'next/image'
import { memo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useSearch } from '@shared/hooks/useSearch'
import { useApiFetcher } from '@shared/hooks/useApiFetcher'
import { cn } from '@shared/lib/utils'
import { ApiContact, Contact } from '@shared/types/contact'
import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import { ContactItem } from '@modules/contacts/components/ContactItem'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import Search from '@shared/ui/Search'
import EmptySearchState from '@shared/ui/emptySearchState/EmptySearchState'
import Modal from '@shared/ui/modal/Modal'
import { Spinner } from '@shared/ui/Spinner'

// Встроенная копия ContactsList специально для вкладки "Чёрный список"
const BlacklistContactsList = memo(
    function BlacklistContactsList() {
        const [searchValue, setSearchValue] = useState('')
        const [selectedContactUid, setSelectedContactUid] =
            useState<string | null>(null)
        const [isModalOpen, setIsModalOpen] =
            useState(false)
        const [loading, setLoading] = useState(true)
        const router = useRouter()
        const [blacklist, setBlacklist] = useState<
            Contact[]
        >([])
        // Поиск по чёрному списку.
        // Best practice: используем те же поля, что и в контактах,
        // чтобы пользователь получал предсказуемый результат.
        const { filteredValue: filteredContacts } =
            useSearch(blacklist, searchValue, [
                (contact) =>
                    `${contact.firstName} ${contact.lastName}`.toLowerCase(),
                (contact) => `${contact.phone}`,
                (contact) => `${contact.nickname}`,
            ])
        // Единый fetcher с обработкой токенов/ошибок.
        // Best practice: все API-вызовы проходят через него.
        const fetchData = useApiFetcher()

        // Загружаем чёрный список один раз при монтировании.
        // Best practice: держим side-effect в useEffect и чисто маппим данные.
        useEffect(() => {
            const loadBlacklist = async () => {
                try {
                    const data = await fetchData(
                        'https://api.test.chat.ktsf.ru/api/v1/contact/blacklist/',
                        {
                            method: 'GET',
                        },
                    )
                    const contactsData: ApiContact[] =
                        Array.isArray(data)
                            ? data
                            : data?.results || []

                    // API чёрного списка возвращает объекты с полем blocked_user.
                    // Best practice: маппим данные строго из blocked_user (fallback на item),
                    // чтобы UI:
                    // 1) не падал на undefined,
                    // 2) был устойчив к изменению формата ответа,
                    // 3) работал одинаково с массивом и пагинацией.
                    const mappedBlacklist: Contact[] =
                        contactsData.map(
                            (item: ApiContact) => {
                                const blockedUser =
                                    (
                                        item as ApiContact & {
                                            blocked_user?: ApiContact
                                        }
                                    ).blocked_user ?? item

                                return {
                                    uid: blockedUser.uid,
                                    nickname:
                                        blockedUser.nickname,
                                    phone: blockedUser.phone,
                                    firstName:
                                        blockedUser.first_name,
                                    lastName:
                                        blockedUser.last_name,
                                    avatar: blockedUser.avatar,
                                    avatarUrl:
                                        blockedUser.avatar_url,
                                    avatarWebp:
                                        blockedUser.avatar_webp,
                                    avatarWebpUrl:
                                        blockedUser.avatar_webp_url,
                                    isOnline:
                                        blockedUser.is_online,
                                    wasOnlineAt:
                                        blockedUser.was_online_at,
                                }
                            },
                        )

                    setBlacklist(mappedBlacklist)
                } catch (error: unknown) {
                    console.error(
                        'Ошибка загрузки чёрного списка:',
                        error,
                    )
                    if (error instanceof Error) {
                        if (
                            error.message ===
                                'RefreshTokenExpired' ||
                            error.message ===
                                'AccessTokenNotFound'
                        ) {
                            router.push('/auth/login')
                        }
                    }
                } finally {
                    setLoading(false)
                }
            }
            loadBlacklist()
        }, [fetchData, router])

        const handleOpenModal = (uid: string) => {
            // Открываем модалку удаления по uid выбранного пользователя.
            // Best practice: не сохраняем весь объект, чтобы не хранить лишние поля.
            setSelectedContactUid(uid)
            setIsModalOpen(true)
        }

        const handleCloseModal = () => {
            // Сбрасываем состояние модалки и выбранного контакта.
            // Best practice: чистим uid, чтобы избежать удаления не того контакта.
            setIsModalOpen(false)
            setSelectedContactUid(null)
        }

        // Удаление из чёрного списка: удаляем на сервере и синхронно чистим локальный state.
        // Best practice: обновляем UI только после успешного ответа сервера,
        // чтобы избежать рассинхрона, если запрос завершится ошибкой.
        const handleConfirmDelete = async () => {
            try {
                if (!selectedContactUid) return

                // API требует uid в path-param; метод DELETE не содержит body.
                await fetchData(
                    `https://api.test.chat.ktsf.ru/api/v1/contact/blacklist/delete/${selectedContactUid}/`,
                    {
                        method: 'DELETE',
                    },
                )

                // Локально удаляем элемент для мгновенного отклика UI.
                setBlacklist((prev) =>
                    prev.filter(
                        (contact) =>
                            contact.uid !==
                            selectedContactUid,
                    ),
                )

                setSelectedContactUid(null)
                setIsModalOpen(false)
            } catch (error) {
                console.error(
                    'Ошибка при удалении из чёрного списка:',
                    error,
                )
                if (error instanceof Error) {
                    if (
                        error.message ===
                            'RefreshTokenExpired' ||
                        error.message ===
                            'AccessTokenNotFound'
                    ) {
                        router.push('/auth/login')
                    }
                }
            }
        }

        // Ранний рендер состояния загрузки.
        // Best practice: минимизируем вложенность JSX.
        if (loading) {
            return (
                <div className="flex h-full items-center justify-center">
                    <p>Загрузка чёрного списка...</p>
                    <Spinner />
                </div>
            )
        }

        return (
            <>
                <div
                    className={`
                      mt-2 flex h-1/12 min-h-15 items-center gap-3 px-4
                    `}
                >
                    <Search
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Поиск"
                        clearIconSrc="/images/search/iconsClose.svg"
                        showClearButton={true}
                    />
                </div>

                <div className="flex flex-col">
                    <CustomScrollbar>
                        {filteredContacts &&
                        filteredContacts.length > 0 ? (
                            filteredContacts.map(
                                (contact) => (
                                    <ContactItem
                                        key={contact.uid}
                                        contact={contact}
                                        deleteMode={false}
                                        selectedUid={null}
                                        selectedContacts={[]}
                                        searchValue={
                                            searchValue
                                        }
                                        onSelectContact={() => {}}
                                        onSetSelectedContact={() => {}}
                                        rightElement={
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenModal(
                                                        contact.uid,
                                                    )
                                                }
                                                className={cn(
                                                    `
                                                      flex h-10 w-10
                                                      items-center
                                                    `,
                                                    'justify-center rounded-md',
                                                    'cursor-pointer',
                                                )}
                                                aria-label="Удалить контакт из чёрного списка"
                                            >
                                                <Image
                                                    src="/images/contacts/basketViolet.svg"
                                                    alt="delete"
                                                    width={
                                                        20
                                                    }
                                                    height={
                                                        20
                                                    }
                                                    style={{
                                                        width: '20px',
                                                        height: '20px',
                                                    }}
                                                />
                                            </button>
                                        }
                                    />
                                ),
                            )
                        ) : filteredContacts.length === 0 &&
                          searchValue.trim() ? (
                            <div
                                className={`
                                  flex h-full flex-col items-center
                                  justify-center p-4 text-center
                                `}
                            >
                                <EmptySearchState />
                            </div>
                        ) : (
                            <div
                                className={`
                                  flex h-full flex-col items-center
                                  justify-center p-4 text-center
                                `}
                            >
                                <Image
                                    src="/images/search/nullContacts.svg"
                                    alt="iconsSearch"
                                    width={200}
                                    height={200}
                                    loading="eager"
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                    }}
                                />
                                <p className="mt-2 text-text-gray">
                                    Чёрный список пока пуст
                                </p>
                            </div>
                        )}
                    </CustomScrollbar>
                </div>

                <Modal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    title="Удалить контакт из чёрного списка"
                    description={
                        !selectedContactUid
                            ? 'Выберите контакт для удаления из чёрного списка.'
                            : (() => {
                                  const contact =
                                      blacklist.find(
                                          (c) =>
                                              c.uid ===
                                              selectedContactUid,
                                      )
                                  const contactName =
                                      contact
                                          ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                                          : selectedContactUid

                                  return `Будет удален контакт ${contactName} из чёрного списка.`
                              })()
                    }
                    descriptionColor="muted"
                    titleAlign="left"
                    buttons={[
                        {
                            label: 'Отмена',
                            variant: 'ghost',
                            color: 'primary',
                            onClick: handleCloseModal,
                        },
                        {
                            label: 'Удалить',
                            variant: 'primary',
                            color: 'primary',
                            onClick: handleConfirmDelete,
                        },
                    ]}
                />
            </>
        )
    },
)

export default function BlacklistList() {
    const router = useRouter()

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-md border',
                'border-app-divider bg-gray-main',
                'md:w-80',
                'lg:w-96',
            )}
        >
            <header
                className={`
                  flex items-center justify-start gap-3 rounded-t-md border-b
                  border-app-divider bg-gray-main px-6 py-4
                `}
            >
                <button
                    type="button"
                    onClick={() => router.push('/settings')}
                    className={`
                      flex items-center justify-center rounded-full
                      text-text-black transition-colors
                      hover:bg-(--color-accent-violet-ultra-light)
                    `}
                    aria-label="Вернуться к настройкам"
                >
                    <BackIcon className="mx-1 cursor-pointer" />
                </button>
                <h2
                    className={`
                      text-lg font-medium tracking-extra-tight text-text-black
                    `}
                >
                    Чёрный список
                </h2>
            </header>

            <BlacklistContactsList />
        </div>
    )
}
