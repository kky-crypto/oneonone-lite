# 1on1 Agent Lite

AI 기반 1on1 미팅 어시스턴트 — 경량 버전

## 기능

1. **미팅 분석** — 녹취록(STT) 업로드 → AI 요약 + 코칭 피드백
2. **구성원 관리** — 구성원 추가/수정/삭제, 미팅 기록 연동
3. **1on1 가이드** — 운영 원칙, 대화 흐름, 우아한일원칙 가이드

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: AWS Bedrock (Claude Sonnet)
- **배포**: Vercel (무료)

## 설정 방법

### 1. Supabase 테이블 생성

Supabase Dashboard → SQL Editor → New Query에서 `supabase-schema.sql` 내용을 실행하세요.

### 2. 환경 변수 설정

`.env.local` 파일에 AWS_ACCESS_KEY_ID를 입력하세요.

### 3. 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인

### 4. Vercel 배포

1. GitHub에 push
2. https://vercel.com 에서 Import
3. Environment Variables에 `.env.local` 내용 추가
4. Deploy

## 비용

- Supabase: 무료 (500MB DB)
- Vercel: 무료 (월 100GB 대역폭)
- AWS Bedrock: 사용량 과금 (데모 수준 월 $1~5)
