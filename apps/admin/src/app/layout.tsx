import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "관리자 | Lead Sat",
  description: "리드 관리 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
