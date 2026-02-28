import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { Contact } from '@shared/types/contact'

/**
 * Хук для построения индексированной Map контактов с O(1) поиском по uid.
 *
 * Проблема:
 *   В компонентах ForwardMessageModal, ChatsList, ChatHeader для каждого чата
 *   выполнялся `contactsList.find(c => c.userUid === uid || c.uid === uid)`.
 *   При N чатов и M контактов это давало O(N × M) операций на каждый рендер.
 *
 * Решение:
 *   Один раз строим Map<string, Contact>, индексируя каждый контакт по двум ключам:
 *   - `userUid` — основной идентификатор пользователя в системе
 *   - `uid` — дополнительный идентификатор контакта (может совпадать с userUid)
 *
 *   Это превращает поиск контакта из O(M) в O(1) для каждого чата.
 *
 * Мемоизация:
 *   Map пересоздаётся только при изменении `contactsList` в Redux store.
 *   При отсутствии изменений возвращается та же ссылка, что предотвращает
 *   каскадные пересчёты в зависимых useMemo/useCallback потребителей.
 *
 * Двойная индексация (userUid + uid):
 *   Бэкенд в разных контекстах ссылается на контакт через разные поля —
 *   chat.chat.uid может содержать как userUid, так и uid контакта.
 *   Дублирующий ключ добавляется только если uid !== userUid,
 *   чтобы не перетирать запись при совпадении.
 *
 * @returns Map<string, Contact> — индекс контактов по userUid и uid
 */
export function useContactsMap(): Map<string, Contact> {
    const contactsList = useSelector(
        (state: RootState) => state.contacts.list,
    )

    return useMemo(() => {
        const map = new Map<string, Contact>()

        for (const contact of contactsList) {
            // Индексируем по основному идентификатору пользователя
            if (contact.userUid)
                map.set(contact.userUid, contact)

            // Дополнительный ключ — только если отличается от userUid,
            // чтобы избежать бессмысленной перезаписи той же записи
            if (
                contact.uid &&
                contact.uid !== contact.userUid
            )
                map.set(contact.uid, contact)
        }

        return map
    }, [contactsList])
}
