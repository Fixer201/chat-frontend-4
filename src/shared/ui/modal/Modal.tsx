import Image from "next/image";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@shared/lib/utils";
import { Button } from "@shared/ui/button/Button";
import type { ButtonProps } from "@shared/ui/button/Button";

type ModalButtonConfig = {
  label: string;
  onClick?: () => void;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  type?: ButtonProps["type"];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  title: string;
  description?: string;
  descriptionColor?: "default" | "muted";
  titleAlign?: "left" | "center" | "right";
  blurBackground?: boolean;
  closeOnOverlayClick?: boolean;
  iconSrc?: string;
  iconAlt?: string;
  icon?: ReactNode;
  buttons?: ModalButtonConfig[];
  footer?: ReactNode;
}

const containerBase = "w-full max-w-md rounded-3xl bg-white shadow-[0_24px_80px_rgba(40,32,77,0.15)] p-6";
const overlayBase = "fixed inset-0 z-50 flex items-center justify-center px-4 bg-[rgba(40,32,77,0.35)]";

export default function Modal({
  open,
  onClose,
  title,
  description,
  descriptionColor = "default",
  titleAlign = "center",
  blurBackground = false,
  closeOnOverlayClick = true,
  iconSrc,
  iconAlt = "",
  icon,
  buttons = [],
  footer,
  className,
  children,
  ...props
}: ModalProps) {
  if (!open) {
    return null;
  }

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose?.();
    }
  };

  const secondaryTextClass = descriptionColor === "muted" ? "text-[#747474]" : "text-[#1C1C1E]";
  const hasActions = buttons.length > 0;
  const textAlignClass =
    titleAlign === "left" ? "text-left" : titleAlign === "right" ? "text-right" : "text-center";
  const itemsAlignClass =
    titleAlign === "left" ? "items-start" : titleAlign === "right" ? "items-end" : "items-center";
  const iconAlignClass =
    titleAlign === "left" ? "self-start" : titleAlign === "right" ? "self-end" : "self-center";

  return (
    <div
      className={cn(overlayBase, blurBackground && "backdrop-blur-sm")}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleOverlayClick}
    >
      <div
        className={cn(containerBase, className)}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        <div className="flex flex-col items-center gap-4">
          {(icon || iconSrc) && (
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full bg-(--color-accent-violet-white)",
                iconAlignClass
              )}
            >
              {icon ? (
                icon
              ) : (
                <Image src={iconSrc as string} alt={iconAlt} width={40} height={40} />
              )}
            </div>
          )}
          <div className={cn("flex w-full flex-col gap-3", itemsAlignClass, textAlignClass)}>
            <h2 className="m-0 text-lg font-medium text-[#1C1C1E]">{title}</h2>
            {(description || children) && (
              <div className={cn("flex w-full flex-col gap-3", itemsAlignClass, textAlignClass)}>
                {description && (
                  <p className={cn("m-0 text-base", secondaryTextClass, textAlignClass)}>{description}</p>
                )}
                {children}
              </div>
            )}
          </div>
        </div>
        {(hasActions || footer) && (
          <div className="mt-6 flex flex-col gap-3">
            {hasActions && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3">
                {buttons.map(({ label, onClick, variant, color, type, loading, disabled, className: buttonClass }, index) => {
                  const resolvedVariant =
                    variant ?? (index === buttons.length - 1 ? "primary" : "secondary");

                  return (
                    <Button
                      key={`${label}-${index}`}
                      variant={resolvedVariant}
                      color={color}
                      size="sm"
                      type={type ?? "button"}
                      onClick={onClick}
                      loading={loading}
                      disabled={disabled}
                      className={cn("w-full sm:w-auto min-w-[90px]", buttonClass)}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            )}
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export type { ModalButtonConfig };

// Примеры использования:
// <Modal open title="Удалить сообщения" description="Вы действительно хотите удалить сообщения?" descriptionColor="muted" buttons={[{ label: "Отмена", variant: "secondary" }, { label: "Удалить", variant: "primary" }]} />
// <Modal open title="Удалить фото профиля" description="Вы уверены, что хотите удалить текущее фото?" descriptionColor="muted" buttons={[{ label: "Отмена", variant: "secondary" }, { label: "Удалить", variant: "solid", color: "danger" }]} />
// <Modal open titleAlign="left" title="Заблокировать пользователя?" description="Пользователь не сможет писать вам личные сообщения" descriptionColor="muted" buttons={[{ label: "Заблокировать", variant: "ghost", color: "danger" }, { label: "Отмена", variant: "primary" }]} />
// <Modal open blurBackground iconSrc="/images/Check.svg" title="Анастасия Бортникова" description="теперь в списке ваших контактов" buttons={[{ label: "Понятно", variant: "primary" }]} />
