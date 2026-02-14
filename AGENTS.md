# 프로젝트 에이전트 노트

## 개요
- `shiftwork`는 교대근무 일정과 대한민국 공휴일을 보여주는 React + Vite 웹앱입니다.
- 핵심 기능: 월별 달력 탐색, 4조 3교대 패턴 표시, Google Calendar 공휴일 연동.

## 기술 스택
- React 19, Vite 6
- Supabase (인증 + Google 토큰 암호화를 위한 Edge Function)
- Google Calendar API
- 컴포넌트별 CSS 파일 (CSS-in-JS 미사용)

## 로컬 명령어
- `npm run dev` Vite 개발 서버 실행
- `npm run build` 프로덕션 빌드
- `npm run preview` 빌드 결과 미리보기
- `npm run lint` ESLint 실행

## 환경 변수
프로젝트 루트의 `.env` 또는 `.env.local`에 설정:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_API_KEY`
- `VITE_SUPABASE_FUNCTIONS_URL` (로컬: `http://localhost:54321/functions/v1`)
- `VITE_GOOGLE_CLIENT_ID`

Supabase Edge Function 환경 변수(로컬/배포 공통):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_TOKEN_KEY` (base64 인코딩된 32바이트 키)
- `GOOGLE_TOKEN_KEY_VERSION` (선택, 기본 `1`)

## 프로젝트 구조
- `src/App.jsx` 라우팅 엔트리
- `src/components/` UI 및 기능 컴포넌트 (Calendar, Auth, Modal 등)
- `src/pages/` 약관/정책 페이지
- `src/services/` Google 인증 + JWT + 토큰 관리
- `src/utils/` 공휴일/교대 유틸 및 암호화 헬퍼
- `src/assets/` 정적 에셋

## 데이터 / API 메모
- 공휴일은 Google Calendar(`ko.south_korea#holiday@group.v.calendar.google.com`)에서 가져옵니다.
- Google access/refresh 토큰은 `supabase/functions/google-token-store`에서 암호화 저장됩니다.
- 암호화 토큰용 마이그레이션: `supabase/migrations/20241128120000_create_work_google_tokens.sql`.

## 개발 메모
- 달력 로직 변경 시 `src/utils/ShiftUtils.jsx`, `src/utils/HolidayUtils.jsx`를 확인하세요.
- 인증/토큰 흐름은 `src/services/`와 `src/components/GoogleLoginButton.jsx`에 있습니다.
- 이 레포는 일반 CSS 파일을 사용하므로 기존 컴포넌트 CSS와 스타일을 맞추세요.
- 작업 계획을 위한 Markdown 파일은 `docs/` 폴더에 생성하세요.

## 작성 규칙
- 커밋 메시지는 한국어로 작성합니다.
- 설명은 초급 개발자이며 백엔드 사용 경험이 없는 사용자를 기준으로 작성합니다.
