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
  // 현재 환경에 따라 base URL 설정
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '');
  
  const res = await fetch(`${baseUrl}/api/api.json`, {
    next: {
      revalidate: 3600 // 1시간마다 재검증
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch questions');
  }

  return res.json();
}
