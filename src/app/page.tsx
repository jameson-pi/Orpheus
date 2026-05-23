"use client"

import { ChatDashboard } from "@/components/chat/chat-dashboard"
import { Stars } from "@/components/ui/stars"

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent selection:bg-primary/30">
      <Stars />
      {/* Decorative cosmic elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />
      
      <ChatDashboard />
    </main>
  )
}
