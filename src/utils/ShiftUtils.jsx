// 교대 근무 로직 (패턴 생성)
export async function ShiftUtils(year, month) {
  const shifts = {};

  // 근무 시작일 (기준일)
  const startDate = new Date(2025, 2, 10); // 2025-03-10 (0-based: 2월이 3월)
  const endDate = new Date(year, month + 1, 0); // 월 말일까지

  const pattern = [
    { type: "주간", workDays: 5, offDays: 2 },
    { type: "야간", workDays: 5, offDays: 2 },
    { type: "오후", workDays: 5, offDays: 1 },
  ];

  let current = new Date(startDate);
  let patternIndex = 0;

  while (current <= endDate) {
    const { type, workDays, offDays } = pattern[patternIndex];

    // 근무일 할당
    for (let i = 0; i < workDays; i++) {
      if (current.getFullYear() === year && current.getMonth() === month) {
        const key = formatDate(current);
        shifts[key] = type;
      }
      current.setDate(current.getDate() + 1);
    }

    // 휴무일 할당
    for (let i = 0; i < offDays; i++) {
      if (current.getFullYear() === year && current.getMonth() === month) {
        const key = formatDate(current);
        shifts[key] = "휴무";
      }
      current.setDate(current.getDate() + 1);
    }

    // 다음 근무 유형으로
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
