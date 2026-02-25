'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
} from 'react'
import Cookies from 'js-cookie'
import { useProfile } from '@shared/hooks/useProfile'
import type { Area } from 'react-easy-crop' // импортируем тип

import BackIcon from '@public/icons/settings-sidebar/Back.svg'
import Input from '@shared/ui/input/Input'
import { Button } from '@shared/ui/button/Button'
import { CustomScrollbar } from '@shared/ui/CustomScrollbar/CustomScrollbar'
import { DatePicker } from '@shared/ui/datePicker/DatePicker'
import { AvatarCropper } from '@shared/ui/avatarCropper/AvatarCropper'

const DEFAULT_BIRTHDAY = {
    day: null as number | null,
    month: null as number | null,
    year: null as number | null,
}

const DEFAULT_AVATAR_SRC =
    '/images/chatHeader/userAvatar.svg'

export default function EditProfileForm() {
    const router = useRouter()
    const { profile, loading, error, refetch } =
        useProfile()

    const [isCropperOpen, setIsCropperOpen] =
        useState(false)
    const [selectedFile, setSelectedFile] =
        useState<File | null>(null)
    const [croppedBlob, setCroppedBlob] =
        useState<Blob | null>(null)
    const [cropParams, setCropParams] = useState<{
        crop: { x: number; y: number }
        zoom: number
        croppedAreaPixels: Area | null
    } | null>(null)

    const [isSaving, setIsSaving] = useState(false)
    const [submitError, setSubmitError] = useState<
        string | null
    >(null)
    const [savedRecently, setSavedRecently] =
        useState(false)
    const [formDraft, setFormDraft] = useState<{
        first_name?: string
        last_name?: string
        nickname?: string
        about?: string
        birthday?: {
            day: number | null
            month: number | null
            year: number | null
        }
    }>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    const profileAvatarSrc = useMemo(() => {
        if (!profile) return null
        const directUrl =
            profile.avatar_url || profile.avatar_webp_url
        if (directUrl) return directUrl as string
        const rawAvatar = profile.avatar as
            | string
            | undefined
        if (rawAvatar) {
            if (
                rawAvatar.startsWith('http') ||
                rawAvatar.startsWith('/')
            ) {
                return rawAvatar
            }
            return `/${rawAvatar}`
        }
        return null
    }, [profile])

    const avatarPreview = useMemo(() => {
        if (croppedBlob) {
            return URL.createObjectURL(croppedBlob)
        }
        return profileAvatarSrc || DEFAULT_AVATAR_SRC
    }, [croppedBlob, profileAvatarSrc])

    useEffect(() => {
        if (!croppedBlob) return undefined
        const url = avatarPreview
        return () => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url)
            }
        }
    }, [avatarPreview, croppedBlob])

    const profileBirthdayValue = useMemo(() => {
        if (!profile?.birthday) return null
        const incoming = profile.birthday as unknown
        const asNumber = Number(incoming)
        const date =
            Number.isFinite(asNumber) && asNumber > 0
                ? new Date(
                      asNumber > 1e12
                          ? asNumber
                          : asNumber * 1000,
                  )
                : new Date(String(incoming))
        if (Number.isNaN(date.getTime())) return null
        return {
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        }
    }, [profile?.birthday])

    const birthdayValue =
        formDraft.birthday ??
        profileBirthdayValue ??
        DEFAULT_BIRTHDAY
    const firstNameValue =
        formDraft.first_name ?? profile?.first_name ?? ''
    const lastNameValue =
        formDraft.last_name ?? profile?.last_name ?? ''
    const nicknameValue =
        formDraft.nickname ?? profile?.nickname ?? ''
    const aboutValue =
        formDraft.about ??
        profile?.additional_information ??
        ''

    const handleOpenFileDialog = () => {
        fileInputRef.current?.click()
    }

    useEffect(() => {
        if (profile) {
            console.log('Edit profile data:', profile)
        }
    }, [profile])

    const handleFileInputChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0]
        if (!file) return
        setSelectedFile(file)
        setIsCropperOpen(true)
        event.target.value = ''
    }

    const handleCropperClose = () => {
        setIsCropperOpen(false)
        setSelectedFile(null)
        // Не сбрасываем cropParams, чтобы при повторном открытии того же файла параметры сохранились
    }

    const handleCropperConfirm = (
        blob: Blob,
        params?: {
            crop: { x: number; y: number }
            zoom: number
            croppedAreaPixels: Area | null
        },
    ) => {
        setCroppedBlob(blob)
        if (params) {
            setCropParams(params)
        }
        setIsCropperOpen(false)
    }

    const formatBirthday = () => {
        const source =
            formDraft.birthday ?? profileBirthdayValue
        if (source?.year && source?.month && source?.day) {
            const date = new Date(
                source.year,
                source.month - 1,
                source.day,
            )
            const tsSeconds = Math.floor(
                date.getTime() / 1000,
            )
            return Number.isFinite(tsSeconds)
                ? tsSeconds
                : undefined
        }
        return undefined
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()
        setSubmitError(null)
        setIsSaving(true)

        try {
            const accessToken = Cookies.get('access_token')
            if (!accessToken) {
                setSubmitError('Нет токена авторизации')
                return
            }

            const commonFields = {
                nickname: nicknameValue,
                first_name: firstNameValue,
                last_name: lastNameValue,
                additional_information: aboutValue,
            }

            const birthdayIso = formatBirthday()
            if (birthdayIso) {
                ;(
                    commonFields as Record<string, unknown>
                ).birthday = birthdayIso
            }

            if (croppedBlob) {
                const formData = new FormData()
                const file = new File(
                    [croppedBlob],
                    selectedFile?.name || 'avatar.png',
                    {
                        type:
                            croppedBlob.type ||
                            selectedFile?.type ||
                            'image/png',
                    },
                )
                formData.append('file', file)

                const avatarResponse = await fetch(
                    '/api/auth/profile/avatar',
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: formData,
                    },
                )

                const avatarText =
                    await avatarResponse.text()
                let avatarData: Record<string, unknown> = {}
                try {
                    avatarData = avatarText
                        ? JSON.parse(avatarText)
                        : {}
                } catch (e) {
                    console.warn(
                        'Avatar upload: response is not JSON',
                        avatarText,
                        e,
                    )
                }

                if (!avatarResponse.ok) {
                    const message =
                        (avatarData?.detail as string) ||
                        (avatarData?.error as string) ||
                        `Ошибка загрузки аватара ${avatarResponse.status}`
                    setSubmitError(message)
                    setIsSaving(false)
                    return
                }
            }

            const payload: Record<string, unknown> = {
                ...commonFields,
            }

            const response = await fetch(
                '/api/auth/profile',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(payload),
                },
            )

            const rawText = await response.text()
            let data: Record<string, unknown> = {}
            try {
                data = rawText ? JSON.parse(rawText) : {}
            } catch (e) {
                console.warn(
                    'Profile save: response is not JSON',
                    rawText,
                    e,
                )
            }

            if (!response.ok) {
                const message =
                    (data?.detail as string) ||
                    (data?.error as string) ||
                    `Ошибка ${response.status}`
                setSubmitError(message)
                return
            }

            setSavedRecently(true)
            setTimeout(() => setSavedRecently(false), 2000)
            await refetch()
        } catch (err) {
            console.error('Save profile error:', err)
            setSubmitError('Ошибка сети при сохранении')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex h-full flex-col rounded-md bg-gray-main">
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
                              overflow-hidden rounded-full
                              bg-accent-violet-light text-accent-violet-primary
                            `}
                        >
                            <Image
                                src={avatarPreview}
                                alt="Аватар пользователя"
                                width={200}
                                height={200}
                                className="h-full w-full object-cover"
                                unoptimized
                            />
                        </div>
                        <button
                            type="button"
                            className={`
                              cursor-pointer text-sm text-accent-violet-primary
                              transition-colors
                              hover:text-accent-violet-dark
                            `}
                            onClick={handleOpenFileDialog}
                            aria-label="Выбрать фотографию"
                        >
                            Выбрать фотографию
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInputChange}
                        />
                    </div>

                    <form
                        className="flex flex-1 flex-col gap-3"
                        onSubmit={handleSubmit}
                    >
                        {/* поля формы (без изменений) */}
                        <label
                            htmlFor="edit-profile-first-name"
                            className={`
                              flex flex-col gap-1 text-sm text-text-gray
                            `}
                        >
                            <span>Изменить имя</span>
                            <Input
                                id="edit-profile-first-name"
                                value={firstNameValue}
                                onChange={(e) =>
                                    setFormDraft(
                                        (prev) => ({
                                            ...prev,
                                            first_name:
                                                e.target
                                                    .value,
                                        }),
                                    )
                                }
                                variant="simple"
                                textColor="black"
                                disabled={
                                    loading || isSaving
                                }
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
                                value={lastNameValue}
                                onChange={(e) =>
                                    setFormDraft(
                                        (prev) => ({
                                            ...prev,
                                            last_name:
                                                e.target
                                                    .value,
                                        }),
                                    )
                                }
                                variant="simple"
                                textColor="black"
                                disabled={
                                    loading || isSaving
                                }
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
                                value={nicknameValue}
                                onChange={(e) =>
                                    setFormDraft(
                                        (prev) => ({
                                            ...prev,
                                            nickname:
                                                e.target
                                                    .value,
                                        }),
                                    )
                                }
                                variant="simple"
                                textColor="black"
                                disabled={
                                    loading || isSaving
                                }
                            />
                        </label>

                        <DatePicker
                            label="Введите дату своего рождения"
                            value={birthdayValue}
                            onChange={(val) =>
                                setFormDraft((prev) => ({
                                    ...prev,
                                    birthday: val,
                                }))
                            }
                            maxYear={2025}
                            name="birthDate"
                        />

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
                                value={aboutValue}
                                onChange={(e) =>
                                    setFormDraft(
                                        (prev) => ({
                                            ...prev,
                                            about: e.target
                                                .value,
                                        }),
                                    )
                                }
                                variant="simple"
                                textColor="black"
                                disabled={
                                    loading || isSaving
                                }
                            />
                        </label>

                        <div className="mt-auto pt-5">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full text-base font-semibold"
                                disabled={
                                    loading || isSaving
                                }
                            >
                                {isSaving
                                    ? 'Сохранение...'
                                    : loading
                                      ? 'Загрузка...'
                                      : savedRecently
                                        ? 'Сохранено'
                                        : 'Сохранить'}
                            </Button>
                            {error && (
                                <p
                                    className={`
                                      mt-2 text-center text-sm text-system-red
                                    `}
                                >
                                    {error}
                                </p>
                            )}
                            {submitError && (
                                <p
                                    className={`
                                      mt-2 text-center text-sm text-system-red
                                    `}
                                >
                                    {submitError}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </CustomScrollbar>

            <AvatarCropper
                isOpen={isCropperOpen}
                imageFile={selectedFile ?? undefined}
                onClose={handleCropperClose}
                onFileChange={(file) =>
                    setSelectedFile(file)
                }
                onConfirm={handleCropperConfirm}
                initialCrop={cropParams?.crop}
                initialZoom={cropParams?.zoom}
                initialCroppedAreaPixels={
                    cropParams?.croppedAreaPixels
                }
            />
        </div>
    )
}
