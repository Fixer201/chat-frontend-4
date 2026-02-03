'use client'

import { useState } from 'react'

import { Badge } from '@shared/ui/badge/Badge'
import { Button } from '@shared/ui/button/Button'
import { Avatar } from '@shared/ui/avatar/Avatar'
import Dropdown from '@shared/ui/dropdown/Dropdown'
import Modal from '@shared/ui/modal/Modal'
import { Spinner } from '@shared/ui/Spinner'

export default function TestComponentsPage() {
    const [deleteSelected, setDeleteSelected] =
        useState(false)
    const [isDeleteModalOpen, setDeleteModalOpen] =
        useState(false)
    const [isProfileModalOpen, setProfileModalOpen] =
        useState(false)
    const [isContactModalOpen, setContactModalOpen] =
        useState(false)
    const [isBlockModalOpen, setBlockModalOpen] =
        useState(false)
    const [menuSelection, setMenuSelection] = useState<
        string | null
    >(null)

    return (
        <>
            <div className="mx-auto max-w-xl space-y-8 py-8">
                <h1 className="mb-6 text-2xl font-bold">
                    Test Components
                </h1>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Button
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="primary" size="md">
                            Primary Solid
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                        >
                            Primary Outline
                        </Button>
                        <Button
                            variant="ghost"
                            color="danger"
                            size="sm"
                        >
                            Danger Ghost
                        </Button>
                    </div>
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Badge
                    </h2>
                    <Badge
                        variant="counter"
                        color="primary"
                        size="md"
                    >
                        5
                    </Badge>
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Avatar: Contact
                    </h2>
                    <Avatar
                        src="/images/chatHeader/userAvatar.svg"
                        name="Влад Ляшев"
                        mode="contact"
                        statusText="в сети"
                        isOnline
                    />
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Avatar: Select Contact
                    </h2>
                    <p className="mb-2 text-sm text-gray-500">
                        Нажмите на строку, чтобы переключить
                        состояние
                    </p>
                    <Avatar
                        src="/images/chatHeader/userAvatar.svg"
                        name="Влад Ляшев"
                        mode="select-contact"
                        statusText="был(а) только что"
                        isOnline={false}
                        selected={deleteSelected}
                        onClick={() =>
                            setDeleteSelected(
                                (prev) => !prev,
                            )
                        }
                        className="cursor-pointer"
                    />
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Avatar: Chat
                    </h2>
                    <Avatar
                        src="/images/chatHeader/userAvatar.svg"
                        name="Алексей Митрофанов"
                        mode="chat"
                        messagePreview="Мурка по утрам на балкон рвётся."
                        timestamp="ПН"
                        unreadCount={5}
                    />
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Dropdown
                    </h2>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <Button
                                variant="primary"
                                size="sm"
                            >
                                Открыть меню
                            </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Item
                                label="Ответить"
                                onSelect={() =>
                                    setMenuSelection(
                                        'Ответить',
                                    )
                                }
                            />
                            <Dropdown.Item
                                label="Переслать"
                                onSelect={() =>
                                    setMenuSelection(
                                        'Переслать',
                                    )
                                }
                            />
                            <Dropdown.Item
                                label="Скопировать"
                                onSelect={() =>
                                    setMenuSelection(
                                        'Скопировать',
                                    )
                                }
                            />
                            <Dropdown.Item
                                label="Выбрать"
                                onSelect={() =>
                                    setMenuSelection(
                                        'Выбрать',
                                    )
                                }
                            />
                            <Dropdown.Item
                                label="Удалить"
                                danger
                                onSelect={() =>
                                    setMenuSelection(
                                        'Удалить',
                                    )
                                }
                            />
                        </Dropdown.Content>
                    </Dropdown>
                    {menuSelection && (
                        <p className="mt-2 text-sm text-gray-500">
                            Выбрано: {menuSelection}
                        </p>
                    )}
                </div>

                <div>
                    <h2 className="mb-2 font-semibold">
                        Spinner
                    </h2>
                    <Spinner />
                </div>

                <div className="space-y-3">
                    <h2 className="font-semibold">
                        Modal Examples
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() =>
                                setDeleteModalOpen(true)
                            }
                        >
                            Удалить сообщения
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                                setProfileModalOpen(true)
                            }
                        >
                            Удалить фото профиля
                        </Button>
                        <Button
                            variant="ghost"
                            color="danger"
                            size="sm"
                            onClick={() =>
                                setBlockModalOpen(true)
                            }
                        >
                            Заблокировать пользователя
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                                setContactModalOpen(true)
                            }
                        >
                            Контакт добавлен
                        </Button>
                    </div>
                </div>
            </div>

            <Modal
                open={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                blurBackground
                title="Удалить сообщения"
                description="Вы действительно хотите удалить сообщения?"
                descriptionColor="muted"
                buttons={[
                    {
                        label: 'Отмена',
                        variant: 'secondary',
                        onClick: () =>
                            setDeleteModalOpen(false),
                    },
                    {
                        label: 'Удалить',
                        variant: 'primary',
                        onClick: () =>
                            setDeleteModalOpen(false),
                    },
                ]}
            />

            <Modal
                open={isProfileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                blurBackground
                title="Удалить фото профиля"
                description="Вы уверены, что хотите удалить текущее фото?"
                descriptionColor="muted"
                buttons={[
                    {
                        label: 'Отмена',
                        variant: 'secondary',
                        onClick: () =>
                            setProfileModalOpen(false),
                    },
                    {
                        label: 'Удалить',
                        variant: 'solid',
                        color: 'danger',
                        onClick: () =>
                            setProfileModalOpen(false),
                    },
                ]}
            />

            <Modal
                open={isBlockModalOpen}
                onClose={() => setBlockModalOpen(false)}
                blurBackground
                titleAlign="left"
                title="Заблокировать Алексея Смиронова?"
                description="Пользователь не сможет писать вам личные сообщения, звонить и приглашать в каналы"
                descriptionColor="muted"
                buttons={[
                    {
                        label: 'Заблокировать',
                        variant: 'ghost',
                        color: 'danger',
                        onClick: () =>
                            setBlockModalOpen(false),
                    },
                    {
                        label: 'Отмена',
                        variant: 'primary',
                        onClick: () =>
                            setBlockModalOpen(false),
                    },
                ]}
            />

            <Modal
                open={isContactModalOpen}
                onClose={() => setContactModalOpen(false)}
                blurBackground
                iconSrc="/images/Check.svg"
                title="Анастасия Бортникова"
                description="теперь в списке ваших контактов"
                buttons={[
                    {
                        label: 'Понятно',
                        variant: 'primary',
                        onClick: () =>
                            setContactModalOpen(false),
                    },
                ]}
            />
        </>
    )
}
