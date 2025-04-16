import React from "react";

function CalendarHeader({ year, month, onPrevMonth, onNextMonth }) {
  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  return (
    <div className="div_header_container">
      {/* 왼쪽 버튼 */}
      <button onClick={onPrevMonth} className="btn_prev_month">
        &lt;
      </button>

      {/* 중앙 날짜 표시 */}
      <div className="div_header_center">
        <div className="div_header_year">{year}년</div>
        <div className="div_header_month">{monthNames[month]}</div>
      </div>

      {/* 오른쪽 버튼 */}
      <button onClick={onNextMonth} className="btn_next_month">
        &gt;
      </button>
    </div>
  );
}

export default CalendarHeader;
