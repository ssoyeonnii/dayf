// 교대 근무 로직 (패턴 생성)
export async function ShiftUtils(year, month) {
  const shifts = {};

  // 기준 근무 시작일 (패턴 시작 기준점)
  // 패턴이 시작되는 일자는 2025-02-10
  // targetdate에 해당하는 근무패턴만 shifts에 저장
  const patternStartDate = new Date(2025, 2, 10); // 2025-02-10 (0-based)
  const targetStartDate = new Date(year, month, 1); // 요청된 연/월의 1일
  const targetEndDate = new Date(year, month + 1, 0); // 요청된 연/월의 마지막 날

  const pattern = [
    { type: "주간", workDays: 5, offDays: 2 },
    { type: "야간", workDays: 5, offDays: 2 },
    { type: "오후", workDays: 5, offDays: 1 },
  ];

  let current = new Date(patternStartDate);
  let patternIndex = 0;

  while (current <= targetEndDate) {
    const { type, workDays, offDays } = pattern[patternIndex];

    // 근무일
    for (let i = 0; i < workDays; i++) {
      if (current >= targetStartDate && current <= targetEndDate) {
        const key = formatDate(current);
        shifts[key] = type;
      }
      current.setDate(current.getDate() + 1);
    }

    // 휴무일
    for (let i = 0; i < offDays; i++) {
      if (current >= targetStartDate && current <= targetEndDate) {
        const key = formatDate(current);
        shifts[key] = "휴무";
      }
      current.setDate(current.getDate() + 1);
    }

    patternIndex = (patternIndex + 1) % pattern.length;
  }

  return shifts;
}

// YYYY-MM-DD 포맷
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}
