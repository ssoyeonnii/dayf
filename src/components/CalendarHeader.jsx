import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CalendarHeader.css"; 

function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  onSettingsClick,
  onTodayClick, // 오늘 버튼 클릭 시 호출될 함수
  currentYear, // 오늘 연도
  currentMonth, // 오늘 월
  onUserInfoClick,
}) {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
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

  const navigate = useNavigate();

  // 회원가입 페이지
  const moveJoin = () => {
    navigate("/UserJoin");
  };

 
  // 회원탈퇴 페이지
  const deleteAccount = () => {
    navigate(`/DeleteAccount/${userId}`);
  };

  // 회원정보 수정 페이지
  const moveUserUpdate = () => {
    navigate("/UserUpdate");
  };

 
  // 세션에서 로그인 정보 불러오기
  useEffect(() => {
    const storedUserName = sessionStorage.getItem("userName");
    const storedUserId = sessionStorage.getItem("userId");

    if (storedUserId && storedUserName) {
      setUserId(storedUserId);
      setUserName(storedUserName);
    }
  }, []);

  return (
    <div className="text-gray-900" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div
        className="mg-b-16"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {userId && (
          <>
            
             {/* 근무설정버튼 */}
            <button
              onClick={onSettingsClick}
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
            {/* 회원정보버튼 */}
            <button
              onClick={onUserInfoClick}
              style={{
                backgroundColor: "transparent",
                width: "fit-content",
              }}
            >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"  width="25px">
             <path d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"/>
             </svg>
            </button>
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
          <div className="div_header_month" onClick={onDateClick}>
            {monthNames[month]}
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
    </div>
  );
}

export default CalendarHeader;
