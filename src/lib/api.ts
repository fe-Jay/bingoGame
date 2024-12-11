export interface QuestionType {
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
  } | null;
  correct: number | null;
  Comment: string;
  imageUrl: string;
  answer_imageUrl?: boolean;
  correct_imageUrl?: string;
  bonus?: boolean;
}

export async function getQuestions(): Promise<QuestionType[]> {
  const res = await fetch('http://localhost:3000/api/api.json');
  if (!res.ok) {
    throw new Error('Failed to fetch questions');
  }
  return res.json();
}
