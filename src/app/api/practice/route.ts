import { NextRequest, NextResponse } from "next/server";
import { callBedrock, callBedrockChat } from "@/lib/bedrock";

const PERSONA_SYSTEM = `당신은 실제 회사원입니다. 리더와 1on1 미팅 중입니다.

핵심 규칙:
1. 당신은 AI가 아닙니다. 실제 직장인입니다.
2. 답변은 1~3문장. 실제 대화처럼 짧게.
3. 항상 협조적이면 안 됩니다. 어려운 질문엔 "음... 글쎄요" "잘 모르겠어요"로 시작.
4. 실제 직장인의 말투: "아..." "음..." "그게..." 같은 추임새 사용.
5. 처음 1~2턴은 경계심 있게, 점점 풀어지는 패턴.
6. 이모지 사용 금지. AI 투의 말 금지.`;

const FEEDBACK_SYSTEM = `당신은 리더십 코칭 전문가입니다. 리더가 AI 구성원과 연습한 1on1 대화를 분석합니다.

반드시 아래 JSON 형식으로만 응답하세요.

{
  "score": 72,
  "good_questions": [
    {"question": "좋은 질문 인용", "reason": "좋은 이유"}
  ],
  "improvement_points": [
    {"point": "개선할 점", "suggestion": "구체적 제안"}
  ],
  "emotion_flow": [
    {"phase": "초반", "emotion": "감정", "evidence": "근거"}
  ],
  "practical_sentences": [
    {"stage": "단계", "sentence": "실전 문장", "context": "사용 맥락"}
  ],
  "application_tips": ["팁 1", "팁 2", "팁 3"],
  "overall_tone": "전반적 코칭 톤 평가"
}`;

export async function POST(request: NextRequest) {
  try {
    const { action, personaSeed, messages, userInput } = await request.json();

    if (action === "chat") {
      // 롤플레이 대화
      const persona = personaSeed || {};
      const systemPrompt = `${PERSONA_SYSTEM}

[당신의 설정]
- 직무: ${persona.role || "개발자"}
- 연차: ${persona.years || "3년"}
- 성향: ${persona.personality || "보통"}
- 현재 상황/고민: ${persona.current_issue || "특별한 고민 없음"}
- 관계: ${persona.relationship || "보통"}

위 설정에 맞게 자연스럽게 대화하세요. 1~3문장으로 짧게 답하세요.`;

      const chatMessages = [
        ...(messages || []).map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
        { role: "user", content: userInput },
      ];

      const response = await callBedrockChat(systemPrompt, chatMessages);
      return NextResponse.json({ response });
    }

    if (action === "feedback") {
      // 피드백 생성
      const transcript = (messages || [])
        .map((m: { role: string; content: string }) =>
          `[${m.role === "user" ? "리더" : "구성원"}] ${m.content}`
        )
        .join("\n");

      const userPrompt = `아래는 리더가 AI 구성원과 연습한 1on1 대화입니다. 분석해주세요.

[구성원 설정]
${JSON.stringify(personaSeed || {})}

[대화 전문]
${transcript}

위 대화를 분석하여 JSON으로 출력해주세요.`;

      const result = await callBedrock(FEEDBACK_SYSTEM, userPrompt);
      return NextResponse.json({ result: JSON.parse(result) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "연습 처리 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
