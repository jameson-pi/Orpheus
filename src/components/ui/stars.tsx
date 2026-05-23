"use client"

import { useEffect, useState } from "react"

export function Stars() {
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
    <div className="stars-container pointer-events-none fixed inset-0 z-[-1]">
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
