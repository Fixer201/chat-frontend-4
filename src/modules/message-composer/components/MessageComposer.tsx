import {Paperclip, Mic, Smile,} from "lucide-react";

export default function MessageComposer() {
    return <div
        className=" px-4 py-3 flex items-center justify-between h-[60px] rounded-b-md border-t border-border bg-primary-background">
        {/* Attachment Icon */}
        <Paperclip size="36" color="rgba(119, 105, 225, 1)"/>

        {/* Input field */}
        <div className="w-full flex items-center rounded-3xl px-4 py-2 mx-2 bg-white  justify-between ">
            {/* Input */}
            <input placeholder="Сообщение" className="w-full focus:outline-0 placeholder:text-muted-foreground" type="text"/>
            {/* Emoji Icon */}
            <Smile color="gray" />
        </div>

        {/* Voice record Icon(field empty) OR Send Message Icon(mobile only) */}
        <Mic size="36" color="rgba(119, 105, 225, 1)"/>
    </div>
}
