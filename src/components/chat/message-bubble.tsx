"use client"

import { cn } from "@/lib/utils"
import { Sparkles, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "ai"
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user"
  const [copied, setCopying] = useState(false)

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
        "flex w-full gap-4 py-6 px-4 sm:px-6 transition-all",
        isUser ? "bg-transparent" : "bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 cosmic-shadow"
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm",
            isUser 
              ? "bg-primary/10 border-primary/20 text-primary" 
              : "bg-orpheus-gradient border-none text-white"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            {isUser ? "You" : "Orpheus AI"}
          </p>
          {!isUser && (
            <button 
              onClick={handleCopy}
              className="text-muted-foreground/40 hover:text-accent transition-colors p-1 rounded-md hover:bg-white/5"
              title="Copy message"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
        <div className={cn(
          "prose prose-invert max-w-none text-base leading-relaxed text-foreground/90",
          isUser ? "whitespace-pre-wrap" : "selection:bg-accent/30"
        )}>
          {isUser ? (
            content
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                code: ({...props}) => (
                  <code {...props} className="bg-white/10 rounded px-1.5 py-0.5 font-code text-sm" />
                ),
                pre: ({children}) => (
                  <pre className="bg-[#0D1117]/80 border border-white/10 rounded-xl p-4 overflow-x-auto my-4 scrollbar-hide">
                    {children}
                  </pre>
                )
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
