import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '빙고 게임',
  description: '책책책! 빙고 게임',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-gmarket overflow-hidden relative">{children}</body>
    </html>
  );
}
