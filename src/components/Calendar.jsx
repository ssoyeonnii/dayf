import { useEffect, useState, useRef } from "react";
import CalendarHeader from "./CalendarHeader";
import ShiftCells from "./ShiftCells";
import { HolidayUtils } from "../utils/HolidayUtils";
import { ShiftUtils } from "../utils/ShiftUtils";
import DatePicker, { setDefaultLocale } from "react-datepicker";
import SettingModal from "./SettingModal";
import UserInfoModal from "./UserInfoModal";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "./supabaseClient.jsx";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // .env local에 저장된 API_KEY를 가져옴

function Calendar() {
  // 현재 연도/월 상태 관리 => 그래서 datepicker도 header의 상위 컴포넌트에서 관리하는게 맞음
  const today = new Date();
  const [date, setDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(), // 0-based
  });

  const [holidays, setHolidays] = useState([]);
  const [shifts, setShifts] = useState({});

  //사용자설정 없을 경우 기본 default값
  const defaultConfig = {
    shiftType: "1",
    pattern: [
      { type: "주간", workDays: 2, offDays: 0 },
      { type: "야간", workDays: 2, offDays: 0 },
      { type: "오후", workDays: 2, offDays: 0 },
    ],
    holidayOffYn: 2, // 공휴일 휴무 여부
    startDate: new Date(),
    patternStartShift: "", // 시작일자의 근무형태
  };

  //settings 모달창 상태관리 변수
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shiftConfig, setShiftConfig] = useState(null); //사용자  설정 값
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false); // 사용자 정보 모달 상태

  const [userSetConfig, setUserSetConfig] = useState(null); // 사용자가 settingmodal 에서 입력값

  //로그인 유저 정보 저장
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    const id = sessionStorage.getItem("userId");

    if (id && name) {
      setUserName(name);
      setUserId(id);

      const fetchUserConfig = async () => {
        const { data, error } = await supabase
          .from("work_user_shifts")
          .select("*")
          .eq("user_id", id)
          .maybeSingle();

        if (error || !data) {
          // 새로 가입한 사용자의 경우 조용히 기본 설정으로 초기화
          console.log("새 사용자 또는 설정 없음:", error?.message || "데이터 없음");
          
          // 기본 설정으로 초기화
          const defaultConfigWithUser = {
            ...defaultConfig,
            userInfo: {
              userName: name,
              userId: id,
            },
          };
          //console.log(JSON.stringify(defaultConfigWithUser));
          setShiftConfig(defaultConfigWithUser);
          setUserSetConfig(defaultConfigWithUser);
          
          // 새 사용자에게만 설정 모달 표시 (기존 사용자가 설정을 삭제한 경우는 제외)
          if (!error) {
            alert("교대근무 설정을 입력해주세요");
            setIsSettingsOpen(true);
          }
        } else {
          // pattern_json이 문자열이면 JSON.parse
          const parsedPattern =
            typeof data.pattern_json === "string"
              ? JSON.parse(data.pattern_json)
              : data.pattern_json;
          const configdata = {
            idx: data.id,
            shiftType: data.shift_type,
            pattern:
              typeof data.pattern === "string"
                ? JSON.parse(data.pattern)  
                : data.pattern,
            holidayOffYn: data.holiday_off_yn,
            startDate: new Date(data.pattern_start_date),
            patternStartShift: data.pattern_start_shift,
            userInfo: {
              userName: name,
              userId: id,
            },
          };

          setShiftConfig(configdata);
          setUserSetConfig(configdata);

          //console.log(configdata);
        }
      };

      fetchUserConfig();
    }
  }, []);

  useEffect(() => {
    if (!shiftConfig) return;

    const loadHolidaysAndShifts = async () => {
      try {
        let holidaysData = [];
        let shiftsData = [];

        // Always fetch holidays
        holidaysData = await HolidayUtils(date.year, API_KEY);

        //공휴일휴무 Y:2일 경우 공휴일 휴무처리를 위해 holidayList 전달
        if (shiftConfig.holidayOffYn == 2) {
          const holidayList = holidaysData.map((h) => h.date);
          shiftsData = await ShiftUtils(
            date.year,
            date.month,
            shiftConfig,
            holidayList
          );
        } else if (shiftConfig.holidayOffYn == 1) {
          //공휴일휴무 N:1일 경우 공휴일 휴무처리하지 않음
          shiftsData = await ShiftUtils(date.year, date.month, shiftConfig);
        }

        setHolidays(holidaysData);
        setShifts(shiftsData);
      } catch (err) {
        console.error("API 호출 실패:", err);
      }
    };

    loadHolidaysAndShifts();
  }, [date, shiftConfig]);

  // 모달창 배경 클릭시 모달창 닫기 위한 ref
  const modalBackground = useRef();

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

   // 오늘 날짜가 있는 월로 이동하는 함수 추가
   const goToToday = () => {
    const today = new Date();
    setDate({
      year: today.getFullYear(),
      month: today.getMonth(),
    });
  };

  // 모달용 datepickerRef 추가
  const modalDatepickerRef = useRef(null);

  const openModalDatePicker = () => {
    if (modalDatepickerRef.current) {
      modalDatepickerRef.current.setOpen(true);
    }
  };

  return (
    <div className="calendar-container text-gray-900">
      {isSettingsOpen && userSetConfig && (
        <SettingModal
          isOpen={isSettingsOpen}
          ref={modalBackground}
          onClose={() => setIsSettingsOpen(false)}
          onSave={async () => {
            // 모달창이 닫히기 전 실행되는 콜백함수
            //모달창에서 값 저장 후 db에서 shiftconfig값 다시 select하여 변경된 UI 랜더링 
            const { data, error } = await supabase
              .from("work_user_shifts")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle();

            if (error || !data) {
              alert("사용자 설정 값을 저장했으나, 오류가 발생했습니다");
              return;
            }

            //pattern이 json이면 파싱, 아니면 배열 그대로 사용
            const parsedPattern =
              typeof data.pattern === "string"
                ? JSON.parse(data.pattern)
                : data.pattern;

            const configdata = {
              idx: data.id,
              shiftType: data.shift_type,
              pattern: parsedPattern,
              holidayOffYn: data.holiday_off_yn,
              startDate: new Date(data.pattern_start_date),
              patternStartShift: data.pattern_start_shift,
              userInfo: {
                userName,
                userId,
              },
            };

            setShiftConfig(configdata);
            setUserSetConfig(configdata);
          }}
          initialConfig={userSetConfig}
          onDateClick={openModalDatePicker}
        />
      )}

      {/* 모달용 날짜 선택 */}
      {isSettingsOpen && (
        <DatePicker
          ref={modalDatepickerRef}
          selected={shiftConfig.startDate}
          onChange={(selectedDate) => {
            if (!shiftConfig) return;
            const parsed = new Date(selectedDate);
            setShiftConfig((prev) => ({
              ...prev,
              startDate: isNaN(parsed.getTime()) ? new Date() : parsed,
            }));
          }}
          dateFormat="yyyy-MM-dd"
          minDate={new Date(2025, 2)}
          customInput={<div style={{ display: "none" }} />} // 화면에 보이지 않게
        />
      )}

      <CalendarHeader
        year={date.year}
        month={date.month}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onDateClick={goToDatePicker} // 월 변경용 datepicker 열기
        onSettingsClick={
          () => setIsSettingsOpen(true) // 모달 열기
        }
        onTodayClick={goToToday} // 오늘 버튼 클릭 시 호출될 함수
        currentYear={today.getFullYear()} // 오늘 연도
        currentMonth={today.getMonth()} // 오늘 월
        onUserInfoClick={() => setIsUserInfoOpen(true)}
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

      {/* 사용자 정보 모달 */}
      {isUserInfoOpen && (
        <UserInfoModal
          isOpen={isUserInfoOpen}
          onClose={() => setIsUserInfoOpen(false)}
          userId={userId}
          userName={userName}
        />
      )}
    </div>
  );
}

export default Calendar;
