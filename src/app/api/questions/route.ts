import { NextRequest, NextResponse } from "next/server";
import { callBedrock } from "@/lib/bedrock";

const SYSTEM_PROMPT = `당신은 1on1 미팅 질문 코치입니다. 리더가 구성원에게 던질 효과적인 질문을 생성합니다.

질문 생성 원칙:
- 개방형 질문 위주 (예/아니오로 끝나지 않는 질문).
- 구성원이 깊이 생각하고 솔직하게 답할 수 있는 질문.
- 각 아젠다별 3~5개의 질문을 생성합니다.
- 질문은 평가/검증 톤이 아니라 대화를 여는 톤으로 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요.

{
  "questions": [
    {"text": "질문 내용", "intent": "질문 의도 1문장", "agenda": "관련 아젠다"}
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const { memberName, agendaItems } = await request.json();

    const userPrompt = `구성원 "${memberName || '구성원'}"과의 1on1에서 사용할 질문을 생성해주세요.

[아젠다 목록]
${(agendaItems || ["일반 대화"]).map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}

각 아젠다별로 3~5개의 질문을 생성해주세요.`;

    const result = await callBedrock(SYSTEM_PROMPT, userPrompt);
    return NextResponse.json({ result: JSON.parse(result) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "질문 생성 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
