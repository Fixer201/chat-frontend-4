'use client'

import type { ReactNode } from 'react'

import SettingsMenu from '@modules/settings/components/SettingsMenu'

interface SettingsLayoutProps {
    children: ReactNode
}

export default function SettingsLayout({
    children,
}: SettingsLayoutProps) {
    return (
        <div className="flex h-screen max-w-full gap-6">
            <SettingsMenu />

            <section
                className={`
                  hidden h-11/12 flex-1
                  md:block
                `}
            >
                <div
                    className={`
                                          h-full w-full rounded-md border
                                          border-app-divider bg-gray-main
                                        `}
                >
                    {children}
                </div>
            </section>
        </div>
    )
}
