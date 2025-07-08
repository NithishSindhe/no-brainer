"use client";
import type React from "react"

import { useEffect, useRef } from "react"
import { LogInIcon } from "lucide-react"
import { SignInButton, SignedIn, SignedOut, UserButton, } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs';
import Thread from "~/components/ui/thread";


import { useState } from "react"
import {
  Menu,
  Sun,
  Moon,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import ChatSearchBar from "~/components/ui/chatSearchBar"

import type { Message } from "~/components/ui/chatMessage"

type Chat = {
  id: string
  title: string|null
  messages: Message[]
  createTime: string // For ISO 8601 string, e.g., "2023-10-27T10:00:00.000Z"
}

export default function ChatInterface() {
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);
  const { user, isSignedIn } = useUser();

  const [question, setQuestion] = useState<string>("")

  useEffect(() => {createNewChat()},[])
  
  // useEffect(() => {
  //   if (streaming) {
  //     const interval = setInterval(() => {
  //       streamingMessageRef.current?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start", // aligns the top of element to top of container
  //       });
  //     }, 100); // every 100ms for smooth tracking
  //     return () => clearInterval(interval);
  //   }
  // }, [streaming]);

  const onNewMessage = (chatId:string, newMessages:Message[]) => {
    setChats((prev) =>
      prev.map((prev) => prev.id === chatId ? { ...prev, messages: [...newMessages] } : prev).sort((a,b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    );
  }

  useEffect(() => {
    adjustHeight()
  },[question])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is not already typing in an input field
      const activeElement = document.activeElement
      const isTypingInInput = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
      if(event.key.toLowerCase() === "k") {
        // Only focus if not already typing and message input exists and is visible
        if (!isTypingInInput && messageInputRef.current) {
          event.preventDefault()
          messageInputRef.current.focus()
        }
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        messageInputRef?.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const stickToTop = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth",block:"end" })
  }

  const adjustHeight = () => {
    const textarea = messageInputRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200)
      textarea.style.height = `${newHeight}px`
    }
  }

  const createNewChat = () => {
    const cantCreate = chats.some(chat => {
      if(chat.messages.length === 0) {
        setSelectedChatId(chat.id)
        return true
      }
    }) 
    if(cantCreate) return
    const id = Date.now().toString();
    const newChat: Chat = {
      id,
      title: "New Chat",
      messages: [],
      createTime:new Date().toISOString()
    };
    setChats(prev => [...prev, newChat].sort( (a,b)=>new Date(b.createTime).getTime() - new Date(a.createTime).getTime()));
    setSelectedChatId(id);
    setQuestion("");
  };

  return (
    <div className={`flex h-screen ${isDark ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"} 
        transition-all duration-300 ease-in-out
        text-nowrap
        bg-gray-900 border-r border-gray-700 flex flex-col overflow-hidden`} 
      >
        {/* Sidebar Header */}
        <div className="p-4 ">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-800 rounded">
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <div className="text-white font-semibold">No Brainer</div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-800 rounded">
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-1 hover:bg-gray-800 rounded">
                {isDark ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <Button onClick={createNewChat} className="w-full bg-purple-600 hover:bg-purple-700 text-gray-200 !font-bold ">
            New Chat
          </Button>
        </div>

        {/* Search */}
        <ChatSearchBar></ChatSearchBar>
        {/* Spacer */}
        <div className="overflow overflow-auto flex-1">
        <div className="p-4">
          {[...chats].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
            .map(chat => {
            if(chat.title != null){
              return <button
                key={chat.id}
                onClick={() => {
                  setSelectedChatId(chat.id)
                  chats.some(element => {
                    if(element.id === chat.id) {
                      return true
                    }
                  })
                }
                }
                className={`cursor cursor-pointer block w-full text-left text-sm px-2 py-2 rounded-lg ${
                  chat.id === selectedChatId ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
              >
                <div className="truncate">
                  <span className="overflow-hidden text-ellipsis text-sm ">{chat.title}</span>
                </div>
              </button>
            }
          })}
        </div>
        </div>
        {/* User Profile */}
        <div className="p-4 flex items-center justify-center">
          <div className="w-full flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-200 text-center hover:bg-gray-700  font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer w-full justify-center">
                <LogInIcon size="1.25em"/> Login
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                <UserButton />
                <div className="text-white text-sm font-medium">
                  {user?.fullName}
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="relative flex-1 bg-gray-800 flex flex-col">
        {/* Header */}
        {!sidebarOpen && (
          <div className="p-4 border-none border-gray-700 flex items-center justify-between fixed top-0 left-0 right-0 z-50 bg-transparent">
              <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-700 rounded">
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-700 rounded">
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-1 hover:bg-gray-700 rounded">
                {isDark ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>
        )}
        {chats.map(chat => {
          if(chat.id === selectedChatId) return <Thread key={chat.id} chatId={chat.id} onNewMessage={onNewMessage} parentMessages={chat.messages} />
          return 
        })
        }
      </div>
    </div>
  )
}

