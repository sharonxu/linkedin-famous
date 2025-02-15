"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

const funMessages = [
  "Pouring elixirs...",
  "Firing up transformers...",
  "Summoning AI gremlins...",
  "Consulting digital oracles...",
  "Unraveling the LinkedIn matrix...",
  "Brewing algorithmic potions...",
  "Decoding the social media enigma...",
  "Channeling the spirit of networking...",
  "Calibrating the buzz-o-meter...",
  "Aligning digital chakras...",
  "Polishing the crystal mouse...",
  "Feeding hamsters in the quantum wheel...",
  "Untangling the web of connections...",
  "Charging the idea capacitors...",
  "Igniting synaptic fireworks...",
]

export function FunLoadingAnimation() {
  const [currentMessage, setCurrentMessage] = useState(funMessages[0])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentMessage((prevMessage) => {
        const currentIndex = funMessages.indexOf(prevMessage)
        const nextIndex = (currentIndex + 1) % funMessages.length
        return funMessages[nextIndex]
      })
    }, 2000) // Change message every 2 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg shadow-lg animate-pulse">
      <Loader2 className="w-12 h-12 text-white animate-spin" />
      <p className="text-white text-lg font-bold text-center">{currentMessage}</p>
    </div>
  )
}

