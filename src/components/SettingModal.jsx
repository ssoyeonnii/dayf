import React, { useState, useEffect } from "react";
import "./Modal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "./supabaseClient.jsx";

function SettingModal({ isOpen, onClose, onSave, onDateClick, initialConfig }) {
  // 안전한 기본값 보장
  const safeConfig = {
    shiftType: initialConfig?.shiftType || "1",
    pattern: Array.isArray(initialConfig?.pattern)
      ? initialConfig.pattern
      : [
          { type: "주간", workDays: 0, offDays: 0 },
          { type: "야간", workDays: 0, offDays: 0 },
          { type: "오후", workDays: 0, offDays: 0 },
        ],
    holidayOffYn: initialConfig?.holidayOffYn ?? false,
    startDate: initialConfig?.startDate || new Date(),
    patternStartShift: initialConfig?.patternStartShift || "",
    userInfo: initialConfig?.userInfo || { userName: "", userId: "" },
    idx: initialConfig?.idx || "",
  };

  // pattern이 문자열로 들어올 경우를 대비해 항상 배열로 파싱
  let parsedPattern = [];
  try {
    if (Array.isArray(safeConfig.pattern)) {
      parsedPattern = safeConfig.pattern;
    } else if (typeof safeConfig.pattern === "string") {
      parsedPattern = JSON.parse(safeConfig.pattern);
    }
  } catch (e) {
    console.error("pattern 파싱 오류:", e);
    parsedPattern = [];
  }

  // 패턴이 있으면 workdays, offDays값 추출, 없으면 빈 문자열 할당
  const configIdx = safeConfig.idx ?? null;
  //null, 0 값일 경우 0으로 출력
  const dayoworkInitial =
    parsedPattern.find((p) => p.type === "주간")?.workDays ?? "";
  const nightworkInitial =
    parsedPattern.find((p) => p.type === "야간")?.workDays ?? "";
  const eveningworkInitial =
    parsedPattern.find((p) => p.type === "오후")?.workDays ?? "";

  const dayoffInitial =
    parsedPattern.find((p) => p.type === "주간")?.offDays ?? "";
  const nightoffInitial =
    parsedPattern.find((p) => p.type === "야간")?.offDays ?? "";
  const eveningoffInitial =
    parsedPattern.find((p) => p.type === "오후")?.offDays ?? "";

  const [shiftType, setShiftType] = useState(safeConfig.shiftType);
  const [daywork, setDaywork] = useState(dayoworkInitial);
  const [nightwork, setNightwork] = useState(nightworkInitial);
  const [eveningwork, setEveningwork] = useState(eveningworkInitial);
  const [dayoff, setDayoff] = useState(dayoffInitial);
  const [nightoff, setNightoff] = useState(nightoffInitial);
  const [eveningoff, setEveningoff] = useState(eveningoffInitial);
  const [holidayOffYn, setHolidayOffYn] = useState(
    () => safeConfig.holidayOffYn === 2
  );
  const [patternStartDate, setPatternStartDate] = useState(() => {
    if (!safeConfig.startDate) return new Date();
    if (safeConfig.startDate instanceof Date) return safeConfig.startDate;
    const parsed = new Date(safeConfig.startDate);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  });
  const [patternStartShift, setPatternStartShift] = useState(
    safeConfig.patternStartShift
  );
  const userName = safeConfig.userInfo.userName || "";
  const userId = safeConfig.userInfo.userId || "";

  const handleSave = async (e) => {
    e.preventDefault(); // 폼 제출 막기

    // 교대근무 형태, 시작일자의 근무형태 값이 선택되어 있지 않을 경우
    // 4조3교대 : 주간야간오후 근무일 값이 없을 때
    // 이외 : 주간야간 근무일값이 없을 때
    if (
      shiftType == 1 ||
      patternStartShift == "" ||
      (shiftType == 4 && (!daywork || !nightwork || !eveningwork)) ||
      (shiftType !== 4 && (!daywork || !nightwork))
    ) {
      alert("사용자 설정 값을 입력해주세요");
      return;
    }

    // 4조3교대 : 주간야간오후 휴무일 값이 없을 때
    // 이외 : 주간야간 휴무일값이 없을 때
    if (
      (shiftType == 4 && (!dayoff || !nightoff || !eveningoff)) ||
      (shiftType !== 4 && (!dayoff || !nightoff))
    ) {
      const proceed = confirm(
        "휴무일에 값이 없습니다. 확인 버튼을 클릭하면 그대로 저장됩니다.\n저장하시겠습니까?"
      );
      if (!proceed) return;
    }

    // 1. 현재 입력값(state)을 기반으로 pattern 배열 구성
    const pattern = [
      {
        type: "주간",
        workDays: parseInt(daywork) || 0,
        offDays: parseInt(dayoff) || 0,
      },
      {
        type: "야간",
        workDays: parseInt(nightwork) || 0,
        offDays: parseInt(nightoff) || 0,
      },
      {
        type: "오후",
        workDays: parseInt(eveningwork) || 0,
        offDays: parseInt(eveningoff) || 0,
      },
    ];

    const parsedDate = new Date(patternStartDate);
    const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    // 2. Supabase에 저장할 데이터 객체 구성
    const configToSave = {
      user_id: userId,
      shift_type: shiftType,
      pattern: JSON.stringify(pattern),
      holiday_off_yn: holidayOffYn ? 2 : 1,
      pattern_start_date: validDate.toISOString().split("T")[0],
      pattern_start_shift: patternStartShift,
      ...(configIdx ? { id: configIdx } : {}), 
      // id는 조건부로만 추가해야함 -> 새로가입한 사용자의 경우 config데이터가 없기 때문
    };

    // 3. Supabase insert or update 실행 (configIdx가 있으면 update 없으면 insert)
    let result;
    if (configIdx) {
      // console.log("codeidx가 없음");
      // configIdx가 있으면 UPDATE
      result = await supabase
        .from("work_user_shifts")
        .update(configToSave)
        .eq("id", configIdx);
    } else {
      // console.log("codeidx가 없음");
      // configIdx 없으면 INSERT
      result = await supabase.from("work_user_shifts").insert([configToSave]);
    }

    const { data, error } = result;

    if (error) {
      console.error("저장 오류:", error.message);
      alert("설정 저장에 실패했습니다.");
      return;
    }

    alert("저장되었습니다.");

    onSave(configToSave);
    onClose(); // 모달 닫기
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal_header_txt">{userName}의 근무 설정</div>
          <button className="modal_close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSave}>
          <label>
            교대근무 형태
            <select
              name="shiftType"
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
            >
              <option value="1">선택해주세요</option>
              <option value="4">4조3교대</option>
              <option value="3">3조2교대</option>
              <option value="2">2조2교대</option>
            </select>
          </label>

          {/* 근무일 수 + 휴무일 수 한 쌍씩 묶음 */}
          <div className="workoff-container">
            <div className="workoff-row">
              <div className="form-item">
                <label>주간 근무일 수</label>
                <input
                  type="text"
                  value={daywork}
                  onChange={(e) => setDaywork(e.target.value)}
                />
              </div>
              <div className="form-item">
                <label>주간 휴무일</label>
                <input
                  type="text"
                  value={dayoff}
                  onChange={(e) => setDayoff(e.target.value)}
                />
              </div>
            </div>

            <div className="workoff-row">
              <div className="form-item">
                <label>야간 근무일 수</label>
                <input
                  type="text"
                  value={nightwork}
                  onChange={(e) => setNightwork(e.target.value)}
                />
              </div>
              <div className="form-item">
                <label>야간 휴무일</label>
                <input
                  type="text"
                  value={nightoff}
                  onChange={(e) => setNightoff(e.target.value)}
                />
              </div>
            </div>

            {shiftType == 4 && (
              <div className="workoff-row">
                <div className="form-item">
                  <label>오후 근무일 수</label>
                  <input
                    type="text"
                    value={eveningwork}
                    onChange={(e) => setEveningwork(e.target.value)}
                  />
                </div>
                <div className="form-item">
                  <label>오후 휴무일</label>
                  <input
                    type="text"
                    value={eveningoff}
                    onChange={(e) => setEveningoff(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-row holiday-start-date-row">
            <label className="form-label">
              공휴일 휴무 여부
              <input
                type="checkbox"
                checked={holidayOffYn}
                onChange={(e) => setHolidayOffYn(e.target.checked)}
                className="form-input-checkbox"
              />
            </label>

            <label className="form-label">
              교대근무 시작일자
              <DatePicker
                selected={patternStartDate}
                onChange={(date) => setPatternStartDate(date)}
                dateFormat="yyyy-MM-dd"
                minDate={new Date(2025, 2)}
                className="form-input-datepicker"
              />
            </label>
          </div>

          {/* 시작일자의 근무형태 - 기존대로 유지 */}
          <label>
            시작일자의 근무형태
            <select
              value={patternStartShift}
              onChange={(e) => setPatternStartShift(e.target.value)}
            >
              <option value="">선택</option>
              <option value="day">주간</option>
              <option value="night">야간</option>
              {(shiftType == 4 || shiftType === "") && (
                <option value="evening">오후</option>
              )}
            </select>
          </label>

          <div className="modal_button_group">
            <button type="submit" className="modal_btn">
              {/* 사용자 설정값이 db에 저장되어 있는지 확인하기 위해 idx함께 체크 */}
              {initialConfig && initialConfig.idx ? "수정하기" : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingModal;
