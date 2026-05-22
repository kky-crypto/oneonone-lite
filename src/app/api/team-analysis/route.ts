import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";

const SYSTEM_PROMPT = `당신은 조직 건강도 분석 전문가입니다. 팀의 1on1 미팅 데이터를 집계 분석하여 팀 건강 상태를 진단합니다.

절대 원칙:
- 개별 구성원을 식별할 수 있는 정보를 절대 포함하지 마세요.
- 집계된 패턴과 추세만 보고합니다.

분석 관점:
- 심리적 안전감: 팀원들이 솔직하게 이야기하고 있는가?
- 번아웃 신호: 피로, 과부하, 동기 저하 징후가 있는가?
- 성장 동력: 팀원들이 성장하고 있다고 느끼는가?
- 공통 이슈: 여러 멤버에게 반복되는 주제가 있는가?

반드시 아래 JSON 형식으로만 응답하세요.

{
  "team_health_score": 7.5,
  "summary": "팀 전체 상태 요약 (2~3문장)",
  "common_themes": [
    {
      "theme": "공통 주제/이슈",
      "frequency": "높음 | 중간 | 낮음",
      "suggested_action": "리더에게 권장하는 액션"
    }
  ],
  "alerts": [
    {
      "severity": "high | medium | low",
      "message": "주의 사항",
      "recommendation": "권장 조치"
    }
  ],
  "strengths": ["팀의 강점 1", "팀의 강점 2"],
  "recommendations": ["개선 권장사항 1", "개선 권장사항 2"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { meetingSummaries, teamSize } = await request.json();

    const anonymized = (meetingSummaries || []).map((s: Record<string, unknown>, i: number) => {
      return `[멤버${i + 1}] 논의주제: ${JSON.stringify(s.discussion_topics || [])} / 분위기: ${s.mood || "정보없음"} / 액션아이템: ${JSON.stringify(s.action_items || [])}`;
    }).join("\n\n");

    const userPrompt = `팀 분석을 수행해주세요.

[팀 규모] ${teamSize || "정보없음"}명
[분석 기간] 최근 1개월

[익명화된 1on1 요약 데이터]
${anonymized || "데이터 없음"}

위 데이터를 바탕으로 팀 건강 점수, 공통 주제/이슈, 주의 알림을 생성해주세요.`;

    const result = await callBedrock(SYSTEM_PROMPT, userPrompt);
    return NextResponse.json({ result: JSON.parse(result) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "팀 분석 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
