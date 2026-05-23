"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

const CELESTIAL_PHRASES = [
  "Orpheus is channeling",
  "Consulting the archives",
  "Harmonizing data streams",
  "Decoding the cosmos",
  "Synthesizing thoughts",
  "Navigating neural networks",
  "Bridging logic and magic",
  "Traversing knowledge clusters",
  "Aligning constellations"
]

export function ThinkingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % CELESTIAL_PHRASES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex w-full gap-4 py-8 px-4 sm:px-8"
    >
      <div className="flex-shrink-0">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-orpheus-gradient shadow-lg shadow-primary/20">
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-xl bg-accent blur-md"
          />
          <Sparkles className="h-4 w-4 text-white relative z-10 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 pt-1">
        <div className="flex items-center gap-3 h-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.5 }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/80"
            >
              {CELESTIAL_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 1, 0.2],
                  backgroundColor: ["#3B82F6", "#8B5CF6", "#3B82F6"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="h-1.5 w-1.5 rounded-full"
              />
            ))}
          </div>
        </div>
        <div className="space-y-3 max-w-sm">
          <motion.div 
            className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="absolute inset-0 bg-orpheus-gradient w-1/2 blur-[2px]"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
          <motion.div 
            className="h-1.5 w-[70%] bg-white/5 rounded-full overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="absolute inset-0 bg-orpheus-gradient w-1/2 blur-[2px]"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
