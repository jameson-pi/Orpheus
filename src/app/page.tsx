import { ChatInterface } from "@/components/chat/chat-interface"

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30">
      {/* Decorative cosmic elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />
      
      <ChatInterface />
    </main>
  )
}
