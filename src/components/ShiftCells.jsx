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
  // 0: 일요일, 1: 월요일, ..., 6: 토요일
  // Date(currentYear, currentMonth, 1) : 해당 연/월의 1일
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // 이번 달 마지막 날짜
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 빈 칸을 포함한 총 날짜 셀 수
  const totalCells = firstDay + lastDate;

  // 6주로 구성된 달인지 확인하는 변수 => 6주(셀 갯수:36개~)일 경우 셀 스타일 조정함
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
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const holiday = holidays.find((h) => h.date === dateStr);
    const isToday = formattedToday === dateStr;

    // console.log('Processing date:', {
    //   dateStr,
    //   shift: shifts[dateStr],
    //   holiday: holiday?.title
    // });

    const weekDay = new Date(currentYear, currentMonth, day).getDay(); //weekday 0 :일요일 6: 토요일
    let cellClass = "date-cell date";

    //****** 날짜 셀 클래스 설정 : 5주/6주에 따라 셀 크기 적용 ******//
    if (isSixRows) {
      cellClass += " six-weeks";
    } else {
      cellClass += " five-weeks";
    }

    //****** 날짜 셀 클래스 설정 : 일요일 혹은 토요일에 따라 날짜 색상 적용 ******//
    if (weekDay === 0) cellClass += " date_red";
    else if (weekDay === 6) cellClass += " date_gray";

    //****** 날짜 셀 클래스 설정 : 근무 유형별 날짜 셀 background 적용 ******//
    const shift = shifts[dateStr];
    if (shift === "주간") cellClass += " shiftwork_day";
    else if (shift === "야간") cellClass += " shiftwork_night";
    else if (shift === "오후") cellClass += " shiftwork_evening";
    else if (shift === "휴무") cellClass += " shiftwork_off";

    dates.push(
      <div key={day} className={cellClass}>
        <div className="date-text">
          {holiday ? (
            <>
              <span className={`sp_holiday ${isToday ? "today-cell" : ""}`}>
                {day}
              </span>
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
            <span className={isToday ? "today-cell" : ""}>{day}</span>
          )}
        </div>
        <span className="shiftwork_name">
          {["주간", "야간", "오후"].includes(shift) ? shift : ""}
        </span>
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
