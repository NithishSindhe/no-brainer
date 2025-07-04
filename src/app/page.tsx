"use client"
import type React from "react"

import { useEffect, useRef } from "react"
import ChatMessage from "~/components/ui/chatMessage"
import { Search, Paperclip, ChevronDown, Sparkles, Compass, Code, GraduationCap, SendHorizontal, StopCircle,LogInIcon } from "lucide-react"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs';


import { useState } from "react"
import {
  Menu,
  Sun,
  Moon,
  User,
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

const defaultMessage = {
  id:"default",
  content:null,
  role: "assistant" as const 
}

export default function ChatInterface() {
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const streamingMessageRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chats[0]?.id || null);
  const { user, isSignedIn } = useUser();

  const [question, setQuestion] = useState<string>("")
  const [messages, setMessages] = useState<Array<Message>>([])
  const [message, setMessage] = useState<Message>(defaultMessage)
  const [streaming, setStreaming] = useState(false)

  const actionButtons = [
    { icon: Sparkles, label: "Create", color: "text-purple-400" },
    { icon: Compass, label: "Explore", color: "text-blue-400" },
    { icon: Code, label: "Code", color: "text-green-400" },
    { icon: GraduationCap, label: "Learn", color: "text-orange-400" },
  ]
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "How does AI work?",
    "Are black holes real?",
    'How many Rs are in the word "strawberry"?',
    "What is the meaning of life?",
  ]

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

  useEffect(() => {
    //scrollToBottom()
    //update the selectedchat's messages 
    stickToTop()
    setChats((prev) =>
      prev.map((prev) => prev.id === selectedChatId ? { ...prev, messages: [...messages] } : prev).sort((a,b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    );
  }, [messages,selectedChatId])

  useEffect(() => {
    adjustHeight()
  },[question])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setModelModalOpen(false);
      }
    }

    if (modelModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modelModalOpen]);
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

  const askGemini = async () => {
    const selectedChat = chats.find(chat => chat.id === selectedChatId)
    const res = await fetch('/api/ask-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          question,
          history: selectedChat?.messages ?? []
        },
        model: 'gemini-2.5-flash',
      }),
    })

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return

    const id = (Date.now() + 1).toString()
    let fullMessage = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      fullMessage = fullMessage+chunk
      setMessage(prev => { 
        if(prev.content != null) return {id:id, content:prev.content+chunk, role:"assistant"} 
        return {id:id, content:chunk, role:"assistant"} 
      })
    }

    const aiMessage = {
      id: id,
      content: fullMessage,
      role: "assistant" as const,
    }
    setMessages((prev) => [...prev, aiMessage])
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if(streaming) return 
    e?.preventDefault()
    //scrollToBottom()
    stickToTop()
    if (!question.trim()) return
    const userMessage = {
      id: Date.now().toString(),
      content: question.trim(),
      role: "user" as const,
    }
    // Add user message
    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setStreaming(true)
    await askGemini()
    setStreaming(false)
    setMessage(defaultMessage)
    // if the message was in a new window then create a new chat and bind the current messages to that chat
    // how do you know if the message was in a new window
    if(messages.length === 0) {
      //this is new chat action, create a new chat with a title
      const id = (Date.now() + 2).toString()
      const newChat:Chat = {id:id,title:id,messages:[...messages, userMessage],createTime:new Date().toISOString()}
      setChats(prev => [...prev, newChat].sort( (a,b)=>new Date(b.createTime).getTime() - new Date(a.createTime).getTime()));
      setSelectedChatId(id)
    }
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  // }
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
    const id = Date.now().toString();
    const newChat: Chat = {
      id,
      title: null,
      messages: [],
      createTime:new Date().toISOString()
    };
    //setChats((prev) => [...prev, newChat]);
    setChats(prev => [...prev, newChat].sort( (a,b)=>new Date(b.createTime).getTime() - new Date(a.createTime).getTime()));
    setSelectedChatId(id);
    setMessages([]);
    setQuestion("");
    setMessage(defaultMessage);
    setStreaming(false);
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
                      setMessages(element.messages)
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
        {/* Chat Area */}
        <div className="w-full flex flex-1 overflow-y-auto p-4 pb-24 space-y-4 justify-center">
          <div className="max-w-4xl flex flex-col flex-1 overflow-y-auto p-4 space-y-4 chat-container">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="max-w-2xl w-full text-center space-y-8">
                  {/* Welcome Message */}
                  <h1 className="text-3xl font-semibold text-white mb-8">How can I help you, {isSignedIn?user?.firstName:"Stranger"}?</h1>
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-6 mb-12">
                    {actionButtons.map((action, index) => (
                      <button
                        key={index}
                        className="flex flex-col items-center gap-2 p-4 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                        <span className="text-gray-300 text-sm">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Sample Questions */}
                  <div className="space-y-3">
                    {sampleQuestions.map((qstion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(qstion)}
                        className="block w-full text-left p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {qstion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Chat messages
              <div className="flex-1 p-4 space-y-4">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} msg={msg}/>
                ))}
                {streaming?<ChatMessage key={message.id} msg={message} ref={streamingMessageRef}></ChatMessage>:<></>}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        <div className="absolute rounded-t-lg bottom-0 left-0 right-0 mx-auto max-w-4xl z-10 border-none backdrop-blur-sm bg-black/10 p-4 pb-0">
          {/* Message Input */}
          <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/10 rounded-t-lg">
            <form onSubmit={handleSendMessage}>
              <div className="relative">
                <textarea
                  ref={messageInputRef}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleEnter}
                  placeholder="Type your message here...(K)"
                  className="
                    resize-none 
                    rounded-t-lg
                    w-full 
                    min-h-[40px]
                    max-h-[200px]
                    rounded-md 
                    border-none 
                    bg-transparent
                    bg-black/10
                    px-3 
                    py-2 
                    text-sm 
                    text-white 
                    placeholder:text-gray-400 
                    focus-visible:outline-none 
                    disabled:cursor-not-allowed 
                    disabled:opacity-50 
                    transition-all 
                    duration-600 
                    ease-in-out
                    overflow-auto
                    leading-5
                  "
                  rows={1}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div ref={dropdownRef} className="relative flex items-center gap-2">
                  {/* Dropdown Toggle */}
                  <button
                    type="button"
                    onClick={() => setModelModalOpen(!modelModalOpen)}
                    className="flex px-2 py-1 items-center gap-1 text-sm text-gray-400 hover:text-gray-300 cursor-pointer"
                  >
                    Gemini 2.5 Flash
                    <ChevronDown
                      className={`pt-0 pb-1 w-3 h-3 transform transition-transform ${
                        modelModalOpen ? "" : "rotate-180"
                      }`}
                    />
                  </button>
                  {/* model search dropdown menu */}
                  {modelModalOpen && (
                    <div
                      className="absolute bottom-full mb-2 left-0 z-50 w-56 p-3 rounded-lg backdrop-blur-md bg-gray-800/70 border border-gray-700 shadow-lg"
                    >
                      <p className="text-sm text-gray-300">More models coming soon</p>
                    </div>
                  )}
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <Search className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {/* <div className="flex items-center gap-2"> */}
                {/*     <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 cursor-pointer" type="button"> */}
                {/*         Gemini 2.5 Flash */}
                {/*         <ChevronDown className="w-3 h-3" /> */}
                {/*     </button> */}
                {/*     <button className="p-1 hover:bg-gray-700 rounded"> */}
                {/*         <Search className="w-4 h-4 text-gray-400" type="button"/> */}
                {/*     </button> */}
                {/* </div> */}
                <div className="flex items-center gap-2"> 
                    <button className="p-1 hover:bg-gray-600 rounded" type="button">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-600 rounded" disabled={streaming} type="submit">
                    {streaming?<StopCircle className="w-4 h-4 text-gray-500" />:<SendHorizontal className="w-4 h-4 text-gray-400"/>}
                    </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

