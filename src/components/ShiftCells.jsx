import React from "react";
import "./Calendar.css";

// 개별 날짜 셀 (근무 유형 표시)
function ShiftCells({ year, month, holidays, shifts }) {
  const today = new Date();
  const todayDate = String(today.getDate()).padStart(2, "0"); // 일
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0"); // 0부터 시작하므로 +1
  const todayYear = today.getFullYear();
  const formattedToday = `${todayYear}-${todayMonth}-${todayDate}`; // YYYY-MM-DD 형식

  const currentMonth = month; // 월
  const currentYear = year;

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  const dates = []; // 날짜 배열 구성하는 로직 (예: 1~31일)

  // 이번 달의 1일 요일
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // 이번 달 마지막 날짜
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  const totalCells = firstDay + lastDate;
  const isSixRows = totalCells > 35;

  // 1일 이전 요일만큼 빈 칸 생성
  for (let i = 0; i < firstDay; i++) {
    dates.push(
      <div
        key={`empty-${i}`}
        className={`date-cell empty ${isSixRows ? "six-weeks" : "five-weeks"}`}
      ></div>
    );
  }

  // 1일부터 마지막 날짜까지 날짜 셀 생성
  for (let day = 1; day <= lastDate; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const holiday = holidays.find((h) => h.date === dateStr);

    const isToday = formattedToday === dateStr;

    const weekDay = new Date(currentYear, currentMonth, day).getDay(); //weekday 0 :일요일 6: 토요일
    let cellClass = "date-cell date";
    if (isSixRows) {
      cellClass += " six-weeks";
    } else {
      cellClass += " five-weeks";
    }
    if (weekDay === 0) cellClass += " date_red";
    else if (weekDay === 6) cellClass += " date_gray";

    // 근무 유형별 색상 클래스 추가
    const shift = shifts[dateStr];
    if (shift === "주간") cellClass += " shiftwork_day";
    else if (shift === "야간") cellClass += " shiftwork_night";
    else if (shift === "오후") cellClass += " shiftwork_evening";

    dates.push(
      <div key={day} className={cellClass}>
        <div className={isToday ? "today-cell" : "date-text"}>
          {holiday ? (
            <>
              <span className="sp_holiday">{day}</span>
              <div className="text-holiday">
                {holiday.title.includes("쉬는 날") ? (
                  <>
                    {holiday.title.replace("쉬는 날", "").trim()}
                    <br />
                    {"대체공휴일"}
                  </>
                ) : (
                  holiday.title
                )}
              </div>
            </>
          ) : (
            <span>{day}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid-container">
      <div className="grid-cols-7">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className={`date-cell yoil-cell ${
              index === 0 ? "text-red-500" : index === 6 ? "text-gray-500" : ""
            }`}
          >
            <span className="sp_yoil">{day}</span>
          </div>
        ))}

        {dates.map((date) => (
          <div key={date.key}>{date}</div>
        ))}
      </div>
    </div>
  );
}

export default ShiftCells;
