'use client'

import { useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"

const isMac = navigator.userAgent.includes("Mac")
export default function ChatSearchBar() {
  const chatSearchRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // const handleKeyDown = (event: KeyboardEvent) => {
    //   const isCmdOrCtrlK = event.key.toLowerCase() === "k" && ((isMac && event.metaKey) || (!isMac && event.ctrlKey))
    //   if (isCmdOrCtrlK) {
    //     event.preventDefault()
    //     chatSearchRef.current?.focus()
    //   }
    // }
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTypingInInput = activeElement && (
        activeElement.tagName === "INPUT" || 
        activeElement.tagName === "TEXTAREA" ||
        (activeElement instanceof HTMLElement && activeElement.isContentEditable)
      );

      if (event.key.toLowerCase() === "/") {
        // Prevent default browser behavior ONLY if not typing in another input.
        // If you're in another input, you likely want '/' to be typed as a character.
        if (!isTypingInInput) {
          event.preventDefault();
          if (chatSearchRef.current) {
            chatSearchRef.current.focus();
          }
        }
      }
    };
    const handleEscape = (event:KeyboardEvent) => {
      if(event.key === "Escape"){
        chatSearchRef?.current?.blur()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keydown", handleEscape)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keydown", handleEscape )
    }
  }, [])

  return (
    <div className="border-b border-gray-700 p-3">
      <div className="flex items-center ">
        <Search
          className="
            w-4 h-4
            translate-y-[-1px]
            text-gray-400
            pointer-events-none
          "
        />
          <Input
            ref={chatSearchRef}
            placeholder="Search chats (cmd+k)"
            className="
              bg-[rgb(30,41,57)]
              text-nowrap
              overflow-hidden
              border-none
              text-white placeholder-gray-400
              w-full
            "
          />
      </div>
    </div>
  )
}
