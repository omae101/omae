# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

루트에서 실행 (npm workspaces):

```bash
npm install              # 모든 워크스페이스 의존성 설치

npm run dev              # web + admin 동시 실행 (concurrently)
npm run dev:web          # 공개 폼만 (http://localhost:3000)
npm run dev:admin        # 어드민만 (http://localhost:3001)

npm run build            # 모든 워크스페이스 빌드
npm run build:web        # web만 빌드
npm run build:admin      # admin만 빌드
npm run lint             # 모든 워크스페이스 lint

npm run test             # @lead-sat/shared 테스트 실행

npm run db:generate      # Drizzle 마이그레이션 파일 생성 (packages/shared)
npm run db:migrate       # DB에 마이그레이션 적용 (DATABASE_URL 필요)
npm run db:studio        # Drizzle Studio
```

`db:migrate`는 `.env.local`을 자동 로드하지 않습니다 — `packages/shared/.env`에 `DATABASE_URL`을 두거나 수동 설정.

## Environment

`.env.local.example`을 참고해 각 위치에 환경 파일 생성:

- `packages/shared/.env` — `DATABASE_URL` (Drizzle 마이그레이션 전용)
- `apps/web/.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `apps/admin/.env.local` — 위 두 개 + `ADMIN_PASSWORD`, `ADMIN_SECRET`, `NEXT_PUBLIC_WEB_URL`(선택)

## Architecture

npm workspaces 모노리포. 공개 폼과 어드민 대시보드가 별도 Next.js 앱으로 분리되어 있고, 공통 코드는 `@lead-sat/shared` 패키지에 모음.

```
lead-sat/
├── apps/
│   ├── web/      # 공개 리드 캡처 폼 (포트 3000)
│   └── admin/    # 어드민 대시보드 (포트 3001)
└── packages/
    └── shared/   # supabase 클라이언트, validation, Drizzle 스키마
```

### packages/shared (`@lead-sat/shared`)

raw TypeScript 소스를 그대로 export. 각 앱의 `next.config.ts`에서 `transpilePackages: ["@lead-sat/shared"]`로 트랜스파일.

서브패스 exports:
- `@lead-sat/shared` — validation 헬퍼/타입, supabase 클라이언트 (index에서 re-export)
- `@lead-sat/shared/supabase` — Supabase JS 클라이언트
- `@lead-sat/shared/validation` — 폼 검증 헬퍼와 타입
- `@lead-sat/shared/db` — Drizzle 클라이언트 (마이그레이션 전용)
- `@lead-sat/shared/db/schema` — Drizzle 스키마 (`leads` 테이블)

`drizzle/` 마이그레이션 산출물은 `packages/shared/drizzle/`에 생성됨 (git-ignored).

### apps/web (`@lead-sat/web`)

- `src/app/page.tsx` — 리드 캡처 폼 (client component). 검증, 전화번호 자동 포맷팅, `POST /api/leads` 호출.
- `src/app/api/leads/route.ts` — `POST` 핸들러 (인서트만).

### apps/admin (`@lead-sat/admin`)

- `src/middleware.ts` — `/login`과 `/api/auth/*`를 제외한 모든 경로에 쿠키 기반 인증. 인증 실패 시 `/login` 리다이렉트.
- `src/app/page.tsx` — 어드민 대시보드 (검색, 수정 모달, 삭제 모달, 상세보기).
- `src/app/login/page.tsx` — 비밀번호 로그인.
- `src/app/api/auth/login/route.ts` — 비밀번호 확인 후 `admin_session` 쿠키 발급.
- `src/app/api/auth/logout/route.ts` — 쿠키 만료.
- `src/app/api/leads/route.ts` — `GET` (검색 지원).
- `src/app/api/leads/[id]/route.ts` — `PUT` / `DELETE`.

어드민에서 "← 상담 신청 폼" 링크는 `NEXT_PUBLIC_WEB_URL` 환경변수를 사용 (기본값 `http://localhost:3000`).

### 데이터베이스

`leads` 테이블 (`packages/shared/src/db/schema.ts`): `id`, `name`, `company`, `email`, `phone`, `inquiry_type`, `message`, `created_at`. email은 unique.

Supabase RLS는 `leads` 테이블에서 비활성화 (publishable key가 추가 정책 없이 read/write 가능).

스키마 변경 후 `npm run db:generate` → 생성된 SQL을 `db:migrate`로 적용하거나 Supabase SQL Editor에 붙여넣기.
