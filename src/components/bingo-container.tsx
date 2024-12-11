import { getQuestions } from '@/lib/api';
import { BingoBoard } from './bingo-board';

export async function BingoContainer() {
  // 서버 컴포넌트에서 데이터 페칭
  const questions = await getQuestions();

  // 데이터를 랜덤하게 섞어서 25개만 선택
  const shuffledQuestions = [...questions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 25);

  return <BingoBoard initialQuestions={shuffledQuestions} />;
}
