import { ChatDashboard } from "@/components/chat/chat-dashboard"

function Stars() {
  return (
    <div className="stars-container pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i} 
          className="star"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            ["--duration" as string]: `${2 + Math.random() * 4}s`
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

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
