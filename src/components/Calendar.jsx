import { useEffect, useState, useRef } from "react";
import CalendarHeader from "./CalendarHeader";
import ShiftCells from "./ShiftCells";
import { HolidayUtils } from "../utils/HolidayUtils";
import { ShiftUtils } from "../utils/ShiftUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_KEY = "AIzaSyCijUEfTJHi9IV_WrUloBy9eI8iGNk-UXQ"; // 보안상 실제 환경에선 환경변수 처리 필요

function Calendar() {
  // 현재 연도/월 상태 관리 => 그래서 datepicker도 header의 상위 컴포넌트에서 관리하는게 맞음
  const today = new Date();
  const [date, setDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-based
  });

  const [holidays, setHolidays] = useState([]);
  const [shifts, setShifts] = useState({});

  useEffect(() => {
    const loadHolidaysAndShifts = async () => {
      try {
        const [holidaysData, shiftsData] = await Promise.all([
          HolidayUtils(date.year, API_KEY),
          ShiftUtils(date.year, date.month),
        ]);
        //console.log(" API 호출 성공:", holidaysData, shiftsData);
        setHolidays(holidaysData);
        setShifts(shiftsData);
      } catch (err) {
        console.error("API 호출 실패:", err);
      }
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

  const datepickerRef = useRef(null);

  const goToDatePicker = () => {
    if (datepickerRef.current) {
      datepickerRef.current.setOpen(true);
    }
  };

  return (
    <div className="calendar-container">
      <CalendarHeader
        year={date.year}
        month={date.month}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onDateClick={goToDatePicker}
      />

      {/* 숨겨진 DatePicker popup */}
      <DatePicker
        ref={datepickerRef}
        selected={new Date(date.year, date.month)}
        onChange={(selectedDate) => {
          setDate({
            year: selectedDate.getFullYear(),
            month: selectedDate.getMonth(),
          });
        }}
        showMonthYearPicker
        dateFormat="yyyy-MM"
        minDate={new Date(2025, 2)}
        customInput={<div style={{ display: "none" }} />} // 보이지 않게 렌더링
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
