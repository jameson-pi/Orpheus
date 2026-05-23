"use client"

import { ChatDashboard } from "@/components/chat/chat-dashboard"
import { useEffect, useState } from "react"

function Stars() {
  const [stars, setStars] = useState<{top: string, left: string, width: string, height: string, duration: string}[]>([])

  useEffect(() => {
    // Generate stars only on the client to prevent hydration mismatch
    const generatedStars = [...Array(50)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3}px`,
      height: `${Math.random() * 3}px`,
      duration: `${2 + Math.random() * 4}s`
    }))
    setStars(generatedStars)
  }, [])

  return (
    <div className="stars-container pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i} 
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.width,
            height: star.height,
            ["--duration" as string]: star.duration
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
