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
  try {
    // 서버 사이드에서는 절대 경로로 파일 시스템에서 직접 읽기
    if (typeof window === 'undefined') {
      const questions = require('../../public/api/api.json');
      return questions;
    }
    
    // 클라이언트 사이드에서는 fetch 사용
    const res = await fetch('/api/api.json');
    if (!res.ok) {
      throw new Error('Failed to fetch questions');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}
