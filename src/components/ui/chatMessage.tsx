'use client'

import { Copy } from "lucide-react"
import React,{ forwardRef } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"

import TypingDots from "~/components/ui/typingDots"

export type Message = {
  id: string
  content: string|null
  role: "user" | "assistant"
}

type ChatMessageProps = {
  msg: Message
}


const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ msg }, ref) => {
  const formatLangText = (language:string) => {
    if (language.trim().toLowerCase() === "html" || language.trim().toLowerCase() === "css") {
      return language.toUpperCase();
    }
    return language.charAt(0).toUpperCase() + language.slice(1);
  }
  return (
    <div ref={ref} key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} leading-relaxed`}>
      <div
        className={`p-3 rounded-lg ${
          msg.role === "user" ? "max-w-[70%] bg-blue-600 text-white" : "w-full bg-transparent text-gray-100"
        }`}
      >
        {msg.role === "assistant" ? (
          msg.content?(
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }:{node:any; inline:boolean, className?:string, children:React.ReactNode;}) {
                  const match = /language-(\w+)/.exec(className || "")
                  const language = match ? match[1] : ""
                  return !inline && language ? (
                    <div className="my-2">
                      <div className="flex items-center justify-between bg-[#282c34] px-3 py-2 rounded-t-md border-b border-gray-600 rounded-t-xl">
                        <span className="text-xs text-gray-400 font-large border-none">{formatLangText(language)}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ""))}
                          className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer hover:cursor-pointer"
                        >
                          <Copy size={18}></Copy>
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={language}
                        PreTag="div"
                        className="!mt-0 !rounded-t-none !rounded-b-xl"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  )
                },
                pre({ children }) {
                  return <>{children}</>
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                },
                li({ children }) {
                  return <li className="text-gray-100">{children}</li>
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-300 my-2">
                      {children}
                    </blockquote>
                  )
                },
                h1({ children }) {
                  return <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="text-lg font-bold mb-2 text-white">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="text-md font-bold mb-2 text-white">{children}</h3>
                },
                strong({ children }) {
                  return <strong className="font-bold text-white">{children}</strong>
                },
                em({ children }) {
                  return <em className="italic text-gray-200">{children}</em>
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  )
                },
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
          ): (
           <div className="px-3 py-2">
             <TypingDots />
           </div>
          )
        ) : (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        )}
      </div>
    </div>
  )
})

export default React.memo(ChatMessage)
//export default ChatMessage
