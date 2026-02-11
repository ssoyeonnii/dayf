# shiftwork

교대근무 일정표 나타내는 웹앱입니다.

# 주요기능

1.연/월 달력 탐색 -월별로 근무 일정을 확인할 수 있는 네비게이션 바
-react-datepicker를 활용

2.패턴에 따라 근무 및 휴무 일자 구별
[4조 3교대]
주간 5일 => 2일 휴무
야간 5일 => 2일 휴무
오후 5일 => 1일 휴무

3. 대한민국 공휴일 반영

# 사용 api

1.Google Calendar API -캘린더 ID: ko.south_korea#holiday@group.v.calendar.google.com -대한민국 공휴일 연동용

# 사용 라이브러리

1. react-datepicker

# 현재 구현 요약

1. 프론트에서 JWT 발급 및 sessionStorage 저장 (`dayf_jwt`)
2. Google 로그인 시 Google access token을 암호화하여 DB 저장
3. Google API 호출 시 JWT에서 user_id 추출 → DB에서 access token 조회 후 호출

# 향후 보완사항

1.다양한 근무패턴에 따라 확인 가능

## 인증/토큰 흐름 (현재)

1. Google 로그인 성공 → Google access token을 DB에 암호화 저장
2. 프론트에서 JWT 발급 → sessionStorage의 `dayf_jwt`에 저장
3. Google API 호출 시 JWT 디코딩 → user_id로 DB에서 Google access token 조회

## 향후 개선 계획

1. Google API 호출을 Edge Function/백엔드로 이전
2. JWT 발급 및 검증을 서버로 이전
