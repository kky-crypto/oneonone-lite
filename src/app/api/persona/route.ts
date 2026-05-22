import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";

const SYSTEM_PROMPT = `당신은 1on1 미팅 분석 전문가입니다. 과거 미팅 기록을 분석하여 구성원의 성향과 현재 상태를 요약합니다.

분석 원칙:
- 객관적 사실에 기반하여 분석합니다.
- 인사 평가성 표현은 절대 사용하지 않습니다.
- 리더가 공감적 대화를 준비할 수 있도록 돕는 톤으로 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요.

{
  "personality_summary": {
    "communication_style": "구성원의 대화 스타일",
    "motivation_factors": ["동기 부여 요인 1", "동기 부여 요인 2"],
    "stress_signals": ["스트레스 신호 1", "스트레스 신호 2"]
  },
  "current_state": {
    "recent_interests": ["최근 관심사"],
    "unresolved_issues": ["미해결 이슈"],
    "emotional_trend": "최근 감정 추이 요약"
  },
  "next_meeting_suggestions": ["다음 1on1에서 다루면 좋을 주제 1", "주제 2"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { memberName, pastMeetings } = await request.json();

    const meetingsText = (pastMeetings || []).map((m: Record<string, unknown>, i: number) => {
      return `[미팅 ${i + 1}] 날짜: ${m.date || "미상"}\n논의주제: ${JSON.stringify(m.discussion_topics || [])}\n분위기: ${m.mood || ""}\n액션아이템: ${JSON.stringify(m.action_items || [])}`;
    }).join("\n\n");

    const userPrompt = `구성원 "${memberName}"의 과거 1on1 기록을 분석해주세요.

아래는 최근 ${(pastMeetings || []).length}건의 1on1 기록입니다:

${meetingsText || "기록 없음"}

위 기록을 바탕으로 구성원의 성향과 현재 상태를 분석해주세요.`;

    const result = await callBedrock(SYSTEM_PROMPT, userPrompt);
    return NextResponse.json({ result: JSON.parse(result) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "성향 분석 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
