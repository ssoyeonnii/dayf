import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleAccountManage from "../services/googleAuthService.jsx";
import CalDateModal from "./CalDateModal";
import "./CalendarHeader.css"; 

function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onDateSelect, // 날짜 선택 핸들러로 변경
  onSettingsClick,
  onTodayClick, // 오늘 버튼 클릭 시 호출될 함수
  currentYear, // 오늘 연도
  currentMonth, // 오늘 월
}) {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isUserTooltipOpen, setIsUserTooltipOpen] = useState(false);
  const [isSettingsTooltipOpen, setIsSettingsTooltipOpen] = useState(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);

  // 세션에서 로그인 정보 불러오기
  useEffect(() => {
    const storedUserName = sessionStorage.getItem("userName");
    const storedUserId = sessionStorage.getItem("userId");

    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
  }, []);

  // 날짜 모달 열기
  const handleDateClick = () => {
    setIsDateModalOpen(true);
  };

  // 날짜 선택 핸들러
  const handleDateSelectModal = (selectedYear, selectedMonth) => {
    onDateSelect(selectedYear, selectedMonth);
    setIsDateModalOpen(false);
  };

  // 사용자 툴팁 핸들러
  const handleUserTooltipToggle = () => {
    setIsUserTooltipOpen(!isUserTooltipOpen);
    setIsSettingsTooltipOpen(false); // 다른 툴팁 닫기
  };

  // 설정 툴팁 핸들러
  const handleSettingsTooltipToggle = () => {
    // 설정 툴팁 열 때마다 최신 연동 상태 확인 (access_token 기준)
    const storedAccessToken = sessionStorage.getItem("access_token");
    const storedGoogleEmail = sessionStorage.getItem("google_email");

    if ((storedAccessToken && storedGoogleEmail) || (storedAccessToken =="" && storedGoogleEmail)) {
      setIsGoogleCalendarConnected(true);
      setGoogleEmail(storedGoogleEmail);
    } else if(storedAccessToken =="" && storedGoogleEmail =="") {
      setIsGoogleCalendarConnected(false);
      setGoogleEmail(null);
    }
    setIsSettingsTooltipOpen(!isSettingsTooltipOpen);
    setIsUserTooltipOpen(false); // 다른 툴팁 닫기
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("google_email");
    sessionStorage.removeItem("googleuser");
    window.location.href = "/";
  };

  const handleUserUpdate = () => {
    navigate("/UserUpdate");
    setIsUserTooltipOpen(false);
  };

  const handleDeleteAccount = () => {
    navigate(`/DeleteAccount/${userId}`);
    setIsUserTooltipOpen(false);
  };

  // 에러 로그 저장 함수 (프런트에서 직접 DB 저장)
  const saveErrorLog = async (pageName, errCode, errContent) => {
    try {
      await GoogleAccountManage.saveErrorLog(pageName, errCode, errContent, userId);
    } catch (e) {
      console.error('Error log save failed:', e);
    }
  };

  // Google Calendar 연동 핸들러
  const connectGoogleCalendar = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
    prompt: 'consent',
    overrideScope: true,
    onSuccess: async ({ access_token }) => {

      try {
        if (!access_token) {
          alert('Google 액세스 토큰을 받지 못했습니다. 다시 시도해주세요.');
          return;
        }

        // 프런트에서 현재 Dayf 계정에 Google 연동 처리
        const result = await GoogleAccountManage.linkGoogleToCurrentUser(userId, access_token);

        if (result?.error) {
          if (result.error === 'EMAIL_IS_USERID') {
            const confirmed = confirm(
              `선택하신 Google 계정(${result.conflictUserId})은 이미 Dayf 계정 ID로 등록되어 있습니다.\n` +
              `연동 시 다음에 유의해주세요:\n` +
              `• 해당 Google 계정이 현재 계정(${userId})에 연동됩니다.\n` +
              `• 이후 해당 Google 계정으로는 직접 로그인할 수 없습니다.\n` +
              `• 기존에 저장된 근무 설정이 모두 삭제됩니다.\n` +
              `확인 버튼을 클릭하면 연동 완료됩니다.`
            );
            let errmsg = '';
            if (confirmed) {
              const del = await GoogleAccountManage.deleteAccount(result.conflictUserId);
              if (del.success) {
                alert(`${result.conflictUserId} 계정이 삭제되었습니다. Google Calendar 연동을 다시 진행해주세요.`);
                handleGoogleCalendarConnect();
                return; //계정 삭제 후 saveErrorLog()함수 호출 안됨
              } else {
                errmsg = 'dayf 계정 ID의 google 계정 삭제 중 오류가 발생했습니다.';
                alert('계정 삭제 중 오류가 발생했습니다.');
              }
            } else {
              errmsg = 'Google Calendar 연동이 취소되었습니다.';
              alert('Google Calendar 연동이 취소되었습니다.');
            }
            await saveErrorLog('CalendarHeader', 409, errmsg +`: ${result.conflictUserId}`);
            return;
          }
          if (result.error === 'ALREADY_LINKED') {
            alert(result.message || '해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다.');
            await saveErrorLog('CalendarHeader', 409, `Already linked: ${result.message}`);
            return;
          }
          if (result.error === 'DAYF_ACCOUNT_EXISTS') {
            alert(result.message || '해당 이메일로 이미 Dayf 계정이 존재합니다. 일반 로그인을 이용해주세요.');
            await saveErrorLog('CalendarHeader', 409, `Dayf account exists: ${result.message}`);
            return;
          }
          alert(result.message || '알 수 없는 오류가 발생했습니다.');
          await saveErrorLog('CalendarHeader', 409, `Unknown 409 error: ${JSON.stringify(result)}`);
          return;
        }

        const { user, google_email } = result;
        const finalGoogleEmail = google_email || user?.email;

        // 세션에 access_token과 google_email 저장
        sessionStorage.setItem('access_token', access_token);
        if (finalGoogleEmail) {
          sessionStorage.setItem('google_email', finalGoogleEmail);
        }

        // 연동 상태 업데이트
        setIsGoogleCalendarConnected(true);
        setGoogleEmail(finalGoogleEmail); // Google 이메일 표시
        setIsSettingsTooltipOpen(false);

        alert(`Google Calendar 연동이 완료되었습니다!\n연동 계정: ${finalGoogleEmail}`);
      } catch (e) {
        console.error('Google Calendar 연동 중 오류:', e);
        
        // 에러 로그 저장
        await saveErrorLog('CalendarHeader', 'EXCEPTION', `Google Calendar 연동 오류: ${e.message}`);
        
        alert('Google Calendar 연동 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
    onError: (error) => {
      // onError는 Google OAuth 팝업 자체의 실패 (사용자가 취소, 팝업 차단 등)
      console.error('Google 인증 실패:', error);
      
      // 에러 로그 저장 (동기적으로 처리)
      saveErrorLog('CalendarHeader', 'AUTH_FAILED', `Google 인증 실패: ${JSON.stringify(error)}`);
      
      alert('Google 인증에 실패했습니다.');
    },
  });

  const handleGoogleCalendarConnect = () => {
    // access_token 초기화 후 연동 시작
    sessionStorage.removeItem('access_token');
    connectGoogleCalendar();
  };

  // Google Calendar 일정 등록 핸들러
  const handleSyncToGoogleCalendar = () => {
    // TODO: Google Calendar 일정 등록 로직 구현
    alert("Google Calendar 일정 등록 기능 구현 전");
    setIsSettingsTooltipOpen(false);
  };

  // Google 연동 계정 변경 핸들러
  const handleChangeGoogleAccount = async () => {
    if(confirm("현재 연동된 Google Calendar에 Dayf가 등록한 일정이 모두 삭제됩니다.\n연동 계정을 변경하시겠습니까?")){
      //TODO : Google Calendar의 dayf 일정 전체 삭제
      //기존 연동 계정 해제 후 다른 google 계정 선택 위해 0Auth 인증 팝업 표시
      await handleDisconnectGoogle(); //연동해제 핸들러 호출 후 완료되면(await)
      connectGoogleCalendar(); //다른 google 계정 선택 위해 0Auth 인증 팝업 표시
    }
    
  };

  // Google 연동 해제 핸들러
  const handleDisconnectGoogle = async () => {
    // 사용자 확인 - 취소 시 함수 종료
    if (!confirm("현재 연동된 Google Calendar에 Dayf가 등록한 일정이 모두 삭제됩니다.\n연동을 해제하시겠습니까?"
    )) {
      return;
    }
    //TODO : Google Calendar의 dayf 일정 전체 삭제

    try {
        // DB에서도 Google 연동 정보 제거
        const res = await GoogleAccountManage.unlinkGoogleFromUser(userId);
        if (!res.success) {
          alert('연동 해제 중 DB 오류가 발생했습니다.');
          return;
        }

        // 세션에서 access_token과 google_email 제거
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('google_email');
        sessionStorage.removeItem('googleuser');

        // 연동 상태 업데이트 (미연동 툴팁으로 전환)
        setIsGoogleCalendarConnected(false);
        setGoogleEmail(null);
        setIsSettingsTooltipOpen(false);

        alert('Google Calendar 연동이 해제되었습니다.');
      } catch (e) {
        console.error('Disconnect failed:', e);
        // 에러 로그 저장
        await saveErrorLog('CalendarHeader', 'EXCEPTION', `Google Calendar 연동 해제 중 오류: ${e.message}`);

        alert('연동 해제 중 오류가 발생했습니다.');
      }
  };

  return (
    <div className="text-gray-900" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div
        className="mg-b-16"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {userId && (
          <>
             {/* 근무설정버튼 */}
            <div style={{ position: "relative" }}>
              <button
                onClick={handleSettingsTooltipToggle}
                className="btn_setting"
                style={{
                  backgroundColor: "transparent",
                  width: "fit-content",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  width="20px"
                >
                  <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                </svg>
              </button>

              {/* 설정 툴팁 메뉴 */}
              {isSettingsTooltipOpen && (
                <div className="settings-tooltip">
                  {!isGoogleCalendarConnected ? (
                    // Google Calendar 미연동 상태
                    <div className="user-tooltip-actions">
                      <button 
                        className="user-tooltip-btn primary" 
                        onClick={() => {
                          setIsSettingsTooltipOpen(false);
                          onSettingsClick();
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2v6m0 4v10M2 12h6m4 0h10" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        근무 설정
                      </button>
                      <button 
                        className="user-tooltip-btn secondary" 
                        onClick={handleGoogleCalendarConnect}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Google Calendar<br/>연동하기
                      </button>
                    </div>
                  ) : (
                    // Google Calendar 연동 완료 상태
                    <>
                      <div className="user-tooltip-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" 
                                  stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01l-3-3" 
                                  stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="user-tooltip-name" style={{ fontSize: "12px" }}>{googleEmail}</span>
                        </div>
                      </div>
                      <div className="user-tooltip-actions">
                        <button 
                          className="user-tooltip-btn primary" 
                          onClick={() => {
                            setIsSettingsTooltipOpen(false);
                            onSettingsClick();
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2v6m0 4v10M2 12h6m4 0h10" 
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          근무 설정
                        </button>
                        <button 
                          className="user-tooltip-btn secondary" 
                          onClick={handleSyncToGoogleCalendar}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5-5m0 0l5 5m-5-5v12" 
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Google Calendar<br/>일정등록
                        </button>
                        <button 
                          className="user-tooltip-btn secondary" 
                          onClick={handleChangeGoogleAccount}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" 
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Google 연동 계정 변경
                        </button>
                        <button 
                          className="user-tooltip-btn danger" 
                          onClick={handleDisconnectGoogle}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" 
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Google 연동 해제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 회원정보버튼 */}
            <div style={{ position: "relative" }}>
              <button
                onClick={handleUserTooltipToggle}
                style={{
                  backgroundColor: "transparent",
                  width: "fit-content",
                }}
              >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"  width="25px">
               <path d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"/>
               </svg>
              </button>

              {/* 툴팁 메뉴 */}
              {isUserTooltipOpen && (
                <div className="user-tooltip">
                  <div className="user-tooltip-header">
                    <span className="user-tooltip-name">{userName}님</span>
                  </div>
                  <div className="user-tooltip-actions">
                    {sessionStorage.getItem("googleuser") && (
                      <button 
                      className="user-tooltip-btn primary" 
                      onClick={handleUserUpdate}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      회원정보 수정
                    </button>

                    )}
                    
                    <button 
                      className="user-tooltip-btn secondary" 
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      로그아웃
                    </button>
                    <button 
                      className="user-tooltip-btn danger" 
                      onClick={handleDeleteAccount}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" 
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      회원 탈퇴
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="div_header_container">
        {/* 왼쪽 버튼 */}
        <button onClick={onPrevMonth} className="btn_prev_month">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="svg_left"
            viewBox="0 0 320 512"
          >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
          </svg>
        </button>

        {/* 중앙 날짜 표시 */}
        <div className="div_header_center">
          {/* <div className="div_header_year" onClick={onDateClick}>
            {year}
          </div> */}
          <div className="div_header_month fs-18" onClick={handleDateClick}>
            {year}.{String(month + 1).padStart(2, '0')}.
          </div>

        </div>

<div style={{display:"flex"}}>
  {/* 오늘 버튼 - 현재 표시 중인 월이 오늘이 있는 월이 아닐 때만 표시 */}
  {(year !== currentYear || month !== currentMonth) && (
            <button 
              onClick={onTodayClick}
              className="btn_today"
            >
              오늘
            </button>
          )}

        {/* 오른쪽 버튼 */}
        <button onClick={onNextMonth} className="btn_next_month">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="svg_right"
            viewBox="0 0 320 512"
          >
            <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
          </svg>
        </button>
        </div>
      </div>

      {/* CalDateModal 추가 */}
      <CalDateModal 
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onDateSelect={handleDateSelectModal}
        currentYear={year}
        currentMonth={month}
      />
    </div>
  );
}

export default CalendarHeader;
