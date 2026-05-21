import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const SUMMARY_SYSTEM_PROMPT = `당신은 1on1 미팅 기록 전문가입니다. STT로 변환된 미팅 대화를 분석하여 구조화된 결과 기록지를 생성합니다.

작성 원칙:
- 객관적이고 비평가적인 어조로 작성합니다.
- 실제 대화 내용에 근거하여 요약합니다 (추측 X).
- 액션 아이템은 구체적이고 실행 가능해야 합니다.
- 담당자(리더/구성원)와 기한을 명확히 합니다.
- 감정/분위기는 대화 톤에서 추론하되 단정짓지 않습니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "discussion_topics": ["논의 주제 1", "논의 주제 2", "논의 주제 3"],
  "action_items": [
    {
      "description": "구체적인 액션 아이템",
      "assignee_role": "leader | member",
      "due_estimate": "1주일 내 | 다음 미팅까지 | 구체적 날짜"
    }
  ],
  "next_meeting_notes": "다음 미팅에서 확인할 사항 (1~3문장)",
  "mood": "전반적인 대화 분위기"
}

논의 주제: 3~5개, 액션 아이템: 1~5개.`;

const COACHING_SYSTEM_PROMPT = `당신은 리더십 코칭 전문가입니다. 1on1 미팅 대화를 분석하여 리더에게 건설적인 피드백을 제공합니다.

분석 원칙:
- 이것은 리더에 대한 "평가"가 아니라 "코칭" 관점입니다.
- 구체적인 발언을 인용하여 피드백합니다.
- 칭찬과 개선점을 균형 있게 제시합니다.

반드시 아래 JSON 형식으로만 응답하세요.

{
  "question_quality": {
    "open_ended_count": 5,
    "closed_ended_count": 3,
    "good_questions": [
      {"question": "리더가 한 좋은 질문 인용", "reason": "좋은 이유"}
    ],
    "improve_questions": [
      {"question": "개선 가능한 질문 인용", "suggestion": "이렇게 바꾸면 더 좋습니다"}
    ]
  },
  "emotion_flow": [
    {"phase": "초반", "emotion": "감정", "evidence": "근거 발언 인용"},
    {"phase": "중반", "emotion": "...", "evidence": "..."},
    {"phase": "후반", "emotion": "...", "evidence": "..."}
  ],
  "coaching_feedback": {
    "good_points": [
      {"point": "잘한 점", "evidence": "구체적 인용"}
    ],
    "improvements": [
      {"point": "개선 포인트", "suggestion": "구체적 제안", "evidence": "관련 인용"}
    ]
  },
  "next_meeting_suggestions": ["다음 1on1에서 시도해볼 것 1", "다음 1on1에서 시도해볼 것 2"]
}`;

async function callBedrock(systemPrompt: string, userPrompt: string) {
  const modelId = process.env.BEDROCK_MODEL_ARN || "";

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, type, leaderName, memberName } = await request.json();

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: "녹취록을 입력해주세요." }, { status: 400 });
    }

    const leader = leaderName || "리더";
    const member = memberName || "구성원";

    if (type === "coaching") {
      const userPrompt = `아래는 1on1 미팅 대화 기록입니다. 리더의 코칭 역량을 분석해주세요.\n\n[대화 기록 (화자 라벨 포함)]\n${transcript}\n\n위 대화에서 리더의 질문 품질, 경청 태도, 감정 흐름, 코칭 포인트를 분석해주세요.`;
      const result = await callBedrock(COACHING_SYSTEM_PROMPT, userPrompt);
      return NextResponse.json({ result: JSON.parse(result), type: "coaching" });
    } else {
      const userPrompt = `아래는 "${leader}" 리더와 "${member}" 구성원의 1on1 미팅 대화 기록입니다.\n\n[대화 기록 (STT 변환)]\n${transcript}\n\n위 대화를 분석하여 결과 기록지를 생성해주세요.`;
      const result = await callBedrock(SUMMARY_SYSTEM_PROMPT, userPrompt);
      return NextResponse.json({ result: JSON.parse(result), type: "summary" });
    }
  } catch (error: unknown) {
    console.error("Bedrock API error:", error);
    const message = error instanceof Error ? error.message : "AI 분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
