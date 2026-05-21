import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1on1 Agent Lite",
  description: "AI 기반 1on1 미팅 어시스턴트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
          <a href="/" className="text-lg font-bold text-mint-600">1on1 Agent</a>
          <a href="/meetings" className="text-sm text-gray-600 hover:text-mint-600">미팅 분석</a>
          <a href="/members" className="text-sm text-gray-600 hover:text-mint-600">구성원 관리</a>
          <a href="/guide" className="text-sm text-gray-600 hover:text-mint-600">1on1 가이드</a>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
