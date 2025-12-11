export interface ContactListDBType {
    uid: string,
    username: string,
    nickname: string,
    phone: string,
    first_name: string,
    last_name: string,
    patronymic: string,
    avatar: string,
    avatar_url: string,
    avatar_webp: string,
    avatar_webp_url: string,
    additional_information: string,
    birthday: Date,
    chat_id: number,
    is_online: boolean,
    was_online_at: Date
}