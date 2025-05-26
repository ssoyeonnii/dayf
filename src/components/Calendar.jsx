import { useEffect, useState, useRef } from "react";
import CalendarHeader from "./CalendarHeader";
import ShiftCells from "./ShiftCells";
import { HolidayUtils } from "../utils/HolidayUtils";
import { ShiftUtils } from "../utils/ShiftUtils";
import DatePicker from "react-datepicker";
import SettingModal from "./SettingModal";
import "react-datepicker/dist/react-datepicker.css";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // .env.local에 저장된 API_KEY를 가져옴

function Calendar() {
  // 현재 연도/월 상태 관리 => 그래서 datepicker도 header의 상위 컴포넌트에서 관리하는게 맞음
  const today = new Date();
  const [date, setDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-based
  });

  const [holidays, setHolidays] = useState([]);
  const [shifts, setShifts] = useState({});

  //settings 모달창 상태관리 변수
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shiftConfig, setShiftConfig] = useState({
    groupCount: 4,
    pattern: "day-night-off",
    startDate: new Date(),
  });

  // 모달창 배경 클릭시 모달창 닫기 위한 ref
  const modalBackground = useRef();

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

  // 모달용 datepickerRef 추가
  const modalDatepickerRef = useRef(null);

  const openModalDatePicker = () => {
    if (modalDatepickerRef.current) {
      modalDatepickerRef.current.setOpen(true);
    }
  };

  return (
    <div className="calendar-container">
      {isSettingsOpen && (
        <SettingModal
          ref={modalBackground}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(config) => {
            setShiftConfig(config);
            // 설정 변경되었으니 shift 계산 다시 하고 싶다면:
            // loadShifts(config)
          }}
          initialConfig={shiftConfig}
          onDateClick={openModalDatePicker} // 모달용 datepicker 열기
        />
      )}

      {/* 모달용 날짜 선택 */}
      <DatePicker
        ref={modalDatepickerRef}
        selected={shiftConfig.startDate}
        onChange={(selectedDate) => {
          setShiftConfig((prev) => ({
            ...prev,
            startDate: selectedDate,
          }));
        }}
        dateFormat="yyyy-MM-dd"
        minDate={new Date(2025, 2)}
        customInput={<div style={{ display: "none" }} />} // 화면에 보이지 않게
      />

      <CalendarHeader
        year={date.year}
        month={date.month}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onDateClick={goToDatePicker} // 월 변경용 datepicker 열기
        onSettingsClick={() => setIsSettingsOpen(true)}
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
