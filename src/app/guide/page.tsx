"use client";

import { useState } from "react";

type Section = "summary" | "purpose" | "ops" | "flow" | "woowa";

const SECTIONS: { key: Section; icon: string; label: string }[] = [
  { key: "summary", icon: "⚡", label: "5분 요약" },
  { key: "purpose", icon: "🎯", label: "1on1의 목적" },
  { key: "ops", icon: "📋", label: "운영 원칙" },
  { key: "flow", icon: "📝", label: "기본 대화 흐름" },
  { key: "woowa", icon: "🏷️", label: "우아한일원칙" },
];

export default function GuidePage() {
  const [active, setActive] = useState<Section>("summary");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📖 리더 1on1 운영 가이드</h1>
        <p className="text-gray-600 mt-1">1on1은 구성원을 점검하기 위한 시간이 아니라, 관계·몰입·성장·정렬을 확인하고 함께 문제를 해결하기 위한 리더십 루틴입니다.</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              active === s.key ? "border-mint-400 text-mint-700" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{s.icon}</span><span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="min-h-[400px]">
        {active === "summary" && <SummarySection />}
        {active === "purpose" && <PurposeSection />}
        {active === "ops" && <OpsSection />}
        {active === "flow" && <FlowSection />}
        {active === "woowa" && <WoowaSection />}
      </div>
    </div>
  );
}

function SummarySection() {
  return (
    <div className="space-y-4">
      <div className="bg-mint-50 border border-mint-200 rounded-xl p-5">
        <h3 className="text-base font-bold text-gray-900">1on1은 구성원을 점검하는 시간이 아닙니다</h3>
        <p className="text-sm text-gray-700 mt-2 leading-relaxed">구성원이 더 잘 일할 수 있는 조건을 함께 찾는 시간입니다. 리더는 관계, 몰입, 성장, 방향 정렬을 확인하고 작은 신호가 큰 이슈가 되기 전에 함께 해결합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: "👂", title: "평가보다 도움", desc: "막힌 것을 풀고 더 잘 일하게 돕기" },
          { icon: "💬", title: "조언보다 경청", desc: "질문하고 기다리며 말하게 하기" },
          { icon: "🤝", title: "기록보다 합의", desc: "같은 이해로 다음 행동 합의하기" },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl">{item.icon}</p>
            <p className="text-sm font-medium mt-1">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold mb-3">한 회차의 기본 흐름</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { n: "1", t: "체크인", d: "상태와 에너지 확인", color: "bg-teal-50 border-teal-200 text-teal-600" },
            { n: "2", t: "주요 주제", d: "구성원이 꺼낼 이야기", color: "bg-cyan-50 border-cyan-200 text-cyan-600" },
            { n: "3", t: "합의", d: "정리된 결정 확인", color: "bg-sky-50 border-sky-200 text-sky-600" },
            { n: "4", t: "Next Action", d: "누가, 무엇을, 언제까지", color: "bg-mint-50 border-mint-200 text-mint-700" },
          ].map((s, i) => (
            <div key={i} className={`p-3 rounded-lg border ${s.color}`}>
              <span className="text-xs font-bold">{s.n}</span>
              <span className="text-xs font-semibold ml-1">{s.t}</span>
              <p className="text-[11px] text-gray-600 mt-0.5">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold mb-2">매 회차 꼭 지킬 것</p>
        {["구성원이 더 많이 말하게 하기", "지난 Next Action 먼저 확인하기", "감정이나 부담 신호를 지나치지 않기", "종료 5분 전 합의사항 정리하기", "민감한 내용은 당사자 동의 없이 공유하지 않기"].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-sm py-0.5">
            <span className="text-mint-500">▸</span><span className="text-gray-700">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PurposeSection() {
  return (
    <div className="space-y-4">
      <div className="bg-mint-50 border border-mint-200 rounded-xl p-5">
        <h3 className="text-base font-bold">1on1은 구성원을 점검하는 시간이 아닙니다</h3>
        <p className="text-sm text-gray-700 mt-1">관계·몰입·성장·정렬을 확인하고 함께 문제를 해결하기 위한 리더십 루틴입니다.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500">❌ 업무 점검 미팅</p>
          <ul className="text-xs text-gray-600 space-y-0.5 mt-2"><li>• 진행 상황 확인</li><li>• 리더가 묻고 구성원이 답함</li><li>• 단기 업무 중심</li></ul>
        </div>
        <div className="bg-mint-50 border border-mint-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-mint-700">✅ 1on1</p>
          <ul className="text-xs text-gray-700 space-y-0.5 mt-2"><li>• 구성원 상태와 맥락 이해</li><li>• 구성원이 더 많이 말함</li><li>• 성장과 정렬까지 함께 확인</li></ul>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { t: "관계 형성", d: "신뢰와 심리적 안전감을 쌓는 시간" },
          { t: "몰입과 에너지", d: "업무량, 우선순위 혼란, 피로 신호 확인" },
          { t: "성장 지원", d: "막힌 지점, 배우고 싶은 것, 다음 역할 탐색" },
          { t: "방향 정렬", d: "팀 방향과 개인 업무의 연결 확인" },
          { t: "조기 이슈 해결", d: "작은 신호가 큰 이슈가 되기 전에 발견" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg">
            <span className="text-sm font-semibold text-mint-600">{i + 1}.</span>
            <div><span className="text-sm font-medium">{item.t}</span><span className="text-sm text-gray-500 ml-2">— {item.d}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpsSection() {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold mb-3">💭 시작 전 마음가짐</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { t: "돕고자 하는 마음", q: "이 대화가 끝나면 구성원에게 무엇이 남을까?" },
            { t: "구성원에 대한 존중", q: "이 사람의 관점을 진심으로 궁금해하고 있는가?" },
            { t: "진정성", q: "나는 지금 진심으로 이야기하고 있는가?" },
          ].map((a, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold">{a.t}</p>
              <p className="text-xs text-mint-700 mt-1">💬 "{a.q}"</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold mb-3">📋 대화 중 실천 원칙</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { t: "심리적 안전감", d: "솔직하게 말해도 불이익 없다고 느끼게", tip: "비난 없이 듣기" },
            { t: "작은 약속 지키기", d: "합의한 것은 다음 회차에서 반드시 확인", tip: "NA 확인" },
            { t: "정기성", d: "정해진 주기로 만남, 취소는 연기만", tip: "Calendar" },
            { t: "구성원 주도", d: "리더보다 구성원이 더 많이 말하게", tip: "질문 후 침묵" },
            { t: "기록과 합의", d: "함께 정리하고 다음 행동 명확히", tip: "종료 5분 전" },
            { t: "비밀 원칙", d: "합의 없이 1on1 내용 공유하지 않음", tip: "민감 내용 보호" },
          ].map((b, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold">{b.t}</p>
              <p className="text-xs text-gray-500">{b.d}</p>
              <p className="text-xs text-mint-700 mt-0.5">💡 {b.tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold mb-2">🪞 매 회차 후 1분 셀프 체크</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {["내가 50% 넘게 말하지 않았나?", "답을 정해놓고 들어오지 않았나?", "오늘 구성원에게 실제로 도움이 된 순간은?"].map((q, i) => (
            <div key={i} className="p-2.5 bg-amber-50 rounded-lg flex items-start gap-2 text-sm">
              <span className="text-amber-500">☐</span><span className="text-gray-700">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowSection() {
  const items = [
    { t: "방향 (Priorities)", qs: ["지금 가장 집중하고 있는 일은?", "우선순위를 정할 때 어떤 기준을 쓰고 있나요?"] },
    { t: "진척 (Progress)", qs: ["지난주 대비 가장 진전된 부분은?", "막히는 부분이 있다면 어떤 도움이 필요한가요?"] },
    { t: "성장 (Growth)", qs: ["최근에 새로 배운 것이 있나요?", "6개월 후 어떤 모습이길 바라나요?"] },
    { t: "협업과 관계", qs: ["요즘 협업하면서 어려운 점이 있나요?", "팀 분위기에 대해 어떻게 느끼고 있나요?"] },
    { t: "다음 (Next)", qs: ["다음 1on1까지 제가 챙겨야 할 것이 있을까요?", "오늘 대화에서 가장 도움이 된 부분은?"] },
  ];

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        모든 회차에서 5가지를 모두 다뤄야 하는 것은 아닙니다. 이번 1on1의 목적과 구성원 상황에 맞게 1~2개를 골라 활용하세요.
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900">{i + 1}. {item.t}</p>
            {item.qs.map((q, j) => (
              <div key={j} className="flex items-center gap-2 mt-2 p-2.5 bg-mint-50 rounded-lg">
                <span className="flex-1 text-sm text-gray-700">"{q}"</span>
                <button onClick={() => copyText(q)} className="text-xs text-mint-600 hover:underline shrink-0">복사</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-semibold mb-2">✅ Next Action 합의 기준</p>
        <p className="text-xs text-gray-500 mb-3">NA는 "무엇을 / 누가 / 언제까지"가 있어야 합니다.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs font-medium text-red-600 mb-1">❌ NA가 아닙니다</p>
            <p className="text-xs text-gray-600">"문서 좀 더 보기"</p>
            <p className="text-xs text-gray-600">"같이 하는 걸로"</p>
            <p className="text-xs text-gray-600">"조만간에요"</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs font-medium text-green-600 mb-1">⭕ NA입니다</p>
            <p className="text-xs text-gray-600">"현주님이 금요일까지 문서 초안 1p 공유"</p>
            <p className="text-xs text-gray-600">"리더가 수요일까지 피드백 전달"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WoowaSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const principles = [
    { name: "Own it", label: "내 일의 대표는 나", desc: "역할 범위에 가두지 않고 문제 해결과 비즈니스에 최선의 선택을 하는 태도", q: "이 문제를 끝까지 해결하기 위해 본인이 직접 가져가야 할 부분은?", fbG: "역할 범위를 넘어 문제를 끝까지 해결하려고 한 점이 좋았습니다.", fbE: "다음에는 담당과 완료 기준을 더 명확히 잡아보면 좋겠습니다." },
    { name: "Dive deep", label: "파고들자 끄으읏까지", desc: "일의 본질을 추구하기 위해 깊이 탐구하고 실행으로 답을 찾는 태도", q: "이 문제의 표면적 원인 말고, 더 깊이 봐야 할 원인은?", fbG: "문제의 원인을 표면에서 멈추지 않고 깊이 파고든 점이 인상적이었습니다.", fbE: "다음에는 데이터나 근거를 더 구체적으로 확인해보면 좋겠습니다." },
    { name: "Deliver value fast", label: "속도는 곧 경쟁력", desc: "빠르게 실행하고 개선하며 시장을 선도해 나가는 태도", q: "고객 관점에서 가장 먼저 해결해야 할 것은?", fbG: "빠르게 실행하고 결과를 확인한 뒤 개선한 흐름이 좋았습니다.", fbE: "다음에는 작은 단위로 먼저 시도해보면 좋겠습니다." },
    { name: "Bring good vibes", label: "가보자! 덕분에! 해냈어!", desc: "동료와 함께할 때 더 큰 힘을 발휘하며 서로에게 힘이 되는 태도", q: "함께 일하는 사람들에게 어떤 영향을 주고 있다고 생각하나요?", fbG: "어려운 상황에서도 가능한 방법을 찾으려 한 태도가 좋았습니다.", fbE: "다음에는 동료에게 미치는 영향을 한 번 더 생각해보면 좋겠습니다." },
    { name: "Raise the bar", label: "적당히는 적당하지 않다", desc: "좋은 것을 넘어 탁월함을 추구하고 건강한 피드백으로 더 나은 결과를 만드는 태도", q: "현재 결과물을 한 단계 더 좋게 만들기 위해 무엇을 바꿀 수 있을까요?", fbG: "기존 방식에 안주하지 않고 더 나은 기준을 세우려 한 점이 좋았습니다.", fbE: "다음에는 기준을 한 단계 더 높여볼 수 있을지 함께 고민해봐요." },
    { name: "Stay humble", label: "언제나 열린 마음으로", desc: "열린 마음으로 기꺼이 배우며 성장을 멈추지 않는 태도", q: "혹시 내가 놓쳤을 수 있는 관점은 무엇일까요?", fbG: "다른 관점을 열린 마음으로 수용하고 반영한 점이 좋았습니다.", fbE: "다음에는 다양한 의견을 먼저 들어본 뒤 판단해보면 좋겠습니다." },
  ];

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
        <p>우아한일원칙은 우리가 일하는 방식과 의사결정의 기준입니다.</p>
        <p>1on1에서는 구성원을 단정하거나 점수화하는 방식이 아니라, 일하는 방식을 함께 돌아보는 대화와 피드백의 기준으로 활용합니다.</p>
      </div>

      <div className="space-y-3">
        {principles.map((p) => (
          <div key={p.name} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-mint-100 border border-mint-200 text-mint-700">{p.name}</span>
              <span className="text-sm font-medium">{p.label}</span>
            </div>
            <p className="text-xs text-gray-500">{p.desc}</p>
            <button onClick={() => setExpanded(expanded === p.name ? null : p.name)} className="text-xs text-mint-600 hover:underline">
              {expanded === p.name ? "▲ 접기" : "▼ 질문 · 피드백 보기"}
            </button>
            {expanded === p.name && (
              <div className="space-y-2 pt-1">
                <div className="p-2.5 bg-mint-50 rounded-lg border border-mint-100">
                  <p className="text-xs font-medium text-mint-700">대화 질문</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex-1 text-sm">"{p.q}"</span>
                    <button onClick={() => copyText(p.q)} className="text-xs text-mint-600 hover:underline shrink-0">복사</button>
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-600">피드백 관점</p>
                  <p className="text-xs text-green-700 mt-1">✅ {p.fbG}</p>
                  <p className="text-xs text-amber-700 mt-0.5">💡 {p.fbE}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
