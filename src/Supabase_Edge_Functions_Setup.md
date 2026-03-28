# Supabase Edge Functions 구현 가이드

## Edge Function이 뭐예요? (초급용 설명)

Edge Function은 **브라우저에서 하면 위험한 일을 대신 처리해주는 작은 서버 코드**입니다.
지금처럼 프론트엔드만 있는 앱(S3 배포)은 **누구나 브라우저에서 Supabase를 직접 호출**할 수 있어요.
그래서 중요한 작업(로그인 확인, DB 쓰기, 토큰 저장 등)을 **Edge Function으로 보내면 안전**해집니다.

쉽게 말하면:
- **브라우저 = 누구나 볼 수 있는 곳** → 비밀키/DB쓰기 같은 건 위험
- **Edge Function = 숨겨진 작업실** → 안전하게 DB를 읽고/쓰기 가능

우리가 Edge Function을 쓰는 이유:
- RLS를 켜도 **앱 기능이 막히지 않게** 하려고
- **DB 접근을 브라우저가 아니라 함수가 대신** 하도록 바꾸려고

## 개요

이 문서는 Google Calendar API를 안전하게 호출하기 위한 Supabase Edge Functions 구현 전 작업 흐름을 설명합니다.

---

## 진행 체크리스트

- [x] Step 1: 환경 설정 (CLI 설치, 로그인, 프로젝트 연결)
- [x] Step 2-1: supabase init 완료
- [x] Step 2-2: Functions 폴더 생성
- [x] Step 3: `app-api` 중심 Function 작성
- [x] Step 4: 로컬 테스트
- [x] Step 5: 환경변수 설정
- [x] Step 6: `app-api` 배포
- [x] Step 7: `app-api` Frontend 연동

> 현재 운영 구조는 `app-api` 중심입니다.  
> `auth-google`, `auth-callback`, `calendar-api`는 폴더와 기본 템플릿만 생성되어 있으며, 아직 실제 기능으로 구현하거나 운영에 사용하고 있지 않습니다.

---

## 전체 작업 순서

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. 환경 설정          Supabase CLI 설치, 프로젝트 연결          │
│         ↓                                                       │
│  2. 로컬 개발 환경      supabase init, functions 폴더 생성       │
│         ↓                                                       │
│  3. Function 작성      TypeScript로 Edge Function 코드 작성      │
│         ↓                                                       │
│  4. 로컬 테스트        supabase functions serve로 로컬 실행      │
│         ↓                                                       │
│  5. 환경변수 설정      Supabase Dashboard에서 Secrets 등록       │
│         ↓                                                       │
│  6. 배포              supabase functions deploy                 │
│         ↓                                                       │
│  7. Frontend 연동      fetch로 Edge Function 호출                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: 환경 설정

### 1-1. Supabase CLI 설치

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# 또는 npm으로 설치
npm install -g supabase

# 설치 확인
supabase --version
```

### 1-2. Supabase 로그인

```bash
supabase login
# 브라우저에서 인증 후 토큰 자동 연결
```

### 1-3. 프로젝트 연결

```bash
# shiftwork 프로젝트 폴더에서 실행
cd /Users/ssoyeonnim/Desktop/MyProject/shiftwork

# Supabase 프로젝트 초기화
supabase init

# 기존 Supabase 프로젝트와 연결
supabase link --project-ref dwcsxtyobhrcavdpxdjz
# ↑ 이 값은 .env의 VITE_SUPABASE_URL에서 확인 가능
# https://dwcsxtyobhrcavdpxdjz.supabase.co → dwcsxtyobhrcavdpxdjz
```

---

## Step 2: 프로젝트 구조 생성

### 2-1. 초기화 후 폴더 구조

```
shiftwork/
├── src/                      # 기존 React 소스
├── supabase/                 # 새로 생성됨
│   ├── config.toml           # Supabase 로컬 설정
│   └── functions/            # Edge Functions 폴더
│       ├── auth-google/
│       │   └── index.ts
│       ├── auth-callback/
│       │   └── index.ts
│       ├── calendar-api/
│       │   └── index.ts
│       └── _shared/          # 공통 유틸리티
│           ├── cors.ts
│           ├── jwt.ts
│           └── google-oauth.ts
├── .env
└── package.json
```

### 2-2. Functions 폴더 생성

```bash
# Edge Function 생성 (각각 실행)
supabase functions new auth-google
supabase functions new auth-callback
supabase functions new calendar-api
supabase functions new app-api

# _shared 폴더는 수동 생성
mkdir -p supabase/functions/_shared
```

---

## Step 3: Function 코드 작성

### 3-0. app-api (DB 접근 통합 함수)

`app-api`는 프론트에서 하던 DB 접근을 Edge Function으로 옮긴 통합 API입니다.
프론트는 `VITE_SUPABASE_FUNCTIONS_URL/app-api`로 요청을 보내고,
Edge Function이 Service Role로 DB를 읽고/쓰는 구조입니다.

### 3-1. 기본 구조 (자동 생성됨)

```typescript
// supabase/functions/auth-google/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 여기에 로직 작성
  return new Response(
    JSON.stringify({ message: "Hello World" }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### 3-2. Deno vs Node.js 차이점

Edge Functions는 **Deno 런타임**을 사용합니다 (Node.js 아님).

```typescript
// ❌ Node.js 스타일 (안됨)
const express = require('express')
import { createClient } from '@supabase/supabase-js'

// ✅ Deno 스타일 (이렇게 해야 함)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
```

### 3-3. 주요 차이점 정리

| 항목 | Node.js | Deno (Edge Functions) |
|------|---------|----------------------|
| 모듈 시스템 | CommonJS / ESM | ESM only |
| 패키지 설치 | npm install | URL import |
| 패키지 소스 | node_modules | https://esm.sh/ |
| 환경변수 | process.env | Deno.env.get() |
| 타입스크립트 | 컴파일 필요 | 네이티브 지원 |

### 3-4. 자주 사용하는 import 예시

```typescript
// HTTP 서버
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Supabase 클라이언트
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// JWT 라이브러리
import * as djwt from "https://deno.land/x/djwt@v2.8/mod.ts"

// 환경변수 접근
const SECRET = Deno.env.get('MY_SECRET')
```

---

## Step 4: 로컬 테스트

### 4-1. 로컬 환경변수 설정

```bash
# supabase/functions/.env 파일 생성 (로컬 테스트용)
touch supabase/functions/.env
```

```env
# supabase/functions/.env
GOOGLE_CLIENT_ID=422399923346-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
DAYF_JWT_SECRET=your-super-secret-key-at-least-32-characters

# Supabase 연결 정보 (로컬 테스트 시 필요)
# 로컬 `supabase functions serve`는 SUPABASE_로 시작하는 변수는 무시하므로
# EDGE_SUPABASE_* 이름으로 넣어야 함
EDGE_SUPABASE_URL=https://dwcsxtyobhrcavdpxdjz.supabase.co
EDGE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4-2. 로컬 서버 실행

```bash
# 모든 Functions 실행
supabase functions serve --env-file supabase/functions/.env

# 특정 Function만 실행
supabase functions serve auth-google --env-file supabase/functions/.env

# 디버그 모드
supabase functions serve --env-file supabase/functions/.env --debug
```

### 4-3. 로컬 테스트 URL

```
http://localhost:54321/functions/v1/auth-google
http://localhost:54321/functions/v1/auth-callback
http://localhost:54321/functions/v1/calendar-api
http://localhost:54321/functions/v1/app-api
```

### 4-4. 테스트 방법

#### curl 사용

```bash
# GET 요청
curl http://localhost:54321/functions/v1/auth-google

# POST 요청 (JSON body)
curl -X POST http://localhost:54321/functions/v1/auth-callback \
  -H "Content-Type: application/json" \
  -d '{"code": "test-code"}'

# Authorization 헤더 포함
curl -X POST http://localhost:54321/functions/v1/calendar-api \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"action": "getEvents"}'
```

#### 브라우저 콘솔 사용

```javascript
// 기본 요청
fetch('http://localhost:54321/functions/v1/auth-google', {
  method: 'POST'
}).then(r => r.json()).then(console.log)

// Authorization 포함
fetch('http://localhost:54321/functions/v1/calendar-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({ action: 'getEvents' })
}).then(r => r.json()).then(console.log)
```

### 4-5. 로컬 테스트 시 CORS 설정

```typescript
// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Function에서 사용
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 실제 응답에도 CORS 헤더 포함
  return new Response(
    JSON.stringify({ data: 'hello' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
```

---

## Step 5: 환경변수 설정 (프로덕션)

### 5-1. Supabase Dashboard에서 설정

```
1. Supabase Dashboard 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 왼쪽 메뉴 → Settings → Edge Functions
4. Secrets 탭 클릭
5. 아래 값들 추가:
```

### 5-2. 필요한 Secrets

| Key | Value | 설명 |
|-----|-------|------|
| `GOOGLE_CLIENT_ID` | 422399923346-xxx... | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | GOCSPX-xxx... | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | https://your-domain.com/auth/callback | OAuth Callback URL |
| `DAYF_JWT_SECRET` | (32자 이상 랜덤 문자열) | Dayf JWT 서명용 비밀키 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role 키 | Edge Function에서 DB 직접 접근용 |
| `SUPABASE_URL` | https://dwcsxtyobhrcavdpxdjz.supabase.co | Supabase 프로젝트 URL |

> 참고: 현재 프론트에서 JWT를 생성하고 있으므로 `DAYF_JWT_SECRET`는 `VITE_JWT_SECRET`와 동일해야 합니다.  
> 로컬은 `EDGE_SUPABASE_*`를 사용하지만, 배포 환경에서는 `SUPABASE_*`로 등록하세요.

### 5-3. JWT Secret 생성 방법

```bash
# 터미널에서 랜덤 문자열 생성
openssl rand -base64 32

# 또는 Node.js로
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5-4. Service Role Key 확인

```
Supabase Dashboard → Settings → API → service_role (secret)
```

> ⚠️ **주의**: Service Role Key는 모든 권한을 가지므로 절대 프론트엔드에 노출하면 안 됩니다.

---

## Step 6: 배포

### 6-1. 개별 Function 배포

```bash
supabase functions deploy auth-google
supabase functions deploy auth-callback
supabase functions deploy calendar-api
supabase functions deploy app-api
```

### 6-2. 모든 Functions 한번에 배포

```bash
supabase functions deploy
```

### 6-3. 배포 옵션

```bash
# JWT 검증 비활성화 (공개 API인 경우)
supabase functions deploy auth-google --no-verify-jwt

# 특정 프로젝트에 배포
supabase functions deploy --project-ref dwcsxtyobhrcavdpxdjz
```

### 6-4. 배포 확인

배포 후 Function URL:

```
https://dwcsxtyobhrcavdpxdjz.supabase.co/functions/v1/auth-google
https://dwcsxtyobhrcavdpxdjz.supabase.co/functions/v1/auth-callback
https://dwcsxtyobhrcavdpxdjz.supabase.co/functions/v1/calendar-api
```

### 6-5. 배포 로그 확인

```bash
# 최근 로그 확인
supabase functions logs auth-google

# 실시간 로그 스트리밍
supabase functions logs auth-google --scroll
```

---

## Step 7: Frontend 연동

### 7-1. 환경변수 확인 (.env)

```env
# 기존 값 유지
VITE_SUPABASE_URL=https://dwcsxtyobhrcavdpxdjz.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Edge Function URL은 SUPABASE_URL + /functions/v1/ 로 구성됨
# 별도 환경변수 불필요
```

### 7-2. API 호출 헬퍼 함수

```javascript
// src/services/edgeFunctionService.js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export async function callEdgeFunction(functionName, options = {}) {
  const { method = 'POST', body, headers = {} } = options

  const jwt = sessionStorage.getItem('dayf_jwt')

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(jwt && { 'Authorization': `Bearer ${jwt}` }),
        ...headers
      },
      ...(body && { body: JSON.stringify(body) })
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Edge Function 호출 실패')
  }

  return response.json()
}
```

### 7-3. 사용 예시

```javascript
import { callEdgeFunction } from '../services/edgeFunctionService'

// Google 로그인 시작
const { authUrl } = await callEdgeFunction('auth-google')
window.location.href = authUrl

// OAuth Callback 처리
const result = await callEdgeFunction('auth-callback', {
  body: { code: authorizationCode }
})

// Calendar API 호출
const events = await callEdgeFunction('calendar-api', {
  body: { action: 'getEvents', timeMin, timeMax }
})
```

---

## Google Cloud Console 설정

### OAuth 동의 화면 설정

```
1. Google Cloud Console 접속
2. API 및 서비스 → OAuth 동의 화면
3. 앱 정보 확인/수정
4. 범위(Scopes) 추가:
   - openid
   - email
   - profile
   - https://www.googleapis.com/auth/calendar.events
5. 테스트 사용자 추가 (개발 중인 경우)
```

### OAuth 2.0 클라이언트 설정

```
1. API 및 서비스 → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 선택 (또는 새로 생성)
3. 승인된 리디렉션 URI 추가:

   개발용:
   - http://localhost:5173/auth/callback

   프로덕션:
   - https://your-domain.com/auth/callback
```

---

## 트러블슈팅

### 자주 발생하는 오류

#### 1. CORS 오류

```
Access to fetch at '...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결**: Function에 CORS 헤더 추가

```typescript
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

#### 2. 환경변수 undefined

```
Error: GOOGLE_CLIENT_ID is undefined
```

**해결**:
- 로컬: `--env-file` 옵션 확인
- 프로덕션: Supabase Dashboard Secrets 확인

#### 3. JWT 검증 실패

```
Invalid JWT token
```

**해결**:
- JWT Secret이 일치하는지 확인
- 토큰 만료 여부 확인

#### 4. 배포 실패

```
Error: Function deploy failed
```

**해결**:
- TypeScript 문법 오류 확인
- import URL 유효성 확인
- `supabase functions serve`로 로컬에서 먼저 테스트

---

## 작업 체크리스트

```
□ Step 1: 환경 설정
  ☑ Supabase CLI 설치 완료
  ☑ supabase login 완료
  ☑ supabase init 완료
  ☑ supabase link --project-ref 완료

□ Step 2: 프로젝트 구조
  ☑ supabase functions new auth-google
  ☑ supabase functions new auth-callback
  ☑ supabase functions new calendar-api
  ☑ supabase functions new app-api
  ☑ _shared 폴더 생성

□ Step 3: 코드 작성
  ☑ app-api/index.ts
  □ auth-google/index.ts 실제 구현
  □ auth-callback/index.ts 실제 구현
  □ calendar-api/index.ts 실제 구현
  ☑ src/services/appApi.js

□ Step 4: 로컬 테스트
  ☑ supabase/functions/.env 파일 생성
  ☑ supabase functions serve 실행
  □ curl/fetch로 테스트 완료

□ Step 5: 환경변수 (프로덕션)
  ☑ GOOGLE_CLIENT_ID 등록
  ☑ GOOGLE_CLIENT_SECRET 등록
  ☑ GOOGLE_REDIRECT_URI 등록
  ☑ DAYF_JWT_SECRET 등록
  ☑ SUPABASE_URL 등록
  ☑ SUPABASE_SERVICE_ROLE_KEY 등록

□ Step 6: 배포
  ☑ app-api 배포 완료
  □ 배포 URL 테스트 완료

□ Step 7: Frontend 연동
  ☑ VITE_SUPABASE_FUNCTIONS_URL 설정
  ☑ app-api 호출로 전환
  □ E2E 테스트 완료

□ Google Cloud Console
  ☑ OAuth 동의 화면 설정
  ☑ 리디렉션 URI 추가
```

## 현재 운영 기준 정리

- 실서버에서 실제로 사용 중인 Edge Function은 `app-api`입니다.
- `app-api`는 `verify_jwt = false`로 배포하고, 내부에서 `x-dayf-jwt`를 검증하는 구조입니다.
- `DAYF_JWT_SECRET`는 프론트의 `VITE_JWT_SECRET`와 같은 값으로 설정해야 합니다.
- 근무설정 조회/저장, 일반 로그인, Google 연동 상태 조회, 일부 계정 관리 기능은 현재 `app-api`를 통해 동작합니다.
- `auth-google`, `auth-callback`, `calendar-api`는 추후 서버 주도 OAuth 구조로 전환할 때 사용할 수 있지만, 현재는 미구현/미사용 상태입니다.

---

## 유용한 명령어 모음

```bash
# Supabase CLI 버전 확인
supabase --version

# 프로젝트 상태 확인
supabase status

# Functions 목록 확인
supabase functions list

# Function 생성
supabase functions new <function-name>

# 로컬 실행
supabase functions serve --env-file supabase/functions/.env

# 배포
supabase functions deploy <function-name>
supabase functions deploy  # 전체 배포

# 로그 확인
supabase functions logs <function-name>
supabase functions logs <function-name> --scroll

# Function 삭제
supabase functions delete <function-name>
```

---

이 문서는 Supabase Edge Functions 구현을 위한 사전 작업 가이드입니다.
