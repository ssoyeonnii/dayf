import { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader";
import ShiftCells from "./ShiftCells";
import { HolidayUtils } from "../utils/HolidayUtils";

const API_KEY = "AIzaSyCijUEfTJHi9IV_WrUloBy9eI8iGNk-UXQ"; // 보안상 실제 환경에선 환경변수 처리 필요

function Calendar() {
  // 📌 현재 연도/월 상태 관리
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0~11

  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const loadHolidays = async () => {
      const data = await HolidayUtils(year, API_KEY);
      setHolidays(data);
    };

    loadHolidays();
  }, [year]); // 연도가 바뀌면 새로 로딩

  // 📌 월 이동 함수
  const goToPrevMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />

      <ShiftCells year={year} month={month} holidays={holidays} />
    </div>
  );
}

export default Calendar;
