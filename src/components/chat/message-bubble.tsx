"use client"

import { cn } from "@/lib/utils"
import { Sparkles, User } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "ai"
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "flex w-full gap-4 py-8 px-4 sm:px-6 transition-all animate-fade-in-up",
        isUser ? "bg-transparent" : "bg-secondary/30 rounded-2xl cosmic-shadow"
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
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {isUser ? "You" : "Orpheus AI"}
        </p>
        <div className="prose prose-invert max-w-none text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  )
}
