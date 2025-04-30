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

# 향후 보완사항

1.다양한 근무패턴에 따라 확인 가능
