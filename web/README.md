# AI vs Human Quiz — Frontend

Next.js 기반 프론트엔드. AI 이미지 감별 퀴즈의 사용자 인터페이스를 담당합니다.

**배포:** https://nest-next-project-sigma.vercel.app/

## 기술 스택

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3
- **Font:** Geist (로컬 폰트)

## 시작하기

```bash
npm install
```

```bash
# 환경변수 설정
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

```bash
npm run dev
```

개발 서버: http://localhost:3000

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 |

## 프로젝트 구조

```
src/
├── app/                        # App Router (파일 기반 라우팅)
│   ├── layout.tsx              # 루트 레이아웃
│   ├── loading.tsx             # 로딩 UI
│   ├── globals.css             # 글로벌 스타일 (Tailwind)
│   ├── opengraph-image.tsx     # OG 이미지 생성
│   ├── fonts/                  # 로컬 폰트 (Geist)
│   └── challenges/
│       ├── page.tsx            # 챌린지 목록 페이지
│       └── [slug]/
│           └── page.tsx        # 퀴즈 플레이 페이지
│
└── components/
    ├── ChallengeIntro.tsx      # 인트로 (타이핑 애니메이션)
    ├── NicknameModal.tsx       # 닉네임 입력 모달
    ├── NicknameInput.tsx       # 닉네임 입력 컴포넌트
    ├── QuizQuestion.tsx        # A/B 이미지 선택 퀴즈
    └── QuizResult.tsx          # 결과 화면 (점수, 공유)
```

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 인트로 화면 → `/challenges`로 이동 |
| `/challenges` | 챌린지 목록 + 닉네임 입력 |
| `/challenges/:slug` | 퀴즈 플레이 + 결과 확인 |
