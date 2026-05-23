"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

const CELESTIAL_PHRASES = [
  "Orpheus is channeling",
  "Consulting the archives",
  "Harmonizing data streams",
  "Decoding the cosmos",
  "Synthesizing thoughts"
]

export function ThinkingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % CELESTIAL_PHRASES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex w-full gap-4 py-6 px-4 sm:px-6"
    >
      <div className="flex-shrink-0">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-orpheus-gradient shadow-lg">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-lg bg-accent/30 blur-md"
          />
          <Sparkles className="h-4 w-4 text-white relative z-10" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 pt-1">
        <div className="flex items-center gap-2 h-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs font-semibold uppercase tracking-wider text-accent"
            >
              {CELESTIAL_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-1 w-1 rounded-full bg-accent"
              />
            ))}
          </div>
        </div>
        <div className="space-y-2 max-w-md">
          <motion.div 
            className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="absolute inset-0 bg-orpheus-gradient w-1/3"
              animate={{
                x: ["-100%", "300%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
          <motion.div 
            className="h-2 w-2/3 bg-white/5 rounded-full overflow-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="absolute inset-0 bg-orpheus-gradient w-1/3"
              animate={{
                x: ["-100%", "300%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
