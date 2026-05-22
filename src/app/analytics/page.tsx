"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [meetings, setMeetings] = useState<Array<{ id: string; member_name: string; created_at: string; summary: Record<string, unknown> | null; coaching: Record<string, unknown> | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("meetings").select("*").not("summary", "is", null).order("created_at", { ascending: false }).then(({ data }) => {
      setMeetings(data || []);
      setLoading(false);
    });
  }, []);

  const totalMeetings = meetings.length;
  const thisMonth = meetings.filter(m => new Date(m.created_at).getMonth() === new Date().getMonth()).length;
  const uniqueMembers = new Set(meetings.map(m => m.member_name)).size;

  // 평균 간격 계산
  let avgInterval: number | null = null;
  if (meetings.length >= 2) {
    const dates = meetings.map(m => new Date(m.created_at).getTime()).sort((a, b) => b - a);
    const totalDays = (dates[0] - dates[dates.length - 1]) / 86400000;
    avgInterval = Math.round(totalDays / (meetings.length - 1));
  }

  // 코칭 점수 추이
  const scores = meetings
    .filter(m => m.coaching && (m.coaching as Record<string, unknown>).question_quality)
    .map(m => {
      const q = (m.coaching as { question_quality?: { open_ended_count?: number; closed_ended_count?: number } })?.question_quality;
      const open = q?.open_ended_count || 0;
      const closed = q?.closed_ended_count || 0;
      const ratio = open + closed > 0 ? Math.round((open / (open + closed)) * 100) : 0;
      return { date: m.created_at, member: m.member_name, openRatio: ratio };
    });

  if (loading) return <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📈 개인 분석</h1>
      <p className="text-gray-600">나의 1on1 활동 현황과 코칭 패턴을 분석합니다.</p>

      {totalMeetings < 3 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">최소 3회 이상의 1on1 분석 후 인사이트가 제공됩니다.</p>
          <p className="text-sm text-gray-400 mt-1">현재: {totalMeetings}회 완료</p>
          <a href="/meetings" className="inline-block mt-4 px-4 py-2 bg-mint-400 text-white rounded-lg text-sm">미팅 분석하러 가기</a>
        </div>
      ) : (
        <>
          {/* 활동 현황 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">누적 1on1</p>
              <p className="text-3xl font-bold text-mint-500">{totalMeetings}</p>
              <p className="text-xs text-gray-500">회</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">이번 달</p>
              <p className="text-3xl font-bold">{thisMonth}</p>
              <p className="text-xs text-gray-500">회</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">평균 주기</p>
              <p className="text-3xl font-bold">{avgInterval || "-"}</p>
              <p className="text-xs text-gray-500">일</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">구성원 수</p>
              <p className="text-3xl font-bold">{uniqueMembers}</p>
              <p className="text-xs text-gray-500">명</p>
            </div>
          </div>

          {/* 코칭 인사이트 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3">💡 코칭 인사이트</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• 1on1을 {avgInterval ? `평균 ${avgInterval}일` : "불규칙하게"} 간격으로 진행하고 있습니다. {avgInterval && avgInterval > 14 ? "간격을 좀 더 줄여보세요." : "좋은 페이스입니다!"}</p>
              <p>• {uniqueMembers}명의 구성원과 1on1을 진행하고 있습니다.</p>
              {scores.length > 0 && (
                <p>• 평균 열린 질문 비율: {Math.round(scores.reduce((a, b) => a + b.openRatio, 0) / scores.length)}% (70% 이상 권장)</p>
              )}
            </div>
          </div>

          {/* 열린 질문 비율 추이 */}
          {scores.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">📊 열린 질문 비율 추이</h3>
              <div className="space-y-2">
                {scores.slice(0, 10).map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">{new Date(s.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</span>
                    <span className="text-xs text-gray-500 w-16">{s.member}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={`h-full rounded-full ${s.openRatio >= 70 ? "bg-green-400" : s.openRatio >= 50 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${s.openRatio}%` }} />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{s.openRatio}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 분석 기록 */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3">📋 최근 분석 기록</h3>
            <div className="space-y-2">
              {meetings.slice(0, 8).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{m.member_name}</p>
                    <p className="text-xs text-gray-500">{new Date(m.created_at).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">분석 완료</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
