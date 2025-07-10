"use client";
import askGeminiBackground from "~/lib/askGeminiBackground";
import { useEffect,useState,useRef,useCallback,useMemo } from "react"
import { useUser } from '@clerk/nextjs';
import { Search, Paperclip, ChevronDown, Sparkles, Compass, Code, GraduationCap, SendHorizontal, StopCircle } from "lucide-react"
import ChatMessage from "~/components/ui/chatMessage"
import React from "react";

import type { Message } from "~/components/ui/chatMessage"

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

interface ThreadProps {
  chatId: string;
  onNewMessage: (chatId: string, newMessages: Message[]) => void;
  parentMessages: Message[];
  appendChunkToLastMessage: (id:string, chunk:string) => void;
  createNewAssistantMessage: (id:string) => void;
}

export default React.memo(function Thread({ chatId, onNewMessage, parentMessages,appendChunkToLastMessage, createNewAssistantMessage }: ThreadProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, isSignedIn } = useUser();
  const [question, setQuestion] = useState<string>("")
  const [streaming, setStreaming] = useState(false)
  const [aiModel, setAiModel ] = useState('gemini-2.5-flash')
  const [modelModalOpen, setModelModalOpen] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'instant', // Optional: for a smooth scrolling animation
        block: 'end',       // Optional: aligns the end of the element with the end of the scrollable area
                            // Other options: 'start', 'center', 'nearest'
      });
    }
  },[])
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

  const adjustHeight = () => {
    const textarea = messageInputRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200)
      textarea.style.height = `${newHeight}px`
    }
  }

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    if(streaming) return 
    e?.preventDefault()
    if (!question.trim()) return
    const userMessage = {
      id: Date.now().toString(),
      content: question.trim(),
      role: "user" as const,
    }
    // Add user message
    onNewMessage(chatId,[...parentMessages,userMessage])
    setQuestion('')
    setStreaming(true)

    askGeminiBackground({
      chatId,
      question,
      history: parentMessages,
      model: aiModel,
      onStart: () => createNewAssistantMessage(chatId),
      onChunk: (chunk:string) => appendChunkToLastMessage(chatId, chunk),
      onDone: () => setStreaming(false),
    });
  },[streaming, question, chatId, parentMessages, onNewMessage ])

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderedMessages = useMemo(() => (
    parentMessages.map((msg,count) => (
      <ChatMessage key={`${msg.id}${count}`} msg={msg} />
    ))
  ), [parentMessages]);

  return (
  <>
  <div className="w-full flex flex-1 overflow-y-auto p-4 pb-24 space-y-4 justify-center">
    <div className="max-w-4xl mx-auto flex-1 space-y-4 overflow-y-auto">
      {parentMessages.length === 0 ? (
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
          {renderedMessages}
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
            className=" resize-none rounded-t-lg w-full min-h-[40px] max-h-[200px] rounded-md border-none bg-transparent bg-black/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-600 ease-in-out overflow-auto leading-5 "
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
              {aiModel === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash'}
              <ChevronDown
                className={`pt-0 pb-1 w-3 h-3 transform transition-transform ${
                  modelModalOpen ? '' : 'rotate-180'
                }`}
              />
            </button>

            {/* Model dropdown menu */}
            {modelModalOpen && (
              <div className="absolute bottom-full mb-2 left-0 z-50 w-56 p-3 rounded-lg backdrop-blur-md bg-gray-800/70 border border-gray-700 shadow-lg">
                <button
                  onClick={() => {
                    setAiModel('gemini-2.5-flash');
                    setModelModalOpen(false);
                  }}
                  className={`block w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-700 text-gray-300 ${
                    aiModel === 'gemini-2.5-flash' ? 'bg-gray-700' : ''
                  }`}
                >
                  Gemini 2.5 Flash
                </button>
                <button
                  onClick={() => {
                    setAiModel('gemini-2.5-pro');
                    setModelModalOpen(false);
                  }}
                  className={`block w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-700 text-gray-300 ${
                    aiModel === 'gemini-2.5-pro' ? 'bg-gray-700' : ''
                  }`}
                >
                  Gemini 2.5 Pro
                </button>
              </div>
            )}

            {/* Search button */}
            <button className="p-1 hover:bg-gray-700 rounded">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-600 rounded" type="button">
              <Paperclip className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 hover:bg-gray-600 rounded" disabled={streaming} type="submit">
              {streaming ? (
                <StopCircle className="w-4 h-4 text-gray-500" />
              ) : (
                <SendHorizontal className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  </div>
  </>
  );
})
