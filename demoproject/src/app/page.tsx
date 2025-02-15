"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { FunLoadingAnimation } from "@/components/FunLoadingAnimation"
import { SwipeArea } from "@/components/SwipeArea"

export default function LinkedInFamous() {
  const [post, setPost] = useState("")
  const [queries, setQueries] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSwipeArea, setShowSwipeArea] = useState(false)
  const [cards, setCards] = useState([])

  const handleMagicButton = async () => {
    if (!post.trim()) {
      toast.error("Please enter a LinkedIn post first.")
      return
    }

    setQueries([])
    setError(null)
    setIsLoading(true)
    setShowSwipeArea(false)

    try {
      console.log("Sending post to API:", post)
      const response = await fetch("/api/generate-queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: post }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received response:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.queries) {
        const newQueries = data.queries.split(",").map((query: string) => query.trim())
        setQueries(newQueries)

        // Simulate API call to generate comments
        setTimeout(() => {
          const generatedCards = newQueries.map((query, index) => ({
            id: index,
            originalPost: `Sample post related to "${query}"`,
            comment: `Your insightful comment about ${query}`,
          }))
          setCards(generatedCards)
          setShowSwipeArea(true)
        }, 10000) // 10 seconds delay
      } else {
        throw new Error("No queries returned from API")
      }
    } catch (err) {
      console.error("Error generating queries:", err)
      setError(err.message)
      toast.error("Failed to generate queries. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">LinkedIn Famous</h1>
      <Textarea
        placeholder="Enter your LinkedIn post here..."
        value={post}
        onChange={(e) => setPost(e.target.value)}
        className="w-full h-40 mb-4"
      />
      <Button onClick={handleMagicButton} className="w-full mb-2" disabled={isLoading}>
        Magic Button
      </Button>
      <p className="text-center text-sm text-gray-500 mb-4">
        Find similar posts where you can provide this post as a comment
      </p>
      {isLoading ? (
        <FunLoadingAnimation />
      ) : showSwipeArea ? (
        <SwipeArea cards={cards} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {queries.map((query, index) => (
            <div
              key={index}
              className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm flex items-center justify-center text-center h-full"
              style={{ maxWidth: "100%", minHeight: "60px" }}
            >
              {query}
            </div>
          ))}
        </div>
      )}
      {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">Error: {error}</div>}
    </div>
  )
}

