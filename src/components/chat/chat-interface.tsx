"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2, Cpu, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageBubble } from "./message-bubble"
import { ThinkingIndicator } from "./thinking-indicator"
import { orpheusAIChatInteractionStream } from "@/ai/flows/orpheus-ai-chat-interaction"
import { getMessages, addMessage, updateConversationTitle } from "@/app/actions/chat"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { UserButton } from "@neondatabase/neon-js/auth/react/ui"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

type Message = {
  id: string
  role: "user" | "ai"
  content: string
}

const AI_MODELS = [
  { id: "google/gemini-3.5-flash", name: "Gemini 3.5 Flash" },
  { id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro" },
  { id: "openai/gpt-5.5", name: "GPT-5.5" },
  { id: "x-ai/grok-4.20", name: "Grok 4.20" },
  { id: "qwen/qwen3.7-max", name: "Qwen3.7 Max" }
];

export function ChatInterface({ conversationId, onTitleUpdateAction }: { conversationId: string, onTitleUpdateAction: (title: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = authClient.useSession()

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    if (conversationId) {
      getMessages(conversationId).then(history => {
        if (history && history.length > 0) {
          setMessages(history.map(m => ({ id: m.id, role: m.role as "user" | "ai", content: m.content })))
        }
      })
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userContent = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Save user msg to DB (don't block the AI response if it's slow)
    if (conversationId && conversationId.includes('-')) { // Basic check for UUID
      addMessage(conversationId, "user", userContent).catch(err => 
        console.error("Failed to save user message:", err)
      );
      
      if (messages.length === 0 && onTitleUpdateAction) {
        const words = userContent.trim().split(/\s+/);
        const title = words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
        onTitleUpdateAction(title);
        updateConversationTitle(conversationId, title).catch(err =>
          console.error("Failed to update title in DB:", err)
        );
      }
    }

    try {
      // Prepare history to send (previous messages)
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const stream = await orpheusAIChatInteractionStream({ 
        message: userContent, 
        model: selectedModel,
        history: history
      })

      let fullContent = ""
      let hasStarted = false
      const aiMessageId = Date.now().toString()
      
      const streamIter = stream as unknown as AsyncIterable<string | { content?: string, value?: string }>;
      
      for await (const chunk of streamIter) {
        const content = typeof chunk === 'string' 
          ? chunk 
          : (chunk?.content || chunk?.value || "") as string;
        
        if (content) {
          if (!hasStarted) {
            hasStarted = true
            setMessages((prev) => [...prev, {
              id: aiMessageId,
              role: "ai",
              content: "",
            }])
          }
          fullContent += content;
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMessageId ? { ...msg, content: fullContent } : msg
            )
          );
        }
      }
      
      // Save AI msg to DB once fully received
      if (conversationId && conversationId.includes('-') && fullContent) {
        addMessage(conversationId, "ai", fullContent).catch(err => 
          console.error("Failed to save AI message:", err)
        );
      }
    } catch (error: any) {
      console.error("Chat Error:", error)
      let errorDetail = "I apologize, but I encountered a cosmic disturbance while connecting to the Orpheus network.";
      
      if (error?.message?.includes('401') || error?.status === 401) {
        errorDetail = "Authentication failed. The cosmic keys (API keys) seem to be invalid or expired.";
      } else if (error?.message?.includes('404') || error?.status === 404) {
        errorDetail = "The requested model was not found in the cosmic archives (404 Error).";
      } else if (error?.message?.includes('500') || error?.status === 500) {
        errorDetail = "The AI provider is experiencing a temporary blackout (500 Internal Server Error).";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `### ⚠️ Connection Error\n\n${errorDetail}\n\n**Please check:**\n- Your internet connectivity\n- If the AI provider (OpenRouter) is currently available\n- Refresh the page and try again`,
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
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full bg-background/40 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-headline text-orpheus-gradient select-none">
            Orpheus AI
          </h1>
          <div className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent uppercase tracking-tighter font-bold">
            Pro
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="items-center gap-2 hidden sm:flex">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest hidden sm:inline-block">OpenRouter</span>
          </div>
          <div className="flex items-center gap-4 ml-2">
            {!session ? (
              <Link href="/auth/sign-in">
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-xs h-8">
                  Sign In
                </Button>
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </header>

      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-2 scroll-smooth !scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-orpheus-gradient blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-orpheus-gradient p-6 rounded-3xl cosmic-shadow transform group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="space-y-2 max-w-xl px-4">
                <h2 className="text-4xl font-extrabold text-white tracking-tight">Orpheus AI</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I am Orpheus, a helpful and knowledgeable AI assistant. Ask me anything about coding, building, or solving problems.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-6 pt-4">
                {["Explain quantum computing", "How to build a website?", "Write a Python script", "Summarize a complex topic"].map((prompt) => (
                  <button 
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground hover:bg-white/10 hover:text-white transition-all hover:border-primary/30"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {isLoading && !messages.some(m => m.role === 'ai' && m.id === messages[messages.length-1]?.id) && (
                <ThinkingIndicator />
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className={cn(
        "p-4 sm:p-6 transition-all duration-500 ease-in-out bg-gradient-to-t from-background/80 via-background/40 to-transparent backdrop-blur-sm",
        messages.length === 0 ? "mx-auto w-full max-w-5xl pb-12 sm:pb-24" : "w-full"
      )}>
        <form 
          onSubmit={handleSubmit}
          className="relative group max-w-6xl mx-auto"
        >
          <div className={cn(
            "relative flex flex-col w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300 shadow-2xl",
            isLoading && "opacity-50"
          )}>
            <div className="flex items-center px-4 pt-3 gap-2">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-fit bg-white/5 border-none h-7 text-[10px] focus:ring-0 focus:ring-offset-0 hover:bg-white/10 transition-colors rounded-full px-3 text-muted-foreground uppercase tracking-wider font-bold">
                  <Cpu className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent className="bg-secondary/90 backdrop-blur-xl border-white/10">
                  {AI_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id} className="text-[10px] font-bold uppercase tracking-wider">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="h-4 w-[1px] bg-white/10 mx-1" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                <Globe className="h-3 w-3 text-accent/50" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Online</span>
              </div>
            </div>
            
            <div className="flex items-end flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Message Orpheus AI..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 resize-none py-4 px-5 min-h-[56px] max-h-48 scrollbar-hide text-sm"
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
                    "rounded-2xl h-10 w-10 transition-all",
                    input.trim() ? "bg-orpheus-gradient shadow-lg scale-100 hover:scale-105" : "bg-muted text-muted-foreground scale-95"
                  )}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[9px] text-center text-muted-foreground/40 uppercase tracking-[0.2em] font-medium">
            Cosmic Computing Interface &bull; {AI_MODELS.find(m => m.id === selectedModel)?.name}
          </p>
        </form>
      </div>
    </div>
  )
}
