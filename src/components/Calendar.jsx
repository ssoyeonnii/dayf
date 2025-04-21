import { useEffect, useState } from "react";
import CalendarHeader from "./CalendarHeader";
import ShiftCells from "./ShiftCells";
import { HolidayUtils } from "../utils/HolidayUtils";
import { ShiftUtils } from "../utils/ShiftUtils";

const API_KEY = "AIzaSyCijUEfTJHi9IV_WrUloBy9eI8iGNk-UXQ"; // 보안상 실제 환경에선 환경변수 처리 필요

function Calendar() {
  // 📌 현재 연도/월 상태 관리
  const today = new Date();
  const [date, setDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-based
  });

  const [holidays, setHolidays] = useState([]);
  const [shifts, setShifts] = useState({});

  useEffect(() => {
    const loadHolidaysAndShifts = async () => {
      const [holidaysData, shiftsData] = await Promise.all([
        HolidayUtils(date.year, API_KEY),
        ShiftUtils(date.year, date.month),
      ]);
      setHolidays(holidaysData);
      setShifts(shiftsData);
    };

    loadHolidaysAndShifts();
  }, [date.year, date.month]); // 연도, 월이 바뀌면

  // 월 이동 함수
  const goToPrevMonth = () => {
    setDate((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setDate((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        year={date.year}
        month={date.month}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
      />

      <ShiftCells
        year={date.year}
        month={date.month}
        holidays={holidays}
        shifts={shifts}
      />
    </div>
  );
}

export default Calendar;
