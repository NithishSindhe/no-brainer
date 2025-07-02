"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import ChatMessage from "./chatMessage"
import { Search, Paperclip, ChevronDown, Sparkles, Compass, Code, GraduationCap, SendHorizontal } from "lucide-react"

import { askGemini } from "~/lib/actions"

import type { Message } from "./chatMessage"

const MessageInput:React.FC = () => {
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<Message>>([])

  const actionButtons = [
    { icon: Sparkles, label: "Create", color: "text-purple-400" },
    { icon: Compass, label: "Explore", color: "text-blue-400" },
    { icon: Code, label: "Code", color: "text-green-400" },
    { icon: GraduationCap, label: "Learn", color: "text-orange-400" },
  ]

  const sampleQuestions = [
    "How does AI work?",
    "Are black holes real?",
    'How many Rs are in the word "strawberry"?',
    "What is the meaning of life?",
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])
  useEffect(() => {
    adjustHeight()
  },[message])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k") {
        // Check if user is not already typing in an input field
        const activeElement = document.activeElement
        const isTypingInInput =
          activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!message.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      role: "user" as const,
    }

    // Add user message
    setMessages((prev) => [...prev, userMessage])
    setMessage("")

    // Call server action to get AI response
    try {
      //const aiResponse = await generateResponse()
      const aiResponse = await askGemini("gemini-2.5-flash" , message)
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant" as const,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        role: "assistant" as const,
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }
  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const adjustHeight = () => {
    const textarea = messageInputRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200)
      textarea.style.height = `${newHeight}px`
    }
  }

  return (
    <>
      {/* Chat Area */}
      <div className="w-full flex flex-1 overflow-y-auto p-4 space-y-4 justify-center">
      <div className="max-w-4xl overflow-y-auto p-4 space-y-4 chat-container">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* Welcome Message */}
              <h1 className="text-3xl font-semibold text-white mb-8">How can I help you, NITHISH?</h1>
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
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="block w-full text-left p-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat messages
          <div className="flex-1 p-4 space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      </div>
      <div className="pb-4 border-none ">
        {/* Message Input */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage}>
            <div className="relative">
              <textarea
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="Type your message here...(K)"
                className="
                  resize-none 
                  w-full 
                  min-h-[40px]
                  max-h-[200px]
                  rounded-md 
                  border-none 
                  bg-gray-700
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
          </form>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300">
                    Gemini 2.5 Flash
                    <ChevronDown className="w-3 h-3" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded">
                    <Search className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            <div className="flex items-center gap-2"> 
                <button type="button" className="p-1 hover:bg-gray-600 rounded">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-600 rounded">
                    <SendHorizontal onClick={handleSendMessage} className="w-4 h-4 text-gray-400" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MessageInput
