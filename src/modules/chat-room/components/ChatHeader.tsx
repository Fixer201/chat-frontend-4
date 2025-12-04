import Image from "next/image";
import {Phone, Search} from "lucide-react";


export default function ChatHeader() {
    return (
        <section className="border-b px-4 py-2 bg-primary-background rounded-t-md border-border">
            <div className="flex items-center justify-between">
                <div className="flex gap-4 flex-row items-center rounded-full">
                    {/* User Icon */}
                    <Image src="/next.svg" width="40" height="40" alt="user image"/>

                    <div className="flex flex-col">
                        {/* User Full Name */}
                        <h2 className="font-semibold">Chat Header</h2>
                        <p className="text-sm text-muted-foreground">Status placeholder</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Кнопки поиска, звонка и т.д. */}
                    <div className="flex gap-4 text-muted-foreground">
                        <Phone size="36" color="rgba(119, 105, 225, 1)"/>
                        <Search size="36" color="rgba(119, 105, 225, 1)"/>
                    </div>
                </div>
            </div>
        </section>
    );
}
