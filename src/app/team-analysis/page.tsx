"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface TeamAnalysisResult {
  team_health_score: number;
  summary: string;
  common_themes: Array<{ theme: string; frequency: string; suggested_action: string }>;
  alerts: Array<{ severity: string; message: string; recommendation: string }>;
  strengths: string[];
  recommendations: string[];
}

export default function TeamAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TeamAnalysisResult | null>(null);
  const [meetingCount, setMeetingCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    const { count: mc } = await supabase.from("meetings").select("*", { count: "exact", head: true }).not("summary", "is", null);
    const { count: memC } = await supabase.from("members").select("*", { count: "exact", head: true });
    setMeetingCount(mc || 0);
    setMemberCount(memC || 0);
  }

  async function runAnalysis() {
    setLoading(true);
    try {
      const { data: meetings } = await supabase.from("meetings").select("summary, member_name").not("summary", "is", null).order("created_at", { ascending: false }).limit(20);

      const summaries = (meetings || []).map((m) => m.summary);

      const res = await fetch("/api/team-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingSummaries: summaries, teamSize: memberCount }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "분석 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📊 팀 분석</h1>
      <p className="text-gray-600">팀 전체의 1on1 데이터를 집계하여 건강 상태를 진단합니다.</p>

      {/* 현황 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">구성원</p>
          <p className="text-3xl font-bold text-mint-500">{memberCount}</p>
          <p className="text-xs text-gray-500">명</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500">분석된 미팅</p>
          <p className="text-3xl font-bold">{meetingCount}</p>
          <p className="text-xs text-gray-500">건</p>
        </div>
      </div>

      {!result ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
          {meetingCount < 3 ? (
            <>
              <p className="text-gray-500">분석하려면 최소 3건 이상의 미팅 분석 데이터가 필요합니다.</p>
              <p className="text-sm text-gray-400">현재: {meetingCount}건</p>
            </>
          ) : (
            <>
              <p className="text-gray-700">팀 분석을 시작할 준비가 되었습니다.</p>
              <p className="text-sm text-gray-500">{meetingCount}건의 미팅 데이터를 기반으로 분석합니다.</p>
              <button onClick={runAnalysis} disabled={loading} className="px-6 py-3 bg-mint-400 hover:bg-mint-500 disabled:bg-gray-300 text-white font-medium rounded-lg">
                {loading ? "AI 분석 중..." : "팀 분석 시작"}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 건강 점수 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-xs text-gray-500">팀 건강 점수</p>
            <p className={`text-5xl font-bold ${result.team_health_score >= 7 ? "text-green-500" : result.team_health_score >= 5 ? "text-yellow-500" : "text-red-500"}`}>
              {result.team_health_score}<span className="text-lg text-gray-400">/10</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">{result.summary}</p>
          </div>

          {/* 알림 */}
          {result.alerts && result.alerts.length > 0 && (
            <div className="space-y-2">
              {result.alerts.map((a, i) => (
                <div key={i} className={`p-4 rounded-xl border ${a.severity === "high" ? "bg-red-50 border-red-200" : a.severity === "medium" ? "bg-yellow-50 border-yellow-200" : "bg-blue-50 border-blue-200"}`}>
                  <p className="text-sm font-medium">{a.severity === "high" ? "🚨" : a.severity === "medium" ? "⚠️" : "ℹ️"} {a.message}</p>
                  <p className="text-xs text-gray-600 mt-1">→ {a.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* 공통 주제 */}
          {result.common_themes && result.common_themes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">📋 공통 주제</h3>
              {result.common_themes.map((t, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t.theme}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${t.frequency === "높음" ? "bg-red-100 text-red-700" : t.frequency === "중간" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.frequency}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">→ {t.suggested_action}</p>
                </div>
              ))}
            </div>
          )}

          {/* 강점 & 권장사항 */}
          <div className="grid grid-cols-2 gap-4">
            {result.strengths && result.strengths.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-green-700 mb-2">💪 팀 강점</h3>
                {result.strengths.map((s, i) => (
                  <p key={i} className="text-sm text-gray-700 flex items-start gap-2 mb-1"><span className="text-green-500">▸</span>{s}</p>
                ))}
              </div>
            )}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-blue-700 mb-2">💡 개선 권장</h3>
                {result.recommendations.map((r, i) => (
                  <p key={i} className="text-sm text-gray-700 flex items-start gap-2 mb-1"><span className="text-blue-500">▸</span>{r}</p>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setResult(null)} className="text-sm text-gray-500 hover:text-gray-700">← 다시 분석하기</button>
        </div>
      )}
    </div>
  );
}
