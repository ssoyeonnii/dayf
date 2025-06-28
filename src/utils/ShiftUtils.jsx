import { HolidayUtils } from "./HolidayUtils";
// 교대 근무 로직 (패턴 생성)
export async function ShiftUtils(
  year,
  month,
  userConfig = null,
  holidayList = []
) {
  const shifts = {};
  // 기준 근무 시작일 (패턴 시작 기준점)
  // 패턴이 시작되는 일자는 2025-02-10
  // targetdate에 해당하는 근무패턴만 shifts에 저장
  const defaultStartDate = new Date(2025, 2, 10); // 2025-03-10  // default 교대근무 출력 시작일자
  const patternStartDate = userConfig?.startDate || defaultStartDate; //사용자 값이 없을 경우 default 값
  //const patternStartDate = new Date(2025, 2, 10); // 2025-02-10 (0-based)
  const targetStartDate = new Date(year, month, 1); // 요청된 연/월의 1일
  targetStartDate.setHours(0, 0, 0, 0); // 시작일의 시간을 00:00:00으로 설정
  
  // 월의 마지막 날짜 계산 수정
  const lastDay = new Date(year, month + 1, 0).getDate();
  const targetEndDate = new Date(year, month, lastDay); // 요청된 연/월의 마지막 날
  targetEndDate.setHours(23, 59, 59, 999); // 마지막 날의 시간을 23:59:59로 설정

  // console.log('Target Date Range:', {
  //   start: formatDate(targetStartDate),
  //   end: formatDate(targetEndDate),
  //   lastDay,
  //   startTime: targetStartDate.toISOString(),
  //   endTime: targetEndDate.toISOString()
  // });

  const defaultPattern = [
    { type: "주간", workDays: 5, offDays: 2 },
    { type: "야간", workDays: 5, offDays: 2 },
    { type: "오후", workDays: 5, offDays: 1 },
  ];

  const fullPattern = Array.isArray(userConfig?.pattern)
    ? userConfig.pattern
    : defaultPattern;

  // 오후근무 제외 조건 처리
  const shiftType = userConfig?.shiftType || "4";
  //pattern은 아래에서 재할당하므로 let으로 선언
  let pattern =
    shiftType == 4
      ? fullPattern
      : fullPattern.filter((p) => p.type !== "오후");

  // patternStartShift 기준으로 패턴 순서 조정
  const patternStartShift = userConfig?.patternStartShift || "day"; // 기본값: 주간

  const shiftOrderMap = {
    day: "주간",
    night: "야간",
    evening: "오후",
  };

  const startShiftType = shiftOrderMap[patternStartShift]; // 실제 타입명 변환
  // console.log('Pattern Start Shift:', {
  //   patternStartShift,
  //   startShiftType,
  //   pattern: pattern.map(p => p.type)
  // });

  const startIndex = pattern.findIndex((p) => p.type === startShiftType);
  if (startIndex > -1) {
    pattern = [...pattern.slice(startIndex), ...pattern.slice(0, startIndex)];
  }

  //console.log('Reordered Pattern:', pattern.map(p => p.type));

  const holidayOffYn = userConfig?.holidayOffYn; //공휴일 휴무여부

  let current = new Date(patternStartDate);
  current.setHours(0, 0, 0, 0); // 현재 날짜의 시간도 00:00:00으로 설정
  let patternIndex = 0;

  // 마지막 날짜까지 포함하도록 수정
  while (current.getTime() <= targetEndDate.getTime()) {
    const { type, workDays, offDays } = pattern[patternIndex];

    // 근무일
    for (let i = 0; i < workDays; i++) {
      if (current.getTime() >= targetStartDate.getTime() && current.getTime() <= targetEndDate.getTime()) {
        const key = formatDate(current);
        if (holidayOffYn && holidayList.includes(key)) {
          shifts[key] = "휴무";
        } else {
          shifts[key] = type;
        }
      }
      current.setDate(current.getDate() + 1);
    }

    // 휴무일
    for (let i = 0; i < offDays; i++) {
      if (current.getTime() >= targetStartDate.getTime() && current.getTime() <= targetEndDate.getTime()) {
        const key = formatDate(current);
        shifts[key] = "휴무";
      }
      current.setDate(current.getDate() + 1);
    }

    patternIndex = (patternIndex + 1) % pattern.length;
  }

  //console.log('Generated Shifts:', shifts);
  return shifts;
}

// YYYY-MM-DD 포맷
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}
