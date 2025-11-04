import React, { useState, useEffect } from "react";
import "./Modal.css";
import { supabase } from "./supabaseClient.jsx";

const shiftCodeMap = {
  '주간': 'day',
  '야간': 'night',
  '오후': 'evening'
};


function GoogleCalendarSyncModal({ isOpen, onClose, userId }) {
  const [deleteMode, setDeleteMode] = useState(false); //등록/삭제 모드 전환 (false = 등록 모드, true = 삭제 모드)
  const [startDate, setStartDate] = useState(""); //일정등록 시작일자
  const [endDate, setEndDate] = useState(""); //일정등록 종료일자
  const [deleteStartDate, setDeleteStartDate] = useState(""); //삭제용 시작일자
  const [deleteEndDate, setDeleteEndDate] = useState(""); //삭제용 종료일자
  const [minDate, setMinDate] = useState(""); //일정등록 시작일자 최소값
  const [minEndDate, setMinEndDate] = useState(""); //일정등록 종료일자 최소값
  const [maxEndDate, setMaxEndDate] = useState(""); //일정등록 종료일자 최대값
  const [shiftConfig, setShiftConfig] = useState(null); //사용자 교대근무 설정
  const [isLoading, setIsLoading] = useState(false); //일정등록 버튼 클릭 후 로딩 상태
  const [isDeleting, setIsDeleting] = useState(false); //삭제 진행 중 로딩 상태
  const [deleteAll, setDeleteAll] = useState(false); //전체 삭제 여부 체크박스
  const [previewEvents, setPreviewEvents] = useState([]); //삭제 대상 일정 미리보기 목록
  const [showPreview, setShowPreview] = useState(false); //미리보기 표시 여부

  // Date를 YYYY-MM-DD 형식으로 변환
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 사용자 교대근무 설정 불러오기
  useEffect(() => {
    const fetchShiftConfig = async () => {
      if (!userId || !isOpen) return;

      const { data, error } = await supabase
        .from("work_user_shifts")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("교대근무 설정 조회 오류:", error);
        alert("교대근무 설정을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      if (!data) {
        alert("교대근무 설정되지 않았습니다. 먼저 근무 설정을 완료해주세요.");
        onClose();
        return;
      }

      // 패턴 파싱
      const pattern = typeof data.pattern === "string" 
        ? JSON.parse(data.pattern) 
        : data.pattern;

      const config = {
        shiftType: data.shift_type,
        pattern: pattern,
        holidayOffYn: data.holiday_off_yn,
        startDate: new Date(data.pattern_start_date),
        patternStartShift: data.pattern_start_shift,
      };

      setShiftConfig(config);

      // 일정 등록 시작일자 계산
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const shiftStartDate = new Date(data.pattern_start_date);
      shiftStartDate.setHours(0, 0, 0, 0);

      // settingModal.jsx에서 등록한 교대근무 시작일자가 오늘 이전이면 오늘부터, 미래면 교대근무 시작일자부터
      const calculatedMinDate = shiftStartDate < today ? today : shiftStartDate;
      setMinDate(formatDate(calculatedMinDate));
      setStartDate(formatDate(calculatedMinDate));

      // 시작일로부터 1개월 후를 기본 종료일로 설정
      const defaultEndDate = new Date(calculatedMinDate);
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
      setEndDate(formatDate(defaultEndDate));

      // 종료일 범위 계산 - 시작일부터 선택 가능
      setMinEndDate(formatDate(calculatedMinDate));

      const maxEnd = new Date(calculatedMinDate);
      maxEnd.setMonth(maxEnd.getMonth() + 12);
      setMaxEndDate(formatDate(maxEnd));
    };

    fetchShiftConfig();
  }, [userId, isOpen]);

  // 일정 등록 시작일 변경 시 종료일 범위 계산
  useEffect(() => {
    if (!startDate) return;

    const startDateObj = new Date(startDate);
    
    // 종료일 최소값은 시작일
    setMinEndDate(startDate);

    const maxEnd = new Date(startDateObj);
    maxEnd.setMonth(maxEnd.getMonth() + 12);
    setMaxEndDate(formatDate(maxEnd));

    // 종료일이 범위를 벗어나면 재설정
    if (!endDate || endDate < startDate || endDate > formatDate(maxEnd)) {
      // 기본값은 시작일로부터 1개월 후
      const defaultEnd = new Date(startDateObj);
      defaultEnd.setMonth(defaultEnd.getMonth() + 1);
      setEndDate(formatDate(defaultEnd));
    }
  }, [startDate]);

  //일정 등록 기간 시작일자 변경 핸들러
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  //일정 등록 기간 종료일자 변경 핸들러
  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  //삭제 기간 시작일자 변경 핸들러
  const handleDeleteStartDateChange = (e) => {
    setDeleteStartDate(e.target.value);
  };

  //삭제 기간 종료일자 변경 핸들러
  const handleDeleteEndDateChange = (e) => {
    setDeleteEndDate(e.target.value);
  };

  // 해시 생성 함수
  const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32비트 정수로 변환
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  };

  // 해당 날짜에 이미 교대근무 일정이 있는지 확인
  const checkExistingShiftEvent = async (date) => {
    const accessToken = sessionStorage.getItem("access_token");
    if (!accessToken) return false;

    const timeMin = new Date(date);
    timeMin.setHours(0, 0, 0, 0);
    
    const timeMax = new Date(date);
    timeMax.setHours(23, 59, 59, 999);

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${timeMin.toISOString()}&` +
        `timeMax=${timeMax.toISOString()}&` +
        `singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) return false;

      const data = await response.json();
      const shiftKeywords = ['주간', '야간', '오후', '주간근무', '야간근무', '오후근무', 'shift'];
      
      // 해당 날짜에 교대근무 관련 키워드가 포함된 일정이 있는지 확인
      const hasShiftEvent = data.items?.some(item => {
        const summary = item.summary?.toLowerCase() || '';
        return shiftKeywords.some(keyword => summary.includes(keyword.toLowerCase()));
      });

      return hasShiftEvent;
    } catch (error) {
      console.error('기존 일정 확인 오류:', error);
      return false;
    }
  };

  //Log_google_calendar_events 테이블에 구글캘린더의 일정 정보 저장하는 함수 (등록/삭제 통합)
  const saveEventToSupabase = async (eventData) => {
    try {
      const { data, error } = await supabase
        .from('Log_google_calendar_events')
        .insert([{
          user_id: eventData.user_id,
          dayf_event_id: eventData.dayf_event_id,
          google_event_id: eventData.google_event_id || '', // 등록 시 빈 값, 삭제 시 실제 값
          shift_type: eventData.shift_type,
          event_date: eventData.event_date,
          process_type: eventData.process_type, // 1: 입력, 2: 삭제
          status: eventData.status // 'pending', 'success', 'failed'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Supabase 저장 실패:", error);
      throw error;
    }
  };

  //Log_google_calendar_events 테이블에 google calendar 일정 등록 후 status 업데이트 함수
  const updateEventStatus = async (dayf_event_id, google_event_id, status) => {
    try {
      const { error } = await supabase
        .from('Log_google_calendar_events')
        .update({
          google_event_id: google_event_id,
          process_type: status === 'success' ? 1 : null,
          status: status
        })
        .eq('dayf_event_id', dayf_event_id);

      if (error) throw error;
    } catch (error) {
      console.error("Supabase 업데이트 실패:", error);
      throw error;
    }
  };


  // Google Calendar API에 일정 추가
  const addEventToGoogleCalendar = async (event) => {
    const accessToken = sessionStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("Google 액세스 토큰이 없습니다.");
    }

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Calendar API 오류: ${errorData.error?.message || response.status}`);
    }

    return await response.json();
  };

  // 교대근무 일정 생성 및 Google Calendar에 등록
  const handleSync = async () => {
    if (!startDate || !endDate) {
      alert("시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    if (!shiftConfig) {
      alert("교대근무 설정을 불러오지 못했습니다.");
      return;
    }

    setIsLoading(true);

    try {
      // 사용자 Gmail 계정 가져오기
      const googleEmail = sessionStorage.getItem("google_email");
      if (!googleEmail) {
        alert("Google 계정 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      // 교대근무 패턴으로 일정 생성
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const events = await generateShiftEvents(startDateObj, endDateObj, shiftConfig, googleEmail);

      // Google Calendar에 일정 추가
      let successCount = 0;
      let failCount = 0;
      let skipCount = 0;

      for (const event of events) {
        try {
          // 중복 확인
          if (event.skipDuplicate) {
            skipCount++;
            continue;
          }
             
        let shiftType = 'day'; // 기본값
        for (const [korean, english] of Object.entries(shiftCodeMap)) {
          if (event.summary.includes(korean)) {
            shiftType = english;
            break;
          }
        }

        // dayf_event_id 추출 (extendedProperties에서)
        const dayfEventId = event.extendedProperties.private.dayfEventId;
        
        // event_date 추출 (start.date에서)
        const eventDate = event.start.date;

        // 1단계: Supabase에 먼저 저장 (pending 상태)
        await saveEventToSupabase({
          user_id: userId,
          dayf_event_id: dayfEventId,
          google_event_id: '', // 등록 시 초기에는 빈 값
          shift_type: shiftType,
          event_date: eventDate,
          process_type: 1, // 1: 입력
          status: 'pending' // 대기 중
        });

        // 2단계: Google Calendar에 저장
        // skipDuplicate 필드 제거 후 전송
          const { skipDuplicate, ...eventToSend } = event;
          const googleResponse = await addEventToGoogleCalendar(eventToSend);

        // 3단계: 성공 시 Supabase 업데이트
        await updateEventStatus(dayfEventId, googleResponse.id, 'success');

          successCount++;
        } catch (error) {
          console.error("일정 등록 실패:", error);
          // 실패 시에도 Supabase에 실패 상태 업데이트 시도
          try {
            let shiftType = 'day';
            for (const [korean, english] of Object.entries(shiftCodeMap)) {
              if (event.summary.includes(korean)) {
                shiftType = english;
                break;
              }
            }
            const dayfEventId = event.extendedProperties.private.dayfEventId;
            const eventDate = event.start.date;

            // Supabase에 레코드가 없으면 생성하고, 있으면 업데이트
            const { data: existing } = await supabase
              .from('Log_google_calendar_events')
              .select('id')
              .eq('dayf_event_id', dayfEventId)
              .single();

            if (!existing) {
              // 레코드가 없으면 생성
              await saveEventToSupabase({
                user_id: userId,
                dayf_event_id: dayfEventId,
                google_event_id: '', // 등록 시 초기에는 빈 값
                shift_type: shiftType,
                event_date: eventDate,
                process_type: 1, // 1: 입력
                status: 'failed' // 실패 상태
              });
            }

            // 실패 상태로 업데이트
            await updateEventStatus(dayfEventId, '', 'failed');
          } catch (updateError) {
            console.error("실패 상태 업데이트 실패:", updateError);
          }
            
          failCount++;
        }
      }

      setIsLoading(false);

      if (failCount === 0 && skipCount === 0) {        
        const goToCalendar = confirm(
          `${successCount}개의 일정이 Google Calendar에 등록되었습니다!\nGoogle Calendar로 이동하시겠습니까?`
        );
        
        if (goToCalendar) {
          window.open("https://calendar.google.com", "_blank");
        }
        
        onClose();
      } else {
        let message = `일정 등록 완료!\n성공: ${successCount}개`;
        if (skipCount > 0) {
          message += `\n중복 건너뜀: ${skipCount}개`;
        }
        if (failCount > 0) {
          message += `\n실패: ${failCount}개`;
        }
        message += '\n\n';
        if (skipCount > 0) {
          message += '이미 교대근무 일정이 등록된 날짜는 건너뛰었습니다.\n';
        }
        if (failCount > 0) {
          message += '실패한 일정은 다시 시도해주세요.';
        }
        alert(message);
        
        if (successCount > 0) {
          const goToCalendar = confirm("Google Calendar로 이동하시겠습니까?");
          if (goToCalendar) {
            window.open("https://calendar.google.com", "_blank");
          }
        }
        
        onClose();
      }
    } catch (error) {
      console.error("일정 등록 중 오류:", error);
      setIsLoading(false);
      alert(`일정 등록 중 오류가 발생했습니다.\n${error.message}`);
    }
  };

  // 삭제 대상 미리보기 핸들러
  const handlePreview = async () => {
    try {
      setIsDeleting(true);
      setShowPreview(false);
      const accessToken = sessionStorage.getItem("access_token");

      if (!accessToken) {
        alert("Google Calendar 연동이 필요합니다.");
        setIsDeleting(false);
        return;
      }

      let timeMin, timeMax;

      if (deleteAll) {
        // 전체 삭제 시 매우 넓은 범위 설정
        timeMin = "2020-01-01T00:00:00Z";
        timeMax = "2030-12-31T23:59:59Z";
      } else {
        // 날짜 범위가 설정된 경우
        if (!deleteStartDate || !deleteEndDate) {
          alert("삭제할 날짜 범위를 선택해주세요.");
          setIsDeleting(false);
          return;
        }
        timeMin = new Date(deleteStartDate).toISOString();
        timeMax = new Date(deleteEndDate + "T23:59:59").toISOString();
      }

      // Google Calendar API를 통해 이벤트 조회
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&q=Dayf&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Google Calendar 이벤트 조회 실패");
      }

      const data = await response.json();
      // extendedProperties.private.dayfEventId로 Dayf 일정만 필터링
      const dayfEvents = data.items.filter(event => {
        const hasDayfEventId = event.extendedProperties?.private?.dayfEventId;
        //? : Optional Chaining(옵셔널 체이닝) 연산자
        //왼쪽 값이 null 또는 undefined면 평가를 멈추고 undefined를 반환
        //값이 존재하면 dayfEventId 값 반환
        const hasDayfSummary = event.summary && event.summary.includes("[Dayf]");
        return hasDayfEventId || hasDayfSummary;
      });

      // 미리보기 데이터 포맷
      const previewData = dayfEvents.map(event => ({
        id: event.id,
        summary: event.summary,
        date: event.start.date || event.start.dateTime?.split('T')[0],
        dayfEventId: event.extendedProperties?.private?.dayfEventId,
      }));

      setPreviewEvents(previewData);
      setShowPreview(previewData.length > 0);

      if (previewData.length === 0) {
        alert("삭제할 Dayf 일정이 없습니다.");
      }

    } catch (error) {
      console.error("미리보기 조회 중 오류:", error);
      alert(`미리보기 조회 중 오류가 발생했습니다.\n${error.message}`);
      setShowPreview(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // 일정 삭제 실행 핸들러
  const handleDelete = async () => {
    if (previewEvents.length === 0) {
      alert("삭제할 일정이 없습니다.");
      return;
    }

    const confirmMessage = deleteAll
      ? `모든 Dayf 일정 ${previewEvents.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      : `선택한 기간의 Dayf 일정 ${previewEvents.length}개를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);
      const accessToken = sessionStorage.getItem("access_token");

      if (!accessToken) {
        alert("Google Calendar 연동이 필요합니다.");
        setIsDeleting(false);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // 각 이벤트를 순차적으로 삭제
      for (const event of previewEvents) {
        try {
          const deleteResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          // shift_type 추출 (summary에서)
          let shiftType = 'day'; // 기본값
          for (const [korean, english] of Object.entries(shiftCodeMap)) {
            if (event.summary && event.summary.includes(korean)) {
              shiftType = english;
              break;
            }
          }

          if (deleteResponse.ok) {
            successCount++;

            // Supabase에 삭제 이벤트 정보 저장 (process_type = 2: 삭제)
            try {
              await saveEventToSupabase({
                user_id: userId,
                dayf_event_id: event.dayfEventId || null,
                google_event_id: event.id,
                shift_type: shiftType,
                event_date: event.date,
                process_type: 2, // 2: 삭제
                status: 'success'
              });
            } catch (dbError) {
              console.warn("DB 삭제 이벤트 저장 실패:", dbError);
            }
          } else {
            failCount++;
            console.error(`이벤트 삭제 실패: ${event.id}`);
            
            // 실패 시에도 Supabase에 삭제 이벤트 정보 저장
            try {
              await saveEventToSupabase({
                user_id: userId,
                dayf_event_id: event.dayfEventId || null,
                google_event_id: event.id,
                shift_type: shiftType,
                event_date: event.date,
                process_type: 2, // 2: 삭제
                status: 'failed'
              });
            } catch (dbError) {
              console.warn("DB 삭제 이벤트 저장 실패:", dbError);
            }
          }
        } catch (eventError) {
          failCount++;
          console.error(`이벤트 삭제 오류: ${event.id}`, eventError);
          
          // 실패 시에도 Supabase에 삭제 이벤트 정보 저장
          try {
            // shift_type 추출 (summary에서)
            let shiftType = 'day'; // 기본값
            for (const [korean, english] of Object.entries(shiftCodeMap)) {
              if (event.summary && event.summary.includes(korean)) {
                shiftType = english;
                break;
              }
            }

            await saveEventToSupabase({
              user_id: userId,
              dayf_event_id: event.dayfEventId || null,
              google_event_id: event.id,
              shift_type: shiftType,
              event_date: event.date,
              process_type: 2, // 2: 삭제
              status: 'failed'
            });
          } catch (dbError) {
            console.warn("DB 삭제 이벤트 저장 실패:", dbError);
          }
        }
      }

      let message = `삭제 완료!\n성공: ${successCount}개`;
      if (failCount > 0) {
        message += `\n실패: ${failCount}개`;
      }

      alert(message);

      // 미리보기 초기화
      setPreviewEvents([]);
      setShowPreview(false);
      setDeleteStartDate("");
      setDeleteEndDate("");
      setDeleteAll(false);

    } catch (error) {
      console.error("일정 삭제 중 오류:", error);
      alert(`일정 삭제 중 오류가 발생했습니다.\n${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 패턴의 전체 주기 일수 계산
  const getTotalCycleDays = (pattern) => {
    return pattern.reduce((sum, p) => sum + p.workDays + p.offDays, 0);
  };

  // 특정 날짜가 패턴의 어느 위치인지 계산 (최적화)
  const getPatternPosition = (targetDate, patternStartDate, pattern) => {
    const daysDiff = Math.floor(
      (targetDate.getTime() - patternStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff < 0) {
      // 시작일 이전인 경우 패턴 처음부터
      return { patternIndex: 0, dayInPattern: 0, isWorkDay: pattern[0].workDays > 0 };
    }
    
    const cycleDays = getTotalCycleDays(pattern);
    const positionInCycle = daysDiff % cycleDays;
    
    // positionInCycle이 어느 패턴의 몇 번째 날인지 계산
    let currentPos = 0;
    for (let i = 0; i < pattern.length; i++) {
      const { type, workDays, offDays } = pattern[i];
      const patternDays = workDays + offDays;
      
      if (positionInCycle < currentPos + patternDays) {
        const dayInPattern = positionInCycle - currentPos;
        return {
          patternIndex: i,
          dayInPattern: dayInPattern,
          isWorkDay: dayInPattern < workDays,
          shiftType: type
        };
      }
      currentPos += patternDays;
    }
    
    // 기본값 (도달하지 않아야 함)
    return { patternIndex: 0, dayInPattern: 0, isWorkDay: true };
  };

  //YYYY-MM-DD 형식으로 포맷하는 헬퍼 함수
  const formatAsDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 교대근무 패턴으로 Google Calendar 이벤트 생성
  const generateShiftEvents = async (start, end, config, googleEmail) => {
    const events = [];
    const { pattern, shiftType, patternStartShift, startDate: patternStartDate } = config;
    
    // Gmail ID 추출 및 정규화 (소문자, 특수문자 제거)
    const gmailId = googleEmail.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ''); // 영문자와 숫자만 남김

    // 패턴 순서 조정
    const shiftOrderMap = {
      day: "주간",
      night: "야간",
      evening: "오후",
    };

    let adjustedPattern = pattern;
    // pattern = [
    //   { type: "주간", workDays: 2, offDays: 2 },  // index 0
    //   { type: "오후", workDays: 2, offDays: 2 },  // index 1
    //   { type: "야간", workDays: 2, offDays: 2 }   // index 2
    // ]
    
    // 4조 3교대가 아니면 오후근무 제외 처리(4조 3교대 아니라도 pattern에 오후 값이 기본 값으로 들어가있어서 제외해야함)
    if (shiftType != 4) {
      adjustedPattern = pattern.filter((p) => p.type !== "오후");
    }

    // 교대근무 시작일자의 근무형태에 맞춰 패턴 순서 조정
    const startShiftType = shiftOrderMap[patternStartShift];
    const startIndex = adjustedPattern.findIndex((p) => p.type === startShiftType);
    if (startIndex > -1) {
      adjustedPattern = [
        ...adjustedPattern.slice(startIndex),
        ...adjustedPattern.slice(0, startIndex),
      ];
    }
    //야간이 교대근무시작형태라면  아래와 같이 패턴 순서 조정
    //['주간', '야간', '오후'] => ['야간', '오후', '주간']

    // 근무일 판별을 위한 Set 객체
    const workDayTypes = new Set(["주간", "야간", "오후"]);

    const startDateTime = new Date(start); //startDateTime : google calendar 등록할 일정의 시작일자
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(end); //endDateTime : google calendar 등록할 일정의 종료일자
    endDateTime.setHours(23, 59, 59, 999);

    const configStartDate = new Date(patternStartDate);
    configStartDate.setHours(0, 0, 0, 0);

    // ⚡ 최적화: 등록 시작일의 패턴 위치를 바로 계산
    const startPosition = getPatternPosition(startDateTime, configStartDate, adjustedPattern);
    
    let current = new Date(startDateTime); // 바로 등록 시작일부터 시작
    let patternIndex = startPosition.patternIndex;
    let dayInCurrentPattern = startPosition.dayInPattern;

    // 등록 기간 동안만 루프 (최적화됨!)
    while (current.getTime() <= endDateTime.getTime()) {
      const { type, workDays, offDays } = adjustedPattern[patternIndex];

      // 현재 패턴의 근무일 처리
      if (workDays > 0) {
        // 패턴 중간부터 시작하는 경우를 처리
        const startDay = dayInCurrentPattern < workDays ? dayInCurrentPattern : workDays;
        
        for (let i = startDay; i < workDays; i++) {
          if (current.getTime() > endDateTime.getTime()) break;
          
          const eventDate = new Date(current);

          if (workDayTypes.has(type)) {

            const startDateObj = eventDate;
            const endDateObj = new Date(startDateObj);
            endDateObj.setDate(startDateObj.getDate() + 1); // Google API 규칙: 종료일 + 1일

            const startDateString = formatAsDate(startDateObj); // "YYYY-MM-DD"
            const endDateString = formatAsDate(endDateObj);   // "YYYY-MM-DD" (다음날)

            // dayfEventId 생성: dayf-{gmailId}-yyyymmdd-{근무코드}-해시값
            
            const shiftCode = shiftCodeMap[type] || 'shift';
            const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
            const hashInput = `${gmailId}-${dateStr}-${shiftCode}-${eventDate.getTime()}`;
            const hash = generateHash(hashInput);
            const dayfEventId = `dayf-${gmailId}-${dateStr}-${shiftCode}-${hash}`;

            // 중복 체크를 위한 임시 플래그 추가
            const event = {
              // id는 Google이 자동으로 생성하도록 함
              summary: `[Dayf] ${type} 근무`,
              description: "Dayf에서 자동 등록된 교대근무 일정입니다.",
              start: {
                date: startDateString,
              },
              end: {
                date: endDateString,
              },
              reminders: {
                useDefault: false, // 사용자의 기본 알림 설정을 무시
                overrides: []      // 명시적으로 알림이 없음을 나타내기 위해 빈 배열을 전달
              },
              colorId: type === "주간" ? "5" : type === "야간" ? "1" : "2",
              extendedProperties: {
                private: {
                  dayfEventId: dayfEventId,
                },
              },
              skipDuplicate: false, // 나중에 중복 체크 후 변경
              eventDate: new Date(eventDate), // 중복 체크용
            };

            events.push(event);
          }
          current.setDate(current.getDate() + 1);
        }
      }

      // 휴무일 처리 (일정 생성 안함, 건너뛰기만)
      if (offDays > 0) {
        // 패턴 중간부터 시작하는 경우 휴무일도 고려
        const startOffDay = dayInCurrentPattern >= workDays ? dayInCurrentPattern - workDays : 0;
        
        for (let i = startOffDay; i < offDays; i++) {
          if (current.getTime() > endDateTime.getTime()) break;
          current.setDate(current.getDate() + 1);
        }
      }

      // 다음 패턴으로 이동
      dayInCurrentPattern = 0; // 다음 패턴은 처음부터 시작
      patternIndex = (patternIndex + 1) % adjustedPattern.length;
    }

    // 모든 이벤트에 대해 중복 체크
    for (const event of events) {
      const hasExisting = await checkExistingShiftEvent(event.eventDate);
      if (hasExisting) {
        event.skipDuplicate = true;
      }
      // 중복 체크용 임시 필드 제거
      delete event.eventDate;
    }

    return events;
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Google Calendar 일정 관리</h2>
          <button className="modal_close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* 모드 전환 탭 */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${!deleteMode ? "active" : ""}`}
            onClick={() => {
              setDeleteMode(false);
              // 삭제 모드 상태 초기화
              setPreviewEvents([]);
              setShowPreview(false);
              setDeleteStartDate("");
              setDeleteEndDate("");
              setDeleteAll(false);
            }}
          >
            일정 등록
          </button>
          <button
            className={`modal-tab ${deleteMode ? "active" : ""}`}
            onClick={() => {
              setDeleteMode(true);
              // 등록 모드 상태 초기화는 필요 없음 (등록 모드에서 유지)
            }}
          >
            일정 삭제
          </button>
        </div>

          <div className="modal-body">
            {!deleteMode ? (
              // 일정 등록 모드
              <>
                <div className="form-group">
                  <label>일정 등록 기간</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="date"
                      className="form-input-datepicker"
                      value={startDate}
                      min={minDate}
                      onChange={handleStartDateChange}
                    />
                    <span>~</span>
                    <input
                      type="date"
                      className="form-input-datepicker"
                      value={endDate}
                      min={minEndDate}
                      max={maxEndDate}
                      onChange={handleEndDateChange}
                    />
                  </div>
                  <p className="helper-text" style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                    * 종료일은 시작일부터 최대 12개월까지 선택 가능합니다.
                  </p>
                </div>

                <div className="modal_button_group">
                  <button
                    className="user-action-btn secondary"
                    onClick={handleSync}
                    disabled={isLoading || !startDate || !endDate}
                  >
                    {isLoading ? "등록 중..." : "Google Calendar에 추가"}
                  </button>
                </div>
              </>
            ) : (
              // 일정 삭제 모드
              <>
                <div className="form-group">
                  <label>삭제할 일정 기간</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      type="date"
                      className="form-input-datepicker"
                      value={deleteStartDate}
                      onChange={handleDeleteStartDateChange}
                      disabled={deleteAll}
                    />
                    <span>~</span>
                    <input
                      type="date"
                      className="form-input-datepicker"
                      value={deleteEndDate}
                      min={deleteStartDate}
                      onChange={handleDeleteEndDateChange}
                      disabled={deleteAll}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      checked={deleteAll}
                      onChange={(e) => {
                        setDeleteAll(e.target.checked);
                        if (e.target.checked) {
                          setDeleteStartDate("");
                          setDeleteEndDate("");
                        }
                      }}
                    />
                    전체 삭제 (날짜 범위 무시하고 모든 Dayf 일정 삭제)
                  </label>
                </div>

                <div className="modal_button_group" style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="user-action-btn secondary"
                    onClick={handlePreview}
                    disabled={isDeleting || (!deleteAll && (!deleteStartDate || !deleteEndDate))}
                  >
                    {isDeleting ? "조회 중..." : "삭제 대상 미리보기"}
                  </button>
                  {showPreview && previewEvents.length > 0 && (
                    <button
                      className="user-action-btn secondary"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{ backgroundColor: "#dc3545", color: "white" }}
                    >
                      {isDeleting ? "삭제 중..." : "삭제 실행"}
                    </button>
                  )}
                </div>

                {/* 미리보기 목록 */}
                {showPreview && previewEvents.length > 0 && (
                  <div className="preview-section">
                    <h4>삭제 대상 일정 ({previewEvents.length}개)</h4>
                    <div className="preview-list">
                      {previewEvents.map((event, index) => (
                        <div key={index} className="preview-item">
                          <span className="preview-date">{event.date}</span>
                          <span className="preview-title">{event.summary}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
      </div>
    </div>
  );
}

export default GoogleCalendarSyncModal;

