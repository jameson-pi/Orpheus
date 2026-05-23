"use client"

import React, { useState, useEffect } from "react"
import { getConversations, createConversation } from "@/app/actions/chat"
import { ChatInterface } from "./chat-interface"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, MessageSquare, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Conversation = { id: string; title: string; createdAt?: Date; updatedAt?: Date }

export function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user?.id
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  useEffect(() => {
    if (isPending) return; // Wait for auth check to finish

    if (userId) {
      loadConversations()
    } else {
      setConversations([])
      setActiveId(null)
      setIsLoadingConversations(false)
    }
  }, [userId, isPending])

  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const data = await getConversations()
      setConversations(data)
      if (data.length > 0 && !activeId) {
        setActiveId(data[0].id)
      }
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const newConv = await createConversation("New Conversation")
      if (newConv) {
        setConversations([newConv, ...conversations])
        setActiveId(newConv.id)
        setIsSidebarOpen(false)
      } else {
        throw new Error("Failed to create conversation in DB")
      }
    } catch (err) {
      console.error("New Chat Fallback:", err)
      // Fallback for no DB: fake id
      const fakeId = "local-" + Date.now().toString()
      setConversations([{ id: fakeId, title: "Local Conversation" }, ...conversations])
      setActiveId(fakeId)
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background/50 backdrop-blur-xl">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-secondary/10 backdrop-blur-3xl border-r border-white/5 transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="p-6 flex items-center justify-between border-b border-white/5 relative z-10">
          <h2 className="text-xl font-bold font-headline text-orpheus-gradient flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-accent" />
              <div className="absolute inset-0 blur-md bg-accent/30 animate-pulse" />
            </div>
            Orpheus
          </h2>
          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:bg-white/5" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 relative z-10">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-orpheus-gradient hover:opacity-90 text-white border-none shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 !scrollbar-hide relative z-10">
          {isPending || isLoadingConversations ? (
             <div className="space-y-3 px-2 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full h-12 bg-white/5 animate-pulse rounded-xl" />
                ))}
             </div>
          ) : session ? (
            <>
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveId(conv.id)
                    setIsSidebarOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 relative group overflow-hidden",
                    activeId === conv.id 
                      ? "bg-white/10 text-white border border-white/10 shadow-inner" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-white"
                  )}
                >
                  <MessageSquare className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", activeId === conv.id ? "text-accent" : "")} />
                  <span className="truncate text-sm font-medium">{conv.title}</span>
                  {activeId === conv.id && (
                    <>
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-1/2 bg-accent rounded-full" 
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                      <div className="absolute inset-0 bg-orpheus-gradient opacity-10" />
                    </>
                  )}
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-6">No previous chats</p>
              )}
            </>
          ) : !isPending && (
            <div className="flex flex-col items-center justify-center h-48 px-4 text-center space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sign in to save your cosmic conversations and keep them synced across space and time.
              </p>
              <Link href="/auth/sign-in">
                <Button variant="outline" size="sm" className="w-full bg-accent/10 border-accent/20 hover:bg-accent/20 text-accent text-[10px] uppercase font-bold tracking-widest transition-all">
                  Sign In Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* User Profile / Logout Section */}
        {session && (
          <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md relative z-10">
            <div className="flex items-center justify-between gap-3 px-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-orpheus-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {session.user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{session.user?.name || 'Explorer'}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{session.user?.email}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 z-30 lg:hidden text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {isPending || isLoadingConversations ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading cosmic interface...</p>
            </div>
          </div>
        ) : activeId ? (
          <ChatInterface key={activeId} conversationId={activeId} onTitleUpdateAction={(title: string) => {
            // Optional: update title if we extract it from first msg
            setConversations(prev => prev.map(c => c.id === activeId ? {...c, title} : c));
          }} />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="space-y-4 max-w-sm">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-medium text-white">No Chat Selected</h3>
              <p className="text-sm text-muted-foreground">Select an existing conversation or start a new one to begin connecting with Orpheus AI.</p>
              <Button onClick={handleNewChat} className="bg-orpheus-gradient shadow-lg">Start New Chat</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
