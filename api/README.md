# AI vs Human Quiz API

AI가 생성한 이미지와 실제 사람의 창작물을 구별하는 퀴즈 플랫폼 백엔드 API.

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Neon Serverless)
- **Image Storage:** Cloudinary (예정)

## 프로젝트 구조

```
api/
├── src/
│   ├── app.module.ts        # 루트 모듈
│   ├── main.ts              # 진입점
│   └── prisma/              # DB 모듈
├── prisma/
│   ├── schema.prisma        # DB 스키마
│   ├── migrations/          # 마이그레이션 파일
│   └── seed.ts              # 시드 데이터
├── prisma.config.ts         # Prisma 설정
└── .env                     # 환경변수 (커밋 제외)
```

## DB 스키마

| 모델 | 설명 |
|------|------|
| Challenge | 챌린지 세트 (slug로 식별) |
| Question | AI/Human 이미지 쌍 |
| GameSession | 유저의 게임 플레이 기록 |
| GameAnswer | 각 문제에 대한 답변 |

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

### 4. 개발 서버 실행

```bash
npm run start:dev
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run start:dev` | 개발 서버 (watch 모드) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 및 수정 |
| `npm run test` | 단위 테스트 |
| `npm run test:e2e` | E2E 테스트 |
| `npx prisma studio` | DB GUI |
