export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">1on1 Agent Lite</h1>
        <p className="text-gray-600">AI 기반 1on1 미팅 어시스턴트 — 리더가 구성원과의 1on1을 효과적으로 준비·실행·복기할 수 있도록 돕습니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/meetings" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-mint-300 hover:shadow-md transition-all">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-semibold text-gray-900">미팅 분석</h3>
          <p className="text-sm text-gray-500 mt-1">녹취록을 업로드하면 AI가 요약, 액션 아이템, 코칭 피드백을 생성합니다.</p>
        </a>

        <a href="/members" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-mint-300 hover:shadow-md transition-all">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-900">구성원 관리</h3>
          <p className="text-sm text-gray-500 mt-1">구성원 정보와 1on1 기록을 관리하고 인사이트를 확인합니다.</p>
        </a>

        <a href="/guide" className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-mint-300 hover:shadow-md transition-all">
          <div className="text-2xl mb-2">📖</div>
          <h3 className="font-semibold text-gray-900">1on1 가이드</h3>
          <p className="text-sm text-gray-500 mt-1">효과적인 1on1 운영을 위한 가이드와 질문 예시를 제공합니다.</p>
        </a>
      </div>
    </div>
  );
}
