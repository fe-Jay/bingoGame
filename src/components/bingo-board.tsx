'use client';

import { useState, useCallback, type ReactElement } from 'react';
import type { QuestionType } from '@/lib/api';
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

interface ChanceCard {
  id: string;
  description: string;
}

const URL = {
  LINKTREE: 'https://linktr.ee/dogearbook',
  INSTAGRAM: 'https://www.instagram.com/dog_ear_book/',
};

const chanceCards: ChanceCard[] = [
  { id: 'chance1', description: '30초 \n휴대폰 검색 \n찬스' },
  { id: 'chance2', description: '1분간 \n같은 팀 팀원과 상의하기 \n찬스' },
  {
    id: 'chance3',
    description: '팀원 한 명과 \n 상의하기 \n찬스 \n(상대팀 지정)',
  },
  { id: 'chance4', description: '사회자 \nyes or no GPT \n찬스' },
  { id: 'chance5', description: '보기 제���� \n찬스' },
];

interface BingoBoardProps {
  initialQuestions: QuestionType[];
}

const TEAMS = {
  RED: '레드팀',
  GREEN: '그린팀',
} as const;

type BingoTeam = (typeof TEAMS)[keyof typeof TEAMS];
const TEAM_STYLES = {
  [TEAMS.RED]:
    'bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[20px] text-white before:absolute md:before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#ff4d4d] before:to-[#cc0000] before:-z-10',
  [TEAMS.GREEN]:
    'bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[20px] text-white before:absolute md:before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#00cc5e] before:to-[#004d29] before:-z-10',
} as const;

export function BingoBoard({
  initialQuestions,
}: BingoBoardProps): ReactElement {
  const [questions] = useState(() => initialQuestions);
  const [ready, setReady] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType | null>(
    null,
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Map<number, BingoTeam>>(
    new Map(),
  );
  const [winningTeam, setWinningTeam] = useState<BingoTeam | null>(null);
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showChance, setShowChance] = useState(false);
  const [selectedChanceCard, setSelectedChanceCard] =
    useState<ChanceCard | null>(null);
  const [shuffledChanceCards, setShuffledChanceCards] = useState<ChanceCard[]>(
    [],
  );

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

  const handleCellClick = useCallback((question: QuestionType) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    setShowQuestion(false);
    setSelectedAnswer(null);
    setReady(false);
    setShowChance(false);
  }, []);

  const handleShowAnswer = useCallback(
    (key: string) => {
      const numKey = parseInt(key);
      setSelectedAnswer(numKey);
      setShowAnswer(numKey === correct);
    },
    [correct],
  );

  const handleAnswer = useCallback(
    (team: BingoTeam) => {
      if (selectedQuestion) {
        const questionIndex = questions.findIndex(
          (q) => q.keyword === selectedQuestion.keyword,
        );
        if (questionIndex !== -1) {
          setSelectedCells((prev) => {
            const newMap = new Map(prev);
            newMap.set(questionIndex, team);
            checkBingo(newMap);
            return newMap;
          });
        }
        setSelectedQuestion(null);
        setShowQuestion(false);
      }
    },
    [selectedQuestion, questions],
  );

  const checkBingo = useCallback((cells: Map<number, BingoTeam>) => {
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
      if (colors.every((color) => color === TEAMS.RED)) {
        setWinningTeam(TEAMS.RED);
        setWinningLines([line]);
        return;
      }
      if (colors.every((color) => color === TEAMS.GREEN)) {
        setWinningTeam(TEAMS.GREEN);
        setWinningLines([line]);
        return;
      }
    }
  }, []);

  // 팀별 정답 클릭 시 호출
  const handleShowChance = () => {
    const shuffled = [...chanceCards].sort(() => 0.5 - Math.random());
    setShuffledChanceCards(shuffled);
    setShowChance(true);
  };

  // 찬스 카드 선택
  const handleSelectChanceCard = (card: ChanceCard) => {
    setSelectedChanceCard(card);
  };

  const handleAnswerA = () => handleAnswer(TEAMS.RED);
  const handleAnswerB = () => handleAnswer(TEAMS.GREEN);

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

  const handleShowQuestion = useCallback(() => {
    setShowQuestion(true);
  }, []);

  return (
    <div className="w-full h-full bg-[url('/bg.png')] bg-no-repeat bg-center bg-cover min-h-screen p-2 lg:p-8 relative flex flex-col items-center justify-center">
      <AnimatePresence>
        {winningTeam && (
          <>
            {/* 파죽 파티클 효과 */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                className={`absolute w-4 h-4 ${
                  winningTeam === TEAMS.RED
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
                className="text-4xl lg:text-6xl !leading-[1.25] font-bold w-full max-w-[60vw] text-white px-12 py-12 rounded-2xl text-center opacity-95"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', bounce: 0.4 }}
                style={{
                  backdropFilter: 'blur(8px)',
                  backgroundColor:
                    winningTeam === TEAMS.RED ? '#ed1c24' : '#00a14b',
                }}
              >
                <p>🎉</p>
                {winningTeam === TEAMS.RED ? TEAMS.RED : TEAMS.GREEN}
                <p>BINGO!</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="max-w-screen-2xl w-full mx-auto z-10 px-4 md:px-8 relative pb-20 lg:pb-0pb-0pb-0">
        <h1 className="sr-only">도그이어 빙고 게임</h1>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* 로고 */}
          <div className="flex items-center w-1/2 mx-auto lg:relative">
            <Image
              src="/cover.svg"
              alt="cover"
              width={200}
              height={200}
              className="w-full max-w-[300px] md:max-w-[400px] mx-auto animate-float"
              priority
            />
            <div className="w-full md:px-2 lg:px-6 absolute bottom-0 right-0 flex flex-col md:flex-row items-center gap-2 justify-between">
              <span className="text-[10px] md:text-xs text-white/60">
                © 2024{' '}
                <a
                  href={URL.INSTAGRAM}
                  className="hover:text-white transition-colors"
                >
                  DOGEAR
                </a>
                . All rights reserved.
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={URL.LINKTREE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3 h-3 md:w-4 md:h-4"
                  >
                    <path d="M7.5 21.5h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm0-13h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm13 13h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1zm0-13h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1z" />
                  </svg>
                </a>
                <a
                  href={URL.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3 h-3 md:w-4 md:h-4"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* 빙고 게임 보드 */}
          <div
            className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-4 w-full"
            data-type="bingo-board"
          >
            {questions.map((question, index) => (
              <motion.div
                className="relative aspect-[4/3]"
                key={`${question.keyword}-${index}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleCellClick(question)}
                  className={cn(`
                    relative
                    w-full h-full p-0
                    flex items-center justify-center text-center font-bold
                    text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl
                    hover:scale-102
                    ${
                      selectedCells.get(index) === TEAMS.RED
                        ? TEAM_STYLES[TEAMS.RED]
                        : selectedCells.get(index) === TEAMS.GREEN
                          ? TEAM_STYLES[TEAMS.GREEN]
                          : 'bg-gradient-to-b from-[#666666] to-black text-white before:absolute before:inset-[-2px] sm:before:inset-[-3px] md:before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#000] before:to-[#111] before:-z-10'
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
              setReady(false);
              setShowChance(false);
            }
          }}
        >
          <DialogDescription className="sr-only">
            빙고 게임의 문제와 답을 확인하고 팀별로 정답을 선택할 수 있는
            대화상자입니다.
          </DialogDescription>
          <DialogContent className="max-w-[90vw] md:max-w-[1240px] bg-gradient-to-b from-white/80 from-0% via-gray-300/80 via-60% to-white to-100% backdrop-blur-[80px] border border-white/20 rounded-[20px] md:rounded-[40px] p-4 md:p-8">
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
                  <DialogTitle className="flex flex-col items-center gap-4 text-2xl md:text-4xl font-bold text-red-600">
                    기쁨의 환호를 질러주세요!
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-2xl mx-auto mt-4 md:mt-8">
                  {/* 정답 버튼 보기 */}
                  <Button
                    onClick={handleAnswerA}
                    className="font-bold px-4 md:px-12 py-4 md:py-8 text-white text-lg md:text-2xl bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[30px] md:rounded-[50px]"
                  >
                    {TEAMS.RED} 정답
                  </Button>
                  <Button
                    onClick={handleAnswerB}
                    className="font-bold px-4 md:px-12 py-4 md:py-8 text-white text-lg md:text-2xl bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[30px] md:rounded-[50px]"
                  >
                    {TEAMS.GREEN} 정답
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
                {/* 왼쪽: 책 정보 */}
                <div className="flex-shrink-0 w-full md:w-[40%] max-w-[400px] text-center">
                  <DialogHeader className="mb-4 md:mb-6">
                    <DialogTitle className="flex flex-col items-center gap-2 md:gap-4">
                      <div className="bg-gradient-to-b from-[#00226e] to-[#001239] rounded-full text-white px-4 md:px-8 py-2 md:py-3 block text-center text-base md:text-xl">
                        {month}
                      </div>
                      <div className="mt-2 md:mt-4">
                        {imageUrl ? (
                          <Image
                            src={`/book/${imageUrl}`}
                            alt={`${keyword} 이미지`}
                            width={400}
                            height={200}
                            className="w-full max-w-24 hidden md:block md:max-w-56 h-auto mx-auto rounded-lg object-cover"
                            priority={false}
                          />
                        ) : (
                          <div className="w-full h-32 md:h-48 bg-gray-200 rounded-lg animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm md:text-xl font-bold text-center mt-2">
                        {book}
                      </p>
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
                      className="w-[160px] md:w-[300px] h-[200px] md:h-[400px] cursor-pointer hover:scale-105 transition-transform"
                      priority={false}
                    />
                  </div>
                )}

                {/* 오른쪽: 문제 답안 */}
                {showQuestion && (
                  <div className="flex-1 flex flex-col items-stretch h-full">
                    {/* 문제 보기 */}
                    <Image
                      src="/chance.svg"
                      alt="찬스 버튼"
                      width={160}
                      height={160}
                      onClick={handleShowChance}
                      className="absolute top-[-30px] md:top-[-60px] right-[-30px] md:right-[-60px] w-24 h-24 md:w-40 md:h-40 cursor-pointer animate-bounce duration-[30000ms] linear infinite"
                      priority={false}
                    />

                    {!showAnswer ? (
                      <div className="space-y-4 md:space-y-6 text-center">
                        <DialogDescription className="text-base md:text-3xl font-semibold text-left leading-relaxed md:leading-10">
                          {question}
                        </DialogDescription>

                        {/* 문제 이미지 */}
                        {answer && (
                          // ���관식 문항 보기
                          <div className="flex items-center flex-wrap gap-2 md:gap-4">
                            {Object.entries(answer).map(([key, value]) => {
                              const isSelected =
                                selectedAnswer === parseInt(key);
                              const isWrong =
                                isSelected && parseInt(key) !== correct;

                              return (
                                <div
                                  key={key}
                                  onClick={() => {
                                    if (!ready) {
                                      setReady(true);
                                    } else {
                                      handleShowAnswer(key);
                                    }
                                  }}
                                  className={cn(
                                    `${!answer_imageUrl ? 'w-full rounded-full px-2 md:px-4 py-2 md:py-4' : 'w-1/3 py-2 md:py-4 pl-2 md:pl-4 rounded-xl md:rounded-2xl'} flex-grow bg-white flex items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:shadow-black/50 hover:shadow-2xl`,
                                    isWrong &&
                                      'bg-red-100 border-2 border-red-500',
                                    isSelected &&
                                      parseInt(key) === correct &&
                                      'bg-green-100 border-2 border-green-500',
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full inline-flex items-center justify-center text-white',
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
                                      className="w-full max-w-16 sm:max-w-24 md:max-w-48 mx-auto rounded-xl md:rounded-2xl object-cover"
                                      priority={false}
                                    />
                                  ) : (
                                    <span
                                      className={cn(
                                        'text-base md:text-xl flex-grow',
                                        isWrong && 'text-red-600',
                                        isSelected &&
                                          parseInt(key) === correct &&
                                          'text-green-600',
                                      )}
                                    >
                                      {ready ? value : '???'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {answer === null && (
                          <div className="grid grid-cols-2 gap-2 md:gap-4">
                            {/* 정답 버튼 보기 */}
                            <Button
                              onClick={handleAnswerA}
                              className="font-bold px-4 md:px-12 py-4 md:py-8 text-white text-lg md:text-2xl bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[30px] md:rounded-[50px]"
                            >
                              {TEAMS.RED} 정답
                            </Button>
                            <Button
                              onClick={handleAnswerB}
                              className="font-bold px-4 md:px-12 py-4 md:py-8 text-white text-lg md:text-2xl bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[30px] md:rounded-[50px]"
                            >
                              {TEAMS.GREEN} 정답
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6 flex flex-col items-center flex-grow">
                        {/* 정답 보기 */}
                        <div className="w-full p-1 md:p-2 bg-white rounded-[50px] shadow flex items-center gap-2">
                          <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-b from-[#00226e] to-[#001239] rounded-full inline-flex items-center justify-center text-white">
                            {correct}
                          </span>
                          {answer && correct && (
                            <span className="text-sm md:text-lg text-center flex-grow">
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
                              className="w-full max-h-[40vh] mx-auto mb-4 rounded-lg object-contain"
                              priority={false}
                            />
                          )}
                          <p className="text-sm md:text-base">{Comment}</p>
                        </div>

                        {/* 정답 버튼 보기 */}
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            onClick={handleAnswerA}
                            className="font-bold px-4 md:px-12 py-4 md:py-8 text-white text-lg md:text-2xl bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[30px] md:rounded-[50px]"
                          >
                            {TEAMS.RED} 정답
                          </Button>
                          <Button
                            onClick={handleAnswerB}
                            className="font-bold px-4 md:px-12 py-4 md:py-8 text-white text-lg md:text-2xl bg-gradient-to-b from-[#00a14b] to-[#003b1b] rounded-[30px] md:rounded-[50px]"
                          >
                            {TEAMS.GREEN} 정답
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        {showChance && (
          <Dialog
            open={showChance}
            onOpenChange={(open) => {
              if (!open) {
                setShowChance(false);
                setSelectedChanceCard(null);
              }
            }}
          >
            <DialogDescription className="sr-only">
              랜덤 찬스 카드 선택.
            </DialogDescription>
            <DialogContent className="max-w-[90vw] md:max-w-[980px] bg-transparent p-4 md:p-8 z-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center mb-4 md:mb-8">
                  <Image
                    src={'/random-title.svg'}
                    alt="chance random card"
                    width={600}
                    height={200}
                    className="w-full max-w-[200px] md:max-w-[600px] h-[100px] md:h-[200px] mx-auto"
                    priority={false}
                  />
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
                {shuffledChanceCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleSelectChanceCard(card)}
                      className={cn(`
                        w-full h-full text-[#001239] aspect-[280/378] bg-cover bg-center shadow-transparent relative
                        ${selectedChanceCard?.id === card.id ? 'bg-[url("/random-card-front.svg")]' : 'bg-[url("/random-card-back.svg")]'}
                      `)}
                    >
                      {selectedChanceCard?.id === card.id ? (
                        <p className="text-xs md:text-xl whitespace-pre-wrap break-words px-2 md:px-4">
                          {card.description}
                        </p>
                      ) : (
                        <p className="text-2xl md:text-4xl font-bold absolute bottom-[25%]">
                          {index + 1}
                        </p>
                      )}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </section>
    </div>
  );
}
