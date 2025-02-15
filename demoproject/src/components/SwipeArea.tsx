"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Edit } from "lucide-react"

interface Card {
  id: number
  originalPost: string
  comment: string
}

export function SwipeArea({ cards: initialCards }: { cards: Card[] }) {
  const [cards, setCards] = useState([
    {
      id: 1,
      originalPost: "Most AI tutors just give answers. Bloom AI Tutor does something different—it guides students to think critically. Instead of simply providing solutions, Bloom asks the right questions at the right time, helping students work through problems step by step. It's designed to think like a great teacher, not just retrieve information.",
      comment: "Love this approach! We've been working on something similar with our biology tutor. Found that mixing curriculum mapping with smart retrieval helps students actually understand concepts instead of just memorizing answers. If you're curious about our setup: https://example.com/iterative-rag-tutoring"
    },
    {
      id: 2,
      originalPost: "Harvard says AI tutors are better than Harvard professors. A recent study showed Harvard undergrads improved their physics scores 2x as much with an AI tutor than in an active-learning lecture. What are the implications?",
      comment: "Really fascinating results! We've seen similar improvements in biology education with our RAG system. The key seems to be making sure the AI actually understands the curriculum, not just the facts. Happy to share more about what worked for us: https://example.com/iterative-rag-tutoring"
    },
    {
      id: 3,
      originalPost: "Retrieval-Augmented Generation (RAG) systems are continuing to make massive advancements! This podcast dives into the transformation of RAG architectures from disjoint components to jointly and continually optimized systems.",
      comment: "Been geeking out about this too! Just rebuilt our biology tutor using an iterative RAG approach. It's amazing how much better it works when you tie everything together - retrieval, curriculum, the whole package. Wrote up our experience here if you're interested: https://example.com/iterative-rag-tutoring"
    },
    {
      id: 4,
      originalPost: "The game-changing use case for AI/LLMs in education isn't chatbots. Struggling students often don't know what questions to ask—or even what they don't know. We need to embed support directly into curricular activities, providing guidance in the right context, at the right moment.",
      comment: "This hits home! It's exactly why we built our biology tutor the way we did. Students need guidance that fits their context and current understanding. We've had some cool breakthroughs with this - check out what we learned: https://example.com/iterative-rag-tutoring"
    }
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState("")

  const handleSwipe = (direction: "left" | "right") => {
    setCards((prevCards) => prevCards.filter((_, index) => index !== currentIndex))
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedComment(cards[currentIndex].comment)
  }

  const handleSaveEdit = () => {
    setCards((prevCards) =>
      prevCards.map((card, index) => (index === currentIndex ? { ...card, comment: editedComment } : card)),
    )
    setIsEditing(false)
  }

  if (cards.length === 0) {
    return <div className="text-center mt-4">No more cards to display</div>
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[400px]">
      <AnimatePresence>
        {cards.map(
          (card, index) =>
            index === currentIndex && (
              <motion.div
                key={card.id}
                className="absolute w-full bg-white p-4 rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: -50, right: 50 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -100) handleSwipe("left")
                  else if (info.offset.x > 100) handleSwipe("right")
                }}
              >
                <h3 className="font-bold mb-2">Original Post:</h3>
                <p className="mb-4">{card.originalPost}</p>
                <h3 className="font-bold mb-2">Your Comment:</h3>
                {isEditing ? (
                  <>
                    <Textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className="mb-2"
                    />
                    <Button onClick={handleSaveEdit} className="w-full mb-2">
                      Save
                    </Button>
                  </>
                ) : (
                  <p className="mb-4">{card.comment}</p>
                )}
                <div className="flex justify-between">
                  <Button onClick={() => handleSwipe("left")} className="bg-red-500 hover:bg-red-600">
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button onClick={() => handleSwipe("right")} className="bg-green-500 hover:bg-green-600">
                    <Check className="mr-2 h-4 w-4" /> Make Comment
                  </Button>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>
    </div>
  )
}

