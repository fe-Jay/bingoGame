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

const chanceCards: ChanceCard[] = [
  { id: 'chance1', description: '30초 \n휴대폰 검색 \n찬스' },
  { id: 'chance2', description: '1분간 \n같은 팀 팀원과 상의하기 \n찬스' },
  {
    id: 'chance3',
    description: '팀원 한 명과 \n 상의하기 \n찬스 \n(상대팀 지정)',
  },
  { id: 'chance4', description: '사회자 \nyes or no GPT \n찬스' },
  { id: 'chance5', description: '보기 제거 \n찬스' },
];

interface BingoBoardProps {
  initialQuestions: QuestionType[];
}

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
  const [selectedCells, setSelectedCells] = useState<
    Map<number, '광주여성팀' | '도그이어팀'>
  >(new Map());
  const [winningTeam, setWinningTeam] = useState<
    '광주여성팀' | '도그이어팀' | null
  >(null);
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
    (team: '광주여성팀' | '도그이어팀') => {
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

  const checkBingo = useCallback(
    (cells: Map<number, '광주여성팀' | '도그이어팀'>) => {
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
        if (colors.every((color) => color === '광주여성팀')) {
          setWinningTeam('광주여성팀');
          setWinningLines([line]);
          return;
        }
        if (colors.every((color) => color === '도그이어팀')) {
          setWinningTeam('도그이어팀');
          setWinningLines([line]);
          return;
        }
      }
    },
    [],
  );

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

  const handleAnswerA = () => handleAnswer('광주여성팀');
  const handleAnswerB = () => handleAnswer('도그이어팀');

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
                  winningTeam === '광주여성팀'
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
                    winningTeam === '광주여성팀' ? '#ed1c24' : '#00a14b',
                }}
              >
                <p>🎉</p>
                {winningTeam === '광주여성팀' ? '광주여성팀' : '도그이어팀'}
                <p>BINGO!</p>
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
                      selectedCells.get(index) === '광주여성팀'
                        ? 'bg-gradient-to-b from-[#ed1c24] to-[#870f14] rounded-[20px] text-white before:absolute before:inset-[-4px] before:rounded-[20px] before:bg-gradient-to-b before:from-[#ff4d4d] before:to-[#cc0000] before:-z-10'
                        : selectedCells.get(index) === '도그이어팀'
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
              setReady(false);
              setShowChance(false);
            }
          }}
        >
          <DialogDescription className="sr-only">
            빙고 게임의 문제와 답을 확인하고 팀별로 정답을 선택할 수 있는
            대화상자입니다.
          </DialogDescription>
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
                        {imageUrl ? (
                          <Image
                            src={`/book/${imageUrl}`}
                            alt={`${keyword} 이미지`}
                            width={400}
                            height={200}
                            className="w-full max-w-48 h-auto mx-auto rounded-lg object-cover"
                            priority={false}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse" />
                        )}
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
                      className="w-[300px] h-[400px] cursor-pointer hover:scale-105 transition-transform"
                      priority={false}
                    />
                  </div>
                )}
                {/* 오른쪽: 문제 답안 */}
                {showQuestion && (
                  <div className="flex-1">
                    <div className="space-y-6">
                      {/* 문제 보기 */}
                      <div className="w-full h-full">
                        <Image
                          src="/chance.svg"
                          alt="찬스 버튼"
                          width={160}
                          height={160}
                          onClick={handleShowChance}
                          className="absolute top-[-60px] right-[-60px] w-40 h-40 cursor-pointer animate-bounce duration-[30000ms] linear infinite"
                          priority={false}
                        />
                      </div>

                      {!showAnswer ? (
                        <div className="space-y-6 text-center">
                          <DialogDescription className="text-2xl font-semibold text-left leading-10">
                            {question}
                          </DialogDescription>

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
                                    onClick={() => {
                                      if (!ready) {
                                        setReady(true);
                                      } else {
                                        handleShowAnswer(key);
                                      }
                                    }}
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
                                        {ready ? value : '???'}
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
                                className="w-full max-h-[40vh] mx-auto mb-4 rounded-lg object-contain"
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
            <DialogContent className="max-w-[90vw] md:max-w-[980px] bg-transparent p-8 z-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center mb-8">
                  <Image
                    src={'/random-title.svg'}
                    alt="chance random card"
                    width={600}
                    height={200}
                    className="w-3xl h-[200px] mx-auto"
                    priority={false}
                  />
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-5 gap-4">
                {shuffledChanceCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
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
                        <p className="text-xl whitespace-pre-wrap break-words">
                          {card.description}
                        </p>
                      ) : (
                        <p className="text-4xl font-bold absolute bottom-[25%]">
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
