# AI vs Human Quiz API

AI가 생성한 이미지와 실제 사람의 창작물을 구별하는 퀴즈 플랫폼 백엔드 API.

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Neon Serverless)
- **Image Storage:** Cloudinary
- **API 문서:** Swagger (NestJS Swagger)

## 프로젝트 구조

```
api/
├── src/
│   ├── main.ts                        # 진입점 (CORS, ValidationPipe, 글로벌 prefix /api)
│   ├── app.module.ts                  # 루트 모듈
│   ├── app.controller.ts             # 기본 컨트롤러
│   ├── app.service.ts                # 기본 서비스
│   ├── prisma/                        # DB 모듈
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts         # PrismaClient 확장 (커넥션 풀링)
│   ├── challenges/                    # 챌린지 모듈 (목록/상세 조회)
│   │   ├── challenges.module.ts
│   │   ├── challenges.controller.ts
│   │   ├── challenges.service.ts
│   │   └── dto/
│   │       ├── challenge-response.dto.ts
│   │       ├── challenge-detail-response.dto.ts
│   │       └── question-response.dto.ts
│   └── games/                         # 게임 모듈 (세션, 답변, 결과)
│       ├── games.module.ts
│       ├── games.controller.ts
│       ├── games.service.ts
│       └── dto/
│           ├── create-session.dto.ts
│           ├── check-answer.dto.ts
│           ├── submit-answers.dto.ts
│           └── game-result-response.dto.ts
├── prisma/
│   ├── schema.prisma                  # DB 스키마
│   ├── migrations/                    # 마이그레이션 파일
│   └── seed.ts                        # 시드 데이터
├── prisma.config.ts                   # Prisma 설정
└── .env                               # 환경변수 (커밋 제외)
```

## DB 스키마

| 모델 | 설명 |
|------|------|
| Challenge | 챌린지 세트 (slug로 식별) |
| Question | AI/Human 이미지 쌍 |
| GameSession | 유저의 게임 플레이 기록 |
| GameAnswer | 각 문제에 대한 답변 |

## API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/api/challenges` | 챌린지 목록 조회 |
| `GET` | `/api/challenges/:slug` | 챌린지 상세 (문제 포함, 이미지 A/B 셔플) |
| `POST` | `/api/challenges/:slug/sessions` | 게임 세션 생성 |
| `POST` | `/api/sessions/:sessionId/answers` | 답변 제출 및 채점 |
| `GET` | `/api/sessions/:sessionId/result` | 게임 결과 조회 |

## Swagger

개발 서버 실행 후 아래 주소에서 API 문서를 확인하고 테스트할 수 있습니다.

```
http://localhost:3001/api/docs
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
# .env
DATABASE_URL="postgresql://..."
```

### 3. DB 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 시드 데이터 삽입 (선택)

```bash
npx prisma db seed
```

### 5. 개발 서버 실행

```bash
npm run start:dev
```

개발 서버: http://localhost:3001

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run start:dev` | 개발 서버 (watch 모드) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start:prod` | 프로덕션 서버 |
| `npm run lint` | ESLint 검사 및 수정 |
| `npm run format` | Prettier 포맷팅 |
| `npm run test` | 단위 테스트 |
| `npm run test:e2e` | E2E 테스트 |
| `npx prisma studio` | DB GUI |
| `npx prisma db seed` | 시드 데이터 삽입 |
