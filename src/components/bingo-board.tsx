'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface Question {
  id: number;
  keyword: string;
  book: string;
  month: string;
  question: string;
  answer: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  correct: number;
  Comment: string;
  imageUrl: string;
  answer_imageUrl?: boolean;
  correct_imageUrl?: string;
  bonus?: boolean;
}

// 데이터 fetch 함수
async function getQuestions(): Promise<Question[]> {
  const res = await fetch('/api/api.json');
  const data = await res.json();
  return data;
}

export default function BingoBoard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedCells, setSelectedCells] = useState<
    Map<number, 'red' | 'green'>
  >(new Map());
  const [winningTeam, setWinningTeam] = useState<'red' | 'green' | null>(null);
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showChance, setShowChance] = useState(false);

  useEffect(() => {
    getQuestions().then((data) => {
      // 데이터를 랜덤하게 섞어서 25개만 선택
      const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 25);
      setQuestions(shuffled);
    });
  }, []);

  // 키워드 버튼 클릭
  const handleCellClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    setShowQuestion(false);
    setSelectedAnswer(null);
  };

  // 정답 보기 버튼 클릭 시 호출
  const handleShowAnswer = (key: string) => {
    const numKey = parseInt(key);
    setSelectedAnswer(numKey);
    setShowAnswer(numKey === correct);
  };

  // 문제 보기 버튼 클릭 시 호출
  const handleShowQuestion = () => {
    setShowQuestion(true);
  };

  // 팀별 정답 클릭 시 호출
  const handleAnswer = (team: 'red' | 'green') => {
    if (selectedQuestion) {
      const questionIndex = questions.findIndex(
        (q) => q.keyword === selectedQuestion.keyword,
      );
      if (questionIndex !== -1) {
        setSelectedCells((prev) => {
          const newMap = new Map(prev);
          newMap.set(questionIndex, team);
          return newMap;
        });
      }
      setSelectedQuestion(null);
      setShowQuestion(false);
    }
  };

  // 찬스 버튼 클릭 시 호출
  const handleShowChance = () => {
    setShowChance(true);
  };

  const handleAnswerA = () => handleAnswer('red');
  const handleAnswerB = () => handleAnswer('green');

  const {
    book,
    month,
    keyword,
    question,
    answer,
    correct,
    Comment,
    imageUrl,
    answer_imageUrl,
    correct_imageUrl,
    bonus,
  } = selectedQuestion || {};
  // 빙고 체크 함수
  const checkBingo = (cells: Map<number, 'red' | 'green'>) => {
    const lines = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24], // 가로
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24], // 세로
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20], // 대각선
    ];

    for (const line of lines) {
      const colors = line.map((i) => cells.get(i));
      if (colors.every((color) => color === 'red')) {
        setWinningTeam('red');
        setWinningLines([line]);
        return;
      }
      if (colors.every((color) => color === 'green')) {
        setWinningTeam('green');
        setWinningLines([line]);
        return;
      }
    }
  };

  useEffect(() => {
    checkBingo(selectedCells);
  }, [selectedCells]);

  const fireworkVariants = {
    hidden: {
      x: '50vw',
      y: '50vh',
      scale: 0,
      opacity: 0,
    },
    visible: (i: number) => ({
      x: `${50 + Math.cos((i * Math.PI * 2) / 30) * 50}vw`,
      y: `${50 + Math.sin((i * Math.PI * 2) / 30) * 50}vh`,
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: Math.random() * 0.5,
      },
    }),
  };

  return (
    <div className="w-full h-full bg-[url('/bg.png')] bg-no-repeat bg-center bg-cover min-h-screen p-8 relative flex flex-col items-center justify-center">
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
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
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
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <motion.div
                className="text-8xl  text-white px-12 py-6 rounded-xl"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {winningTeam === 'red' ? 'TEAM A 🧑‍🎄' : 'TEAM B 🎄'} BINGO!
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="max-w-screen-2xl w-full mx-auto relative z-10">
        <h1 className="sr-only">도그이어 빙고 게임</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 로고 */}
          <div className="flex items-center w-1/2">
            <Image
              src="/cover.svg"
              alt="cover"
              width={200}
              height={200}
              className="w-full mx-auto"
              priority
            />
          </div>

          {/* 빙고 게임 보드 */}
          <div
            className="grid grid-cols-5 gap-4 w-full"
            data-type="bingo-board"
          >
            {questions.map((question, index) => (
              <motion.div
                className="relative aspect-[4/3]"
                key={`${question.keyword}-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleCellClick(question)}
                  className={cn(`
                    relative
                    w-full h-full p-0
                    flex items-center justify-center text-center font-bold text-lg md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl
                    hover:scale-102
                    ${
                      selectedCells.get(index) === 'red'
                        ? 'bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[20px] text-white before:absolute before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#ff4d4d] before:to-[#cc0000] before:-z-10'
                        : selectedCells.get(index) === 'green'
                          ? 'bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[20px] text-white before:absolute before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#00cc5e] before:to-[#004d29] before:-z-10'
                          : 'bg-gradient-to-b from-[#666666] to-black text-white before:absolute before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#000] before:to-[#111] before:-z-10'
                    }
                    ${winningLines.flat().includes(index) ? 'animate-pulse' : ''}
                    rounded-[20px]
                  `)}
                >
                  {question.keyword}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 책 정보 보기 */}
        <Dialog
          open={!!selectedQuestion}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedQuestion(null);
              setShowAnswer(false);
              setShowQuestion(false);
              setSelectedAnswer(null);
            }
          }}
        >
          <DialogContent className="max-w-[90vw] md:max-w-[980px] bg-gradient-to-b from-white/80 from-0% via-gray-300/80 via-60% to-white to-100% backdrop-blur-[80px] border border-white/20 rounded-[40px] p-8">
            {bonus && bonus ? (
              <div className="flex-shrink-0 w-full text-center">
                <DialogHeader>
                  <Image
                    src="/bonus.svg"
                    alt="bonus"
                    width={400}
                    height={200}
                    className="w-full max-w-xl mx-auto rounded-lg object-cover"
                    priority={false}
                  />
                  <DialogTitle className="flex flex-col items-center gap-4 text-red-600 text-4xl font-bold">
                    기쁨의 환호를 질러주세요!
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                  {/* 정답 버튼 보기 */}
                  <Button
                    onClick={handleAnswerA}
                    className="font-bold px-12 py-8 text-white text-2xl bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[50px]"
                  >
                    광주여성팀 정답
                  </Button>
                  <Button
                    onClick={handleAnswerB}
                    className="font-bold px-12 py-8 text-white text-2xl bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[50px]"
                  >
                    도그이어팀 정답
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                {/* 왼쪽: 책 정보 */}
                <div className="flex-shrink-0 w-[40%] max-w-[320px] text-center">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="flex flex-col items-center gap-4">
                      <div className="bg-gradient-to-b from-[#00226e] to-[#001239] rounded-full text-white px-8 py-3 block text-center">
                        {month}
                      </div>
                      <div className="mt-4">
                        <Image
                          src={`/book/${imageUrl}`}
                          alt={`${keyword} 이미지`}
                          width={400}
                          height={200}
                          className="w-full max-w-24 sm:max-w-48 mx-auto rounded-lg object-cover"
                          priority={false}
                        />
                      </div>
                      <p className="text-lg font-bold text-center">{book}</p>
                    </DialogTitle>
                  </DialogHeader>
                </div>
                {/* 문제 확인 버튼 */}
                {!showQuestion && (
                  <div className="flex justify-center flex-grow">
                    <Image
                      onClick={handleShowQuestion}
                      src="/button.svg"
                      alt="문제 확인"
                      width={300}
                      height={400}
                      className="cursor-pointer hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                {/* 오른쪽: 문제 답안 */}
                {showQuestion && (
                  <div className="flex-1">
                    <div className="space-y-6">
                      {/* 문제 보기 */}
                      <DialogDescription className="text-2xl font-semibold">
                        {question}
                      </DialogDescription>
                      <div className="w-full h-full">
                        <Image
                          src={`/chance.svg`}
                          alt="찬스 버튼"
                          width={160}
                          height={160}
                          className="absolute top-[-60px] right-[-60px] animate-bounce duration-[30s] linear infinite"
                          onClick={handleShowChance}
                          priority={false}
                        />
                      </div>

                      {!showAnswer ? (
                        <div className="space-y-6 text-center">
                          {/* 문제 이미지 */}
                          {answer && (
                            // 객관식 문항 보기
                            <div className="flex items-center flex-wrap gap-4">
                              {Object.entries(answer).map(([key, value]) => {
                                const isSelected =
                                  selectedAnswer === parseInt(key);
                                const isWrong =
                                  isSelected && parseInt(key) !== correct;

                                return (
                                  <div
                                    key={key}
                                    onClick={() => handleShowAnswer(key)}
                                    className={cn(
                                      `${!answer_imageUrl ? 'w-full rounded-full px-4 py-4' : 'w-1/3 py-4 pl-4 rounded-2xl'} flex-grow bg-white flex items-center gap-2 cursor-pointer transition-all duration-200  hover:shadow-black/50 hover:shadow-2xl`,
                                      isWrong &&
                                        'bg-red-100 border-2 border-red-500',
                                      isSelected &&
                                        parseInt(key) === correct &&
                                        'bg-green-100 border-2 border-green-500',
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center text-white',
                                        isWrong
                                          ? 'bg-gradient-to-b from-red-500 to-red-700'
                                          : isSelected &&
                                              parseInt(key) === correct
                                            ? 'bg-gradient-to-b from-green-500 to-green-700'
                                            : 'bg-gradient-to-b from-[#00226e] to-[#001239]',
                                      )}
                                    >
                                      {key}
                                    </span>
                                    {answer_imageUrl ? (
                                      <Image
                                        src={`/api/11_0${key}.jpg`}
                                        alt={`${keyword} 이미지`}
                                        width={400}
                                        height={200}
                                        className="w-full max-w-24 sm:max-w-48 mx-auto rounded-2xl object-cover"
                                        priority={false}
                                      />
                                    ) : (
                                      <span
                                        className={cn(
                                          'text-xl flex-grow',
                                          isWrong && 'text-red-600',
                                          isSelected &&
                                            parseInt(key) === correct &&
                                            'text-green-600',
                                        )}
                                      >
                                        {value}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {answer === null && (
                            <div className="grid grid-cols-2 gap-4">
                              {/* 정답 버튼 보기 */}
                              <Button
                                onClick={handleAnswerA}
                                className="font-bold px-12 py-8 text-white text-2xl bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[50px]"
                              >
                                광주여성팀 정답
                              </Button>
                              <Button
                                onClick={handleAnswerB}
                                className="font-bold px-12 py-8 text-white text-2xl bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[50px]"
                              >
                                도그이어팀 정답
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6 flex flex-col items-center flex-grow">
                          {/* 정답 보기 */}
                          <div className="w-full p-4 bg-white rounded-[50px] shadow flex items-center gap-2">
                            <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-[#00226e] to-[#001239] rounded-full inline-flex items-center justify-center text-white">
                              {correct}
                            </span>
                            {answer && correct && (
                              <span className="text-lg text-center flex-grow">
                                {answer[correct as keyof typeof answer]}
                              </span>
                            )}
                          </div>

                          {/* 문제 해설 */}
                          <div className="text-left w-full flex-grow">
                            {/* 정답 이미지 */}
                            {correct_imageUrl && (
                              <Image
                                src={`/api/${correct_imageUrl}`}
                                alt={`${keyword} 이미지`}
                                width={600}
                                height={400}
                                className="w-full max-h-[50vh]  mx-auto mb-4 rounded-lg object-contain"
                                priority={false}
                              />
                            )}
                            <p>{Comment}</p>
                          </div>

                          {/* 정답 버튼 보기 */}
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              onClick={handleAnswerA}
                              className="font-bold px-12 py-8 text-white text-2xl bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[50px]"
                            >
                              광주여성팀 정답
                            </Button>
                            <Button
                              onClick={handleAnswerB}
                              className="font-bold px-12 py-8 text-white text-2xl bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[50px]"
                            >
                              도그이어팀 정답
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
