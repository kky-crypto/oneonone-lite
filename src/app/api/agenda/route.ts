import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";

const SYSTEM_PROMPT = `당신은 1on1 미팅 아젠다 설계 전문가입니다. 리더가 구성원과의 1on1에서 다룰 아젠다를 추천합니다.

추천 원칙:
- 구체적이고 행동 가능한 아젠다를 제안합니다.
- 미해결 액션 아이템이 있으면 후속 확인을 우선 포함합니다.
- 3~5개를 추천하며, 우선순위(high/medium/low)를 부여합니다.

반드시 아래 JSON 형식으로만 응답하세요.

{
  "recommendations": [
    {
      "title": "아젠다 제목 (한 줄, 구체적)",
      "rationale": "이 아젠다를 추천하는 이유 (1~2문장)",
      "priority": "high | medium | low"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const { memberName, previousNotes, unresolvedActions } = await request.json();

    const userPrompt = `구성원 "${memberName || '구성원'}"과의 다음 1on1 아젠다를 추천해주세요.

[미해결 액션 아이템]
${unresolvedActions || "없음"}

[이전 미팅 노트]
${previousNotes || "없음"}

위 정보를 바탕으로 3~5개의 아젠다를 추천해주세요.`;

    const result = await callBedrock(SYSTEM_PROMPT, userPrompt);
    return NextResponse.json({ result: JSON.parse(result) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "아젠다 추천 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
