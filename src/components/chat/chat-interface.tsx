
"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble } from "./message-bubble"
import { orpheusAIChatInteraction } from "@/ai/flows/orpheus-ai-chat-interaction"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response = await orpheusAIChatInteraction({ message: currentInput })
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I apologize, but I encountered an error connecting to the Hack Club AI Proxy. Please ensure your API key is set.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline text-orpheus-gradient flex items-center gap-2">
          Orpheus AI
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Hack Club Proxy</span>
        </div>
      </header>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-2 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="bg-orpheus-gradient p-4 rounded-full cosmic-shadow">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Welcome to Orpheus</h2>
              <p className="max-w-xs text-muted-foreground">
                Built by Hack Clubbers, powered by the Hack Club AI Proxy.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 py-6 px-4 text-muted-foreground animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-sm">Orpheus is thinking...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-background via-background to-transparent">
        <form 
          onSubmit={handleSubmit}
          className="relative group max-w-3xl mx-auto"
        >
          <div className={cn(
            "relative flex items-end w-full bg-secondary/50 border border-white/10 rounded-2xl overflow-hidden focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all",
            isLoading && "opacity-50"
          )}>
            <Textarea
              ref={textareaRef}
              placeholder="Message Orpheus AI..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none py-4 px-5 min-h-[56px] max-h-48 scrollbar-hide"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="p-2">
              <Button
                size="icon"
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "rounded-xl transition-all",
                  input.trim() ? "bg-orpheus-gradient shadow-lg" : "bg-muted text-muted-foreground"
                )}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-center text-muted-foreground/60 uppercase tracking-tighter">
            Powered by Hack Club AI Proxy &bull; GPT-4o Mini
          </p>
        </form>
      </div>
    </div>
  )
}
