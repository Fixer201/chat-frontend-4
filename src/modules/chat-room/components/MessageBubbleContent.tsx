import {
    Message,
    RepliedMessage as RepliedMessageType,
} from '@shared/types/message'
import ForwardedMessage from './ForwardedMessage'
import MessageFileAttachment from './MessageFileAttachment'
import RepliedMessage from './RepliedMessage'
import { highlightText } from '@shared/lib/highlightText'
import {
    ReadCheckmark,
    ReadStatus,
    formatTime,
    getISOTime,
} from './messageUtils'

interface MessageBubbleContentProps {
    readonly message: Message
    readonly readStatus: ReadStatus | null
    readonly searchQuery: string
    readonly messagesMap?: Map<string, Message>
    readonly onNavigateToMessage?: (uid: string) => void
}

export default function MessageBubbleContent({
    message,
    readStatus,
    searchQuery,
    messagesMap,
    onNavigateToMessage,
}: MessageBubbleContentProps) {
    return (
        <>
            {/* Цитаты: ответы на другие сообщения.
                Карточка с фиолетовой полоской слева, имя автора + текст оригинала. */}
            {message.repliedMessages &&
            message.repliedMessages.length > 0
                ? message.repliedMessages.map(
                      (replied, idx) => {
                          // Обогащаем replied-сообщение данными из оригинала,
                          // если files_list/content пустые (сервер может не присылать).
                          // O(1) поиск через messagesMap вместо O(n) .find()
                          let enriched: RepliedMessageType =
                              replied
                          if (messagesMap && replied.uid) {
                              const original =
                                  messagesMap.get(
                                      replied.uid,
                                  )
                              if (original) {
                                  enriched = {
                                      ...replied,
                                      content:
                                          replied.content ||
                                          original.content,
                                      files_list: replied
                                          .files_list
                                          ?.length
                                          ? replied.files_list
                                          : original.files,
                                  }
                              }
                          }
                          return (
                              <RepliedMessage
                                  key={
                                      replied.uid ??
                                      `reply-${idx}`
                                  }
                                  repliedMessage={enriched}
                                  onNavigateToOriginal={
                                      onNavigateToMessage
                                  }
                              />
                          )
                      },
                  )
                : null}

            {message.forwardedMessages &&
            message.forwardedMessages.length > 0 ? (
                <>
                    {message.forwardedMessages.map(
                        (forwarded, idx) => (
                            <ForwardedMessage
                                key={
                                    forwarded.uid ??
                                    `fwd-${idx}`
                                }
                                forwardedMessage={forwarded}
                            />
                        ),
                    )}
                    {/* Файлы и текст пересланного сообщения */}
                    {message.forwardedMessages.map(
                        (forwarded, idx) => (
                            <div
                                key={`fwd-body-${forwarded.uid ?? idx}`}
                            >
                                {forwarded.files_list &&
                                forwarded.files_list
                                    .length > 0 ? (
                                    <div className="flex flex-col">
                                        {forwarded.files_list.map(
                                            (
                                                file,
                                                fileIdx,
                                            ) => (
                                                <MessageFileAttachment
                                                    key={`fwd-file-${fileIdx}`}
                                                    file={
                                                        file
                                                    }
                                                    isSending={
                                                        false
                                                    }
                                                    onCancel={
                                                        undefined
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                ) : null}
                                {forwarded.content ? (
                                    <div
                                        className={`
                                          cursor-text text-base font-normal
                                          break-all whitespace-pre-wrap
                                        `}
                                    >
                                        {forwarded.content}
                                    </div>
                                ) : null}
                            </div>
                        ),
                    )}
                </>
            ) : null}

            {(() => {
                const hasFiles =
                    message.files &&
                    message.files.length > 0
                const hasTextContent =
                    !!message.content?.trim()

                // Элемент «время + статус» — переиспользуется в файле или ниже
                const timeElement = message.created_at ? (
                    <div
                        className={`
                          flex shrink-0 items-center gap-1 text-sm
                          whitespace-nowrap text-text-gray
                        `}
                    >
                        <time
                            dateTime={getISOTime(
                                message.created_at,
                            )}
                        >
                            {formatTime(message.created_at)}
                        </time>
                        <ReadCheckmark
                            status={readStatus}
                        />
                    </div>
                ) : null

                return (
                    <>
                        {hasFiles ? (
                            <div className="flex flex-col">
                                {message.files!.map(
                                    (file, idx) => {
                                        return (
                                            <MessageFileAttachment
                                                key={`file-${idx}`}
                                                file={file}
                                                isSending={
                                                    message.status ===
                                                    'sending'
                                                }
                                                onCancel={
                                                    undefined
                                                }
                                                timeSlot={
                                                    // Время встраивается в ПОСЛЕДНИЙ файл,
                                                    // только если нет текстовой подписи
                                                    !hasTextContent &&
                                                    idx ===
                                                        message
                                                            .files!
                                                            .length -
                                                            1
                                                        ? timeElement
                                                        : undefined
                                                }
                                            />
                                        )
                                    },
                                )}
                            </div>
                        ) : null}

                        {/* Текст + время: показываем только если есть текст,
                            или если нет файлов (обычное текстовое сообщение) */}
                        {(hasTextContent || !hasFiles) && (
                            <div
                                className={`
                                  flex items-end justify-between gap-2
                                `}
                            >
                                {message.content?.trim() ? (
                                    <div
                                        className={`
                                          cursor-text text-base font-normal
                                          break-all whitespace-pre-wrap
                                        `}
                                    >
                                        {searchQuery ? (
                                            <>
                                                {highlightText(
                                                    message.content,
                                                    searchQuery,
                                                ).map(
                                                    (
                                                        segment,
                                                        i,
                                                    ) => (
                                                        <span
                                                            key={
                                                                i
                                                            }
                                                            className={
                                                                segment.isMatch
                                                                    ? `
                                                                      rounded-sm
                                                                      bg-system-blue/20
                                                                      font-semibold
                                                                      text-system-blue
                                                                    `
                                                                    : ''
                                                            }
                                                        >
                                                            {
                                                                segment.text
                                                            }
                                                        </span>
                                                    ),
                                                )}
                                            </>
                                        ) : (
                                            message.content
                                        )}
                                        {message.isEdited && (
                                            <span
                                                className={`
                                                  ml-1 text-xs text-text-gray
                                                `}
                                            >
                                                (изменено)
                                            </span>
                                        )}
                                    </div>
                                ) : null}
                                {message.created_at && (
                                    <div
                                        className={`
                                          flex shrink-0 items-center gap-1
                                          text-sm whitespace-nowrap
                                          text-text-gray
                                        `}
                                    >
                                        {/* a11y: <time> с dateTime — скринридер озвучит полную дату */}
                                        <time
                                            dateTime={getISOTime(
                                                message.created_at,
                                            )}
                                        >
                                            {formatTime(
                                                message.created_at,
                                            )}
                                        </time>
                                        <ReadCheckmark
                                            status={
                                                readStatus
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )
            })()}
        </>
    )
}
