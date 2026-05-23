"use client"

import { cn } from "@/lib/utils"
import { Sparkles, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion } from "framer-motion"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageBubbleProps {
  role: "user" | "ai"
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user"
  const [copied, setCopying] = useState(false)
  const isError = !isUser && content.includes("Connection Error")

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-4 py-8 px-4 sm:px-8 transition-all group/bubble relative mb-4 last:mb-0",
        isUser ? "bg-transparent" : "bg-white/[0.06] backdrop-blur-2xl rounded-3xl border border-white/10 cosmic-shadow",
        isError ? "border-red-500/20 bg-red-500/5" : ""
      )}
    >
      {!isUser && (
        <div className={cn(
          "absolute inset-0 opacity-[0.04] rounded-3xl pointer-events-none",
          isError ? "bg-red-500" : "bg-orpheus-gradient"
        )} />
      )}
      <div className="flex-shrink-0 relative z-10">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover/bubble:scale-110 duration-300",
            isUser 
              ? "bg-primary/10 border-primary/20 text-primary" 
              : (isError ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-orpheus-gradient border-none text-white shadow-lg shadow-primary/20")
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 relative z-10">
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            isUser ? "text-primary/70" : (isError ? "text-red-400/70" : "text-accent/70")
          )}>
            {isUser ? "Authorized Explorer" : (isError ? "System Alert" : "Orpheus Intelligence")}
          </p>
          {!isUser && !isError && (
            <button 
              onClick={handleCopy}
              className="text-muted-foreground/40 hover:text-accent transition-all p-1.5 rounded-lg hover:bg-white/5 opacity-0 group-hover/bubble:opacity-100"
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
        <div className={cn(
          "prose prose-invert max-w-none text-[15px] leading-relaxed text-foreground antialiased",
          isUser ? "whitespace-pre-wrap font-medium" : "selection:bg-accent/30",
          isError ? "text-red-200/90" : "text-white/90"
        )}>
          {isUser ? (
            content
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                code: ({inline, className, children, ...props}: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  if (!inline) {
                    return (
                      <div className="relative group/code my-6">
                        <div className="absolute right-3 top-3 z-20 opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <CodeCopyButton content={String(children).replace(/\n$/, '')} />
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match ? match[1] : 'text'}
                          PreTag="div"
                          className="!bg-[#090A0F]/80 !border !border-white/5 !rounded-2xl !p-5 !my-0 scrollbar-hide text-[13px] leading-relaxed shadow-2xl"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }
                  return (
                    <code {...props} className={cn("bg-white/10 rounded-md px-1.5 py-0.5 font-code text-xs text-accent/90", className)}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CodeCopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="bg-white/10 hover:bg-white/20 p-1.5 rounded-md backdrop-blur-md border border-white/10 transition-all"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-white/70" />}
    </button>
  )
}
