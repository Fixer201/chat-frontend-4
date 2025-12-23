import { cn } from "@shared/lib/utils";
import Image from "next/image";

interface MessageStatusIconProps {
    status: 'sent' | 'delivered' | 'read'
    selected?: boolean
}
export const MessageStatusIcon = ({ status, selected }: MessageStatusIconProps) => {
    const statusConfig = {
        sent: {
            src: "/images/messageStatus/sent.svg",
            alt: "Отправлено",
            size: 14,
        },
        delivered: {
            src: "/images/messageStatus/delivered.svg",
            alt: "Доставлено",
            size: 14,
        },
        read: {
            src: "/images/messageStatus/read.svg",
            alt: "Прочитано",
            size: 16,
        },
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
        <Image
            src={config.src}
            alt={config.alt}
            width={config.size}
            height={config.size}
            className={cn(
                selected
                    ? 'brightness-0 invert'
                    : 'opacity-70'
            )}
        />
    );
};