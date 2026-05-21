"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AnalysisResult {
  discussion_topics?: string[];
  action_items?: Array<{ description: string; assignee_role: string; due_estimate: string }>;
  next_meeting_notes?: string;
  mood?: string;
}

interface CoachingResult {
  question_quality?: {
    open_ended_count: number;
    closed_ended_count: number;
    good_questions: Array<{ question: string; reason: string }>;
    improve_questions: Array<{ question: string; suggestion: string }>;
  };
  emotion_flow?: Array<{ phase: string; emotion: string; evidence: string }>;
  coaching_feedback?: {
    good_points: Array<{ point: string; evidence: string }>;
    improvements: Array<{ point: string; suggestion: string; evidence: string }>;
  };
  next_meeting_suggestions?: string[];
}

interface Meeting {
  id: string;
  member_name: string;
  created_at: string;
  transcript: string;
  summary: AnalysisResult | null;
  coaching: CoachingResult | null;
}

export default function MeetingsPage() {
  const [transcript, setTranscript] = useState("");
  const [memberName, setMemberName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState("");
  const [summary, setSummary] = useState<AnalysisResult | null>(null);
  const [coaching, setCoaching] = useState<CoachingResult | null>(null);
  const [tab, setTab] = useState<"summary" | "coaching">("summary");
  const [history, setHistory] = useState<Meeting[]>([]);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const { data } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTranscript(text);
  }

  async function handleAnalyze() {
    if (!transcript.trim()) return;
    setAnalyzing(true);
    setSummary(null);
    setCoaching(null);

    try {
      // 1. 요약 분석
      setStep("기록지 생성 중... (AI가 대화를 분석합니다)");
      const summaryRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          type: "summary",
          leaderName: leaderName || "리더",
          memberName: memberName || "구성원",
        }),
      });
      const summaryData = await summaryRes.json();
      if (summaryData.error) throw new Error(summaryData.error);
      setSummary(summaryData.result);

      // 2. 코칭 피드백
      setStep("코칭 피드백 생성 중... (질문 품질, 감정 흐름 분석)");
      const coachingRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, type: "coaching" }),
      });
      const coachingData = await coachingRes.json();
      if (!coachingData.error) setCoaching(coachingData.result);

      // 3. DB 저장
      setStep("결과 저장 중...");
      await supabase.from("meetings").insert({
        member_name: memberName || "구성원",
        transcript,
        summary: summaryData.result,
        coaching: coachingData.error ? null : coachingData.result,
      });
      await loadHistory();

      setStep("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "분석 실패";
      setStep(`오류: ${message}`);
    } finally {
      setAnalyzing(false);
    }
  }

  function viewMeeting(meeting: Meeting) {
    setViewingMeeting(meeting);
    setSummary(meeting.summary);
    setCoaching(meeting.coaching);
    setTranscript(meeting.transcript);
    setMemberName(meeting.member_name);
  }

  const currentSummary = summary;
  const currentCoaching = coaching;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">📝 미팅 분석</h1>
      <p className="text-gray-600">녹취록을 입력하면 AI가 요약, 액션 아이템, 코칭 피드백을 생성합니다.</p>

      {/* 입력 영역 */}
      {!currentSummary && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">리더 이름</label>
              <input
                type="text"
                placeholder="예: 김팀장"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">구성원 이름</label>
              <input
                type="text"
                placeholder="예: 이개발"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400"
              />
            </div>
          </div>

          {/* 입력 모드 선택 */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode("text")}
              className={`px-3 py-1.5 text-sm rounded border transition-all ${inputMode === "text" ? "border-mint-400 bg-mint-50 text-mint-600" : "border-gray-200"}`}
            >
              텍스트로 직접 입력
            </button>
            <button
              onClick={() => setInputMode("file")}
              className={`px-3 py-1.5 text-sm rounded border transition-all ${inputMode === "file" ? "border-mint-400 bg-mint-50 text-mint-600" : "border-gray-200"}`}
            >
              STT 결과 파일 업로드
            </button>
          </div>

          {inputMode === "text" ? (
            <>
              <p className="text-sm text-gray-500">화자 라벨을 포함해서 입력하세요. 형식: [리더] 내용 / [구성원] 내용</p>
              <textarea
                className="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mint-400 resize-y"
                placeholder={"[리더] 요즘 업무 어때요?\n[구성원] 괜찮아요, 새 프로젝트가 재밌어요.\n[리더] 어떤 부분이 가장 재밌어요?\n[구성원] 아키텍처 설계하는 게 좋아요."}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">STT 도구(Clova Note, Otter 등)에서 변환한 텍스트 파일(.txt)을 업로드하세요.</p>
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="text-sm"
              />
              {transcript && <p className="text-xs text-green-600">✓ 파일 내용이 로드되었습니다 ({transcript.length}자)</p>}
            </>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !transcript.trim()}
            className="w-full py-3 bg-mint-400 hover:bg-mint-500 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {analyzing ? "분석 중..." : "AI 분석 시작"}
          </button>

          {step && (
            <div className="flex items-center gap-2 p-3 bg-mint-50 rounded-lg">
              {analyzing && <div className="w-4 h-4 border-2 border-mint-400 border-t-transparent rounded-full animate-spin" />}
              <p className="text-sm text-mint-700">{step}</p>
            </div>
          )}
        </div>
      )}

      {/* 결과 영역 */}
      {currentSummary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("summary")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "summary" ? "bg-mint-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                결과 기록지
              </button>
              {currentCoaching && (
                <button
                  onClick={() => setTab("coaching")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === "coaching" ? "bg-mint-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  코칭 피드백
                </button>
              )}
            </div>
            <button
              onClick={() => { setSummary(null); setCoaching(null); setTranscript(""); setViewingMeeting(null); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              새 분석하기 →
            </button>
          </div>

          {tab === "summary" && <SummaryView data={currentSummary} />}
          {tab === "coaching" && currentCoaching && <CoachingView data={currentCoaching} />}
        </div>
      )}

      {/* 히스토리 */}
      {history.length > 0 && !currentSummary && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">최근 분석 기록</h3>
          {history.map((m) => (
            <button
              key={m.id}
              onClick={() => viewMeeting(m)}
              className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-mint-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{m.member_name}과의 1on1</span>
                <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleDateString("ko-KR")}</span>
              </div>
              {m.summary?.discussion_topics && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {m.summary.discussion_topics.slice(0, 2).join(" · ")}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryView({ data }: { data: AnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* 논의 주제 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">논의 주제</h3>
        <ul className="space-y-2">
          {data.discussion_topics?.map((t, i) => (
            <li key={i} className="text-sm pl-3 border-l-2 border-mint-300 text-gray-700">{t}</li>
          ))}
        </ul>
      </div>

      {/* 액션 아이템 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">액션 아이템</h3>
        <div className="space-y-2">
          {data.action_items?.map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xs px-2 py-0.5 rounded bg-mint-100 text-mint-700 font-medium shrink-0">
                {a.assignee_role === "leader" ? "리더" : "구성원"}
              </span>
              <div>
                <p className="text-sm text-gray-800">{a.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">기한: {a.due_estimate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 분위기 */}
      {data.mood && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">분위기</h3>
          <p className="text-sm text-gray-700">{data.mood}</p>
        </div>
      )}

      {/* 다음 미팅 참고 */}
      {data.next_meeting_notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">다음 미팅 참고</h3>
          <p className="text-sm text-gray-700">{data.next_meeting_notes}</p>
        </div>
      )}
    </div>
  );
}

function CoachingView({ data }: { data: CoachingResult }) {
  return (
    <div className="space-y-4">
      {/* 질문 품질 */}
      {data.question_quality && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">질문 품질 분석</h3>
          <div className="flex gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.question_quality.open_ended_count}</p>
              <p className="text-xs text-gray-600">열린 질문</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{data.question_quality.closed_ended_count}</p>
              <p className="text-xs text-gray-600">닫힌 질문</p>
            </div>
          </div>
          {data.question_quality.good_questions?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">좋은 질문</p>
              {data.question_quality.good_questions.map((q, i) => (
                <div key={i} className="text-sm pl-3 border-l-2 border-green-300 mb-2">
                  <p className="italic text-gray-700">"{q.question}"</p>
                  <p className="text-xs text-gray-500">{q.reason}</p>
                </div>
              ))}
            </div>
          )}
          {data.question_quality.improve_questions?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">개선 가능한 질문</p>
              {data.question_quality.improve_questions.map((q, i) => (
                <div key={i} className="text-sm pl-3 border-l-2 border-orange-300 mb-2">
                  <p className="italic text-gray-700">"{q.question}"</p>
                  <p className="text-xs text-blue-600">→ {q.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 감정 흐름 */}
      {data.emotion_flow && data.emotion_flow.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">감정 흐름</h3>
          <div className="space-y-2">
            {data.emotion_flow.map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 shrink-0">{e.phase}</span>
                <div>
                  <span className="font-medium text-gray-800">{e.emotion}</span>
                  {e.evidence && <p className="text-xs text-gray-500 italic mt-0.5">"{e.evidence}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 코칭 피드백 */}
      {data.coaching_feedback && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">코칭 피드백</h3>
          {data.coaching_feedback.good_points?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 mb-2">✅ 잘한 점</p>
              {data.coaching_feedback.good_points.map((p, i) => (
                <div key={i} className="text-sm pl-3 border-l-2 border-green-300 mb-2">
                  <p className="text-gray-800">{p.point}</p>
                  <p className="text-xs text-gray-500 italic">"{p.evidence}"</p>
                </div>
              ))}
            </div>
          )}
          {data.coaching_feedback.improvements?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-orange-700 mb-2">💡 개선 포인트</p>
              {data.coaching_feedback.improvements.map((p, i) => (
                <div key={i} className="text-sm pl-3 border-l-2 border-orange-300 mb-2">
                  <p className="text-gray-800">{p.point}</p>
                  <p className="text-xs text-blue-600">→ {p.suggestion}</p>
                  <p className="text-xs text-gray-500 italic">"{p.evidence}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 다음 미팅 제안 */}
      {data.next_meeting_suggestions && data.next_meeting_suggestions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-2">다음 1on1에서 시도해볼 것</h3>
          <ul className="space-y-1">
            {data.next_meeting_suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-mint-500">▸</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
