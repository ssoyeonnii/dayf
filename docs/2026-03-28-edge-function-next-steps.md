# 2026-03-28 Edge Function 작업 정리

## 목적
- 2026-03-28 기준 Edge Function 관련 작업이 어디까지 완료되었는지 기록한다.
- 기준 날짜: 2026-03-28

## 현재 상태 요약
- `supabase/` 초기화와 Edge Function 폴더 생성은 완료된 상태다.
- `app-api` 함수에는 사용자 로그인, 회원가입, 회원정보 수정, 회원탈퇴, 근무설정 조회/저장, Google 연동 상태 조회 등 주요 로직이 구현되어 있다.
- 프론트 일부 코드는 직접 Supabase를 호출하지 않고 `app-api`를 호출하도록 변경되어 있다.
- 실서버 기준으로 `app-api` 재배포와 secret 설정을 진행했다.
- `app-api`를 실서버에 재배포했고, `DAYF_JWT_SECRET`를 설정한 뒤 실서버에서 저장된 근무설정 조회와 근무설정 저장이 정상 동작하는 것을 확인했다.
- 일반 로그인 계정 탈퇴 후에도 세션이 남던 문제를 수정했다.
- 일반 로그인 계정에 Google 계정을 연동한 뒤 로그아웃/재로그인하면 연동 이메일이 사라지던 문제를 수정했다.
- `auth-google`, `auth-callback`, `calendar-api`는 아직 기본 템플릿 상태라 실제 구현이 안 끝났다.

## 완료된 작업
- `supabase/config.toml`에 `app-api` 함수 설정을 추가했다.
- `app-api`를 `verify_jwt = false` 기준으로 재배포했다.
- Supabase Edge Function secrets에 `DAYF_JWT_SECRET`를 추가했다.
- 실서버에서 로그인 후 저장된 근무설정 조회가 되는지 확인했다.
- 실서버에서 근무설정 저장이 정상 동작하는지 확인했다.
- 탈퇴 성공 후 `dayf_jwt`와 관련 세션을 정리하도록 수정했다.
- Google 연동 시 `social_login_users.provider_user_name` 칼럼에 연동 이메일을 저장하도록 수정했다.
- 재로그인 후에도 Google 연동 이메일이 다시 표시되도록 `google_link_status` 조회 로직을 수정했다.

## 이번에 해결한 원인
- 처음에는 `app-api`가 Supabase 기본 JWT 검증에서 먼저 막혀 `401`이 발생했다.
- 이 문제는 `app-api`를 `--no-verify-jwt`로 다시 배포하여 해결했다.
- 이후에는 `500` 에러가 발생했는데, 원인은 Supabase Edge Function secret에 `DAYF_JWT_SECRET`가 없었기 때문이다.
- `DAYF_JWT_SECRET`에 프론트의 `VITE_JWT_SECRET`와 같은 값을 넣은 뒤 정상 동작을 확인했다.
- 일반 로그인 계정 탈퇴 후에도 로그인이 유지되던 원인은 클라이언트 세션에서 `dayf_jwt`가 지워지지 않았기 때문이다.
- 일반 로그인 계정에 Google 계정을 연동한 뒤 재로그인 시 연동 이메일이 사라지던 원인은 DB에 해당 이메일을 저장/조회하는 로직이 없었기 때문이다.

## 남은 확인 작업
- 실서버에서 Google 소셜 로그인 흐름이 끝까지 정상 동작하는지 다시 확인 필요
- 실서버에서 Google Calendar 동기화 기능이 정상 동작하는지 확인 필요
- 일반 로그인 계정과 Google 로그인 계정 각각에 대해 회원정보 수정, 로그아웃, 탈퇴 흐름을 한 번 더 점검할 필요가 있다.

## 현재 코드 기준 판단
- 근무설정 조회는 `Calendar.jsx`에서 `callAppApi("shifts_get")`를 사용한다.
- 근무설정 저장은 `SettingModal.jsx`에서 `callAppApi("shifts_upsert")`를 사용한다.
- 이 두 기능은 현재 실서버에서 정상 동작 확인 완료
- `app-api`는 Supabase 기본 JWT 검증이 아니라 내부 `x-dayf-jwt` 검증 구조로 운용되어야 한다.
- Google 연동 이메일은 `social_login_users.provider_user_name` 칼럼에 이메일 값으로 저장하는 구조로 맞췄다.

## 아직 미구현 또는 정리 안 된 항목
- `auth-google`
- `auth-callback`
- `calendar-api`
- 위 3개 함수는 현재 기본 템플릿 상태다.
- 앞으로 이 함수를 실제로 구현할지, 아니면 `app-api` 중심 구조로 유지할지 결정이 필요하다.

## 결론
- 오늘 기준으로 급한 오류 수정과 실서버 핵심 동작 복구는 대부분 완료했다.
- 하지만 Edge Function 관련 작업 전체가 완전히 끝난 것은 아니다.
- 특히 Google 소셜 로그인 전체 점검, Google Calendar 동기화 점검, 미구현 함수 구조 정리는 아직 남아 있다.
