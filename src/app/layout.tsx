import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "문의하기 | Lead Sat",
  description: "서비스에 관심 있으신가요? 정보를 남겨주시면 빠르게 연락드리겠습니다.",
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
