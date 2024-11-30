"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: number
  keyword: string
  question: string
  answer: string
  imageUrl?: string
}

const questions: Question[] = Array(25).fill(null).map((_, i) => ({
  id: i,
  keyword: `키워드 ${i + 1}`,
  question: `문제 ${i + 1}의 내용`,
  answer: `정답 ${i + 1}`,
  imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgNDAwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCI+CiAgPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNjY2NjY2MiPjwvcmVjdD4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyNnB4IiBmaWxsPSIjMzMzMzMzIj5pbWFnZXM8L3RleHQ+ICAgCjwvc3ZnPg=="
}))

export default function BingoBoard() {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedCells, setSelectedCells] = useState<Map<number, 'red' | 'green'>>(new Map())
  const [winningTeam, setWinningTeam] = useState<'red' | 'green' | null>(null)
  const [winningLines, setWinningLines] = useState<number[][]>([])

  const handleCellClick = (question: Question) => {
    setSelectedQuestion(question)
    setShowAnswer(false)
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
  }

  const handleAnswer = (team: 'A' | 'B') => {
    if (selectedQuestion) {
      setSelectedCells(prev => new Map(prev.set(selectedQuestion.id, team === 'A' ? 'red' : 'green')))
      setSelectedQuestion(null)
    }
  }

  // 빙고 체크 함수
  const checkBingo = (cells: Map<number, 'red' | 'green'>) => {
    const lines = [
      [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24], // 가로
      [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24], // 세로
      [0,6,12,18,24], [4,8,12,16,20] // 대각선
    ]

    for (const line of lines) {
      const colors = line.map(i => cells.get(i))
      if (colors.every(color => color === 'red')) {
        setWinningTeam('red')
        setWinningLines([line])
        return
      }
      if (colors.every(color => color === 'green')) {
        setWinningTeam('green')
        setWinningLines([line])
        return
      }
    }
  }

  useEffect(() => {
    checkBingo(selectedCells)
  }, [selectedCells])

  const fireworkVariants = {
    hidden: { 
      x: "50vw",
      y: "50vh",
      scale: 0,
      opacity: 0 
    },
    visible: (i: number) => ({
      x: `${50 + Math.cos(i * Math.PI * 2 / 30) * 50}vw`,
      y: `${50 + Math.sin(i * Math.PI * 2 / 30) * 50}vh`,
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: Math.random() * 0.5,
      }
    })
  }

  return (
    <motion.div 
      className="min-h-screen p-8 relative overflow-hidden flex flex-col items-center justify-center"
      animate={{
        backgroundColor: winningTeam 
          ? winningTeam === 'red' 
            ? '#ef4444'
            : '#22c55e'
          : '#000000'
      }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {winningTeam && (
          <>
            {/* 파죽 파티클 효과 */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                className={`absolute w-4 h-4 ${
                  winningTeam === 'red' 
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                variants={fireworkVariants}
                initial="hidden"
                animate="visible"
                style={{
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
              />
            ))}

            {/* 승리 메시지 */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <motion.div
                className="text-8xl font-bold text-white px-12 py-6 rounded-xl"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {winningTeam === 'red' ? 'TEAM A 🧑‍🎄' : 'TEAM B 🎄'} BINGO!
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="max-w-7xl w-full mx-auto relative z-10">
        <h1 className="sr-only">
          도그이어 빙고 게임
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo Section */}
          <div className="flex items-center p-8">
              <Image
                src="/cover.png"
                alt="cover"
                width={200}
                height={200}
              className="w-full max-w-40 md:max-w-full mx-auto"
              priority
              />
          </div>

          {/* Bingo Grid with animations */}
          <div className="grid grid-cols-5 gap-2 w-full h-full">
            {questions.map((question) => (
              <motion.div
                key={question.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleCellClick(question)}
                  className={`rounded-none w-full h-full aspect-square p-0 flex items-center justify-center text-center hover:bg-gray-100 text-black font-bold 
                    ${selectedCells.has(question.id) 
                      ? selectedCells.get(question.id) === 'red'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-white'}
                    ${winningLines.flat().includes(question.id) ? 'animate-pulse' : ''}
                  `}
                >
                  {question.keyword}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Question Modal */}
        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-80 sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestion?.keyword}</DialogTitle>
              <DialogDescription>
                {selectedQuestion?.question}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="relative">
                {selectedQuestion?.imageUrl && (
                  <Image
                    src={selectedQuestion.imageUrl}
                    alt={`${selectedQuestion.keyword} 이미지`}
                    width={400}
                    height={200}
                    className="w-full max-w-32 sm:max-w-64 mx-auto rounded-lg object-cover"
                    priority={false}
                  />
                )}
              </div>

              {!showAnswer && (
                <Button onClick={handleShowAnswer} className="w-full">
                  정답 보기
                </Button>
              )}
              {showAnswer && (
                <>
                  <p className="text-lg font-bold">정답: {selectedQuestion?.answer}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => handleAnswer("A")}
                      variant="outline"
                      className="border-2 border-red-500 hover:bg-red-50 text-red-500 hover:text-red-600"
                    >
                      A팀 정답
                    </Button>
                    <Button
                      onClick={() => handleAnswer("B")}
                      variant="outline"
                      className="border-2 border-green-500 hover:bg-green-50 text-green-500 hover:text-green-600"
                    >
                      B팀 정답
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </motion.div>
  )
}

