'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import ChevronDownIcon from '@public/icons/settings-sidebar/ChevronDown.svg'
import Input from '@shared/ui/input/Input'
import { Button } from '@shared/ui/button/Button'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'

const DAYS = Array.from(
    { length: 31 },
    (_, index) => index + 1,
)
const MONTHS = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
]
const YEARS = Array.from(
    { length: 81 },
    (_, index) => 2024 - index,
)

export default function EditProfileForm() {
    const router = useRouter()

    return (
        <div
            className={`flex h-full flex-col rounded-md bg-gray-main`}
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
                    Редактирование профиля
                </h2>
            </header>

            <CustomScrollbar className="flex-1">
                <div className="flex flex-1 flex-col gap-3 px-4 pt-4 pb-6">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`
                              flex h-50 w-50 items-center justify-center
                              rounded-full bg-accent-violet-light
                              text-accent-violet-primary
                            `}
                        >
                            <Image
                                src="/images/chatHeader/userAvatar.svg"
                                alt="Аватар пользователя"
                                width={200}
                                height={200}
                            />
                        </div>
                        <button
                            type="button"
                            className={`
                              cursor-pointer text-sm text-accent-violet-primary
                              transition-colors
                              hover:text-accent-violet-dark
                            `}
                        >
                            Выбрать фотографию
                        </button>
                    </div>

                    <form className="flex flex-1 flex-col gap-3">
                        <label
                            htmlFor="edit-profile-first-name"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span>Изменить имя</span>
                            <Input
                                id="edit-profile-first-name"
                                defaultValue="Сергей"
                                variant="simple"
                                textColor="black"
                            />
                        </label>

                        <label
                            htmlFor="edit-profile-last-name"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span>Изменить фамилию</span>
                            <Input
                                id="edit-profile-last-name"
                                defaultValue="Иванов"
                                variant="simple"
                                textColor="black"
                            />
                        </label>

                        <label
                            htmlFor="edit-profile-username"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span>Изменить никнейм</span>
                            <Input
                                id="edit-profile-username"
                                defaultValue="bond777"
                                variant="simple"
                                textColor="black"
                            />
                        </label>

                        <div
                            className={`
                          flex flex-col gap-1 text-sm text-text-gray
                        `}
                        >
                            <span>
                                Введите дату своего рождения
                            </span>
                            <div className="flex justify-between gap-1">
                                <div className="relative flex-none basis-[24%]">
                                    <select
                                        defaultValue={1}
                                        className={`
                                          h-12 w-full cursor-pointer
                                          appearance-none rounded-md border
                                          border-transparent bg-white px-6 pr-10
                                          text-center text-base text-text-gray
                                          transition-colors outline-none
                                          focus:border-accent-violet-primary
                                        `}
                                    >
                                        {DAYS.map((day) => (
                                            <option
                                                key={day}
                                                value={day}
                                            >
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon
                                        className={`
                                          pointer-events-none absolute top-1/2
                                          right-3 h-4 w-4 -translate-y-1/2
                                          text-text-gray
                                        `}
                                    />
                                </div>
                                <div className="relative flex-none basis-[42%]">
                                    <select
                                        defaultValue="Января"
                                        className={`
                                          h-12 w-full cursor-pointer
                                          appearance-none rounded-md border
                                          border-transparent bg-white px-6 pr-10
                                          text-center text-base text-text-gray
                                          transition-colors outline-none
                                          focus:border-accent-violet-primary
                                        `}
                                    >
                                        {MONTHS.map(
                                            (month) => (
                                                <option
                                                    key={
                                                        month
                                                    }
                                                    value={
                                                        month
                                                    }
                                                >
                                                    {month}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ChevronDownIcon
                                        className={`
                                          pointer-events-none absolute top-1/2
                                          right-3 h-4 w-4 -translate-y-1/2
                                          text-text-gray
                                        `}
                                    />
                                </div>
                                <div className="relative flex-none basis-[33%]">
                                    <select
                                        defaultValue={2000}
                                        className={`
                                          h-12 w-full cursor-pointer
                                          appearance-none rounded-md border
                                          border-transparent bg-white px-6 pr-10
                                          text-center text-base text-text-gray
                                          transition-colors outline-none
                                          focus:border-accent-violet-primary
                                        `}
                                    >
                                        {YEARS.map(
                                            (year) => (
                                                <option
                                                    key={
                                                        year
                                                    }
                                                    value={
                                                        year
                                                    }
                                                >
                                                    {year}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ChevronDownIcon
                                        className={`
                                          pointer-events-none absolute top-1/2
                                          right-3 h-4 w-4 -translate-y-1/2
                                          text-text-gray
                                        `}
                                    />
                                </div>
                            </div>
                        </div>

                        <label
                            htmlFor="edit-profile-about"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span>
                                Напишите пару слов о себе
                            </span>
                            <Input
                                id="edit-profile-about"
                                defaultValue="Иванов"
                                variant="simple"
                                textColor="black"
                            />
                        </label>

                        <div className="mt-auto pt-5">
                            <Button
                                type="submit"
                                size="lg"
                                className={`w-full text-base font-semibold`}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </form>
                </div>
            </CustomScrollbar>
        </div>
    )
}
