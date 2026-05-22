const region = process.env.AWS_REGION || "ap-northeast-2";
const modelARN = process.env.BEDROCK_MODEL_ARN || "";
const token = process.env.AWS_SECRET_ACCESS_KEY || ""; // Bearer Token 역할

const endpoint = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelARN)}/invoke`;

function cleanJsonResponse(text: string): string {
  // 마크다운 코드블록 제거
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function fetchWithRetry(body: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body,
    });

    if (response.status === 429 && i < maxRetries - 1) {
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }

    return response;
  }
  throw new Error("Max retries exceeded");
}

export async function callBedrock(systemPrompt: string, userPrompt: string): Promise<string> {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const response = await fetchWithRetry(body);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bedrock error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return cleanJsonResponse(result.content[0].text);
}

export async function callBedrockChat(systemPrompt: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    temperature: 0.7,
    system: systemPrompt,
    messages,
  });

  const response = await fetchWithRetry(body);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bedrock error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result.content[0].text;
}
