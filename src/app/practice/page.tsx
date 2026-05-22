"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CATEGORIES = [
  { icon: "🔥", label: "동기/몰입", context: "구성원의 동기 부족, 몰입 저하" },
  { icon: "💪", label: "역량/실행", context: "역량 부족, 업무 실행력 이슈" },
  { icon: "🤝", label: "관계/신뢰", context: "팀원 간 갈등, 신뢰 문제" },
  { icon: "📈", label: "성과/성장", context: "성과 부진, 성장 정체" },
  { icon: "🔄", label: "변화/잔류", context: "이직 의사, 조직 변화 적응" },
  { icon: "🔋", label: "번아웃/에너지", context: "번아웃, 에너지 고갈" },
  { icon: "🚀", label: "승진/경력", context: "승진 기대, 커리어 전환 고민" },
  { icon: "💬", label: "커뮤니/갈등", context: "소통 문제, 의견 충돌" },
];

const JOB_OPTIONS = ["개발 / 엔지니어링", "프로덕트 / 기획", "디자인", "데이터 / AI", "마케팅", "사업 / 영업", "운영 / CX", "경영지원"];
const YEARS_OPTIONS = ["1년 미만", "1년~3년", "3년~5년", "5년 이상", "10년 이상"];
const TRAITS = ["적극적", "내향적", "논리적", "감정적", "신중한", "즉흥적"];

export default function PracticePage() {
  const [phase, setPhase] = useState<"setup" | "chat" | "feedback">("setup");
  const [personaSeed, setPersonaSeed] = useState({ role: "개발 / 엔지니어링", years: "3년~5년", personality: "", current_issue: "", relationship: "보통" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Record<string, unknown> | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setSending(true);
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "chat", personaSeed, messages, userInput: userMsg }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ 응답 실패. 다시 시도해주세요." }]);
    } finally {
      setSending(false);
    }
  }

  async function handleEnd() {
    if (messages.length < 4) { alert("최소 2턴 이상 대화 후 종료할 수 있습니다."); return; }
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feedback", personaSeed, messages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFeedback(data.result);
      setPhase("feedback");
    } catch {
      alert("피드백 생성 실패");
    } finally {
      setFeedbackLoading(false);
    }
  }

  function startChat(category?: string) {
    if (category) {
      setPersonaSeed({ ...personaSeed, current_issue: category });
    }
    setPhase("chat");
  }

  function reset() {
    setPhase("setup");
    setMessages([]);
    setFeedback(null);
    setPersonaSeed({ role: "개발 / 엔지니어링", years: "3년~5년", personality: "", current_issue: "", relationship: "보통" });
  }

  // ─── Setup Phase ───
  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">🎯 실전 연습</h1>
        <p className="text-gray-600">AI 구성원과 1on1 시뮬레이션을 연습합니다. 대화 후 코칭 피드백을 받을 수 있습니다.</p>

        {/* 빠른 시작 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold mb-3">⚡ 카테고리 선택으로 바로 시작</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.label} onClick={() => startChat(cat.context)} className="p-3 rounded-lg border border-gray-200 hover:border-mint-300 hover:bg-mint-50 text-left transition-all">
                <span className="text-lg">{cat.icon}</span>
                <p className="text-xs font-medium mt-1">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 커스텀 설정 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-sm font-semibold">🎯 맞춤 설정</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">직무</label>
              <select value={personaSeed.role} onChange={(e) => setPersonaSeed({ ...personaSeed, role: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {JOB_OPTIONS.map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">연차</label>
              <select value={personaSeed.years} onChange={(e) => setPersonaSeed({ ...personaSeed, years: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {YEARS_OPTIONS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">성향 (복수 선택)</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {TRAITS.map((t) => (
                <button key={t} onClick={() => setPersonaSeed({ ...personaSeed, personality: personaSeed.personality.includes(t) ? personaSeed.personality.replace(t, "").trim() : `${personaSeed.personality} ${t}`.trim() })} className={`px-2 py-1 rounded text-xs border transition-all ${personaSeed.personality.includes(t) ? "border-mint-400 bg-mint-50 text-mint-600" : "border-gray-200"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">상황/고민</label>
            <textarea value={personaSeed.current_issue} onChange={(e) => setPersonaSeed({ ...personaSeed, current_issue: e.target.value })} placeholder="예: 최근 성과가 떨어지고 있고 야근도 줄었습니다..." className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[80px]" />
          </div>
          <button onClick={() => startChat()} disabled={!personaSeed.current_issue.trim()} className="w-full py-3 bg-mint-400 hover:bg-mint-500 disabled:bg-gray-300 text-white font-medium rounded-lg">
            시뮬레이션 시작
          </button>
        </div>
      </div>
    );
  }

  // ─── Chat Phase ───
  if (phase === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">💬 1on1 연습 중</h2>
            <p className="text-xs text-gray-500">{personaSeed.role} · {personaSeed.years} · {personaSeed.current_issue.slice(0, 30)}...</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleEnd} disabled={feedbackLoading || messages.length < 4} className="px-4 py-2 text-sm bg-mint-400 hover:bg-mint-500 disabled:bg-gray-300 text-white rounded-lg">
              {feedbackLoading ? "분석 중..." : "종료 & 피드백"}
            </button>
            <button onClick={reset} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">초기화</button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              먼저 인사를 건네보세요. (예: "안녕하세요, 요즘 어떠세요?")
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === "user" ? "bg-mint-400 text-white" : "bg-gray-100 text-gray-800"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2.5 rounded-2xl">
                <div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* 입력 */}
        <div className="flex gap-2 pt-3 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mint-400"
            disabled={sending}
          />
          <button onClick={handleSend} disabled={sending || !input.trim()} className="px-4 py-2.5 bg-mint-400 hover:bg-mint-500 disabled:bg-gray-300 text-white rounded-lg text-sm">
            전송
          </button>
        </div>
      </div>
    );
  }

  // ─── Feedback Phase ───
  if (phase === "feedback" && feedback) {
    const fb = feedback as {
      score?: number;
      good_questions?: Array<{ question: string; reason: string }>;
      improvement_points?: Array<{ point: string; suggestion: string }>;
      emotion_flow?: Array<{ phase: string; emotion: string; evidence: string }>;
      practical_sentences?: Array<{ stage: string; sentence: string; context: string }>;
      application_tips?: string[];
      overall_tone?: string;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📊 연습 피드백</h2>
          <button onClick={reset} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">새 연습 시작</button>
        </div>

        {/* 점수 */}
        {fb.score && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-xs text-gray-500">종합 코칭 점수</p>
            <p className={`text-5xl font-bold ${fb.score >= 70 ? "text-mint-500" : fb.score >= 50 ? "text-yellow-500" : "text-red-500"}`}>
              {fb.score}<span className="text-lg text-gray-400">/100</span>
            </p>
            {fb.overall_tone && <p className="text-sm text-gray-600 mt-2">{fb.overall_tone}</p>}
          </div>
        )}

        {/* 좋은 질문 */}
        {fb.good_questions && fb.good_questions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-green-700 mb-3">✅ 좋은 질문</h3>
            {fb.good_questions.map((q, i) => (
              <div key={i} className="pl-3 border-l-2 border-green-300 mb-3">
                <p className="text-sm italic text-gray-700">"{q.question}"</p>
                <p className="text-xs text-gray-500">{q.reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* 개선 포인트 */}
        {fb.improvement_points && fb.improvement_points.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-orange-700 mb-3">💡 개선 포인트</h3>
            {fb.improvement_points.map((p, i) => (
              <div key={i} className="pl-3 border-l-2 border-orange-300 mb-3">
                <p className="text-sm text-gray-800">{p.point}</p>
                <p className="text-xs text-blue-600">→ {p.suggestion}</p>
              </div>
            ))}
          </div>
        )}

        {/* 실전 문장 */}
        {fb.practical_sentences && fb.practical_sentences.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3">💬 실전 문장</h3>
            {fb.practical_sentences.map((s, i) => (
              <div key={i} className="p-3 bg-mint-50 border border-mint-200 rounded-lg mb-2">
                <span className="text-xs bg-mint-100 text-mint-700 px-2 py-0.5 rounded">{s.stage}</span>
                <p className="text-sm font-medium mt-1">"{s.sentence}"</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.context}</p>
              </div>
            ))}
          </div>
        )}

        {/* 적용 팁 */}
        {fb.application_tips && fb.application_tips.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3">🚀 적용 팁</h3>
            {fb.application_tips.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                <span className="text-mint-500">▸</span>{t}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
