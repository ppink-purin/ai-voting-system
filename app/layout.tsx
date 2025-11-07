import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 혁신 발표 투표',
  description: '증권사 AI 혁신 발표 투표 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
