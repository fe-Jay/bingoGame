import { BingoContainer } from '@/components/bingo-container';
import { Suspense } from 'react';

export default function BingoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BingoContainer />
    </Suspense>
  );
}
