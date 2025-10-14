import React, { useState, useEffect } from "react";
import "./Modal.css";

// 월 우선 선택 + 연도 selectbox 모달
function CalDateModal({ isOpen, onClose, onDateSelect, currentYear, currentMonth }) {
  const [selectedYear, setSelectedYear] = useState(currentYear || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  // 모달이 열릴 때 현재 캘린더의 연/월로 초기화
  useEffect(() => {
    if (isOpen && currentYear !== undefined) {
      setSelectedYear(currentYear);
    }
  }, [isOpen, currentYear]);

  const thisYear = new Date().getFullYear();
  // 교대근무용: 과거 5년 ~ 미래 10년 (총 16년)
  const years = Array.from({ length: 16 }, (_, i) => thisYear - 5 + i);
  
  const months = [
    { name: "1월", value: 0 }, { name: "2월", value: 1 }, { name: "3월", value: 2 },
    { name: "4월", value: 3 }, { name: "5월", value: 4 }, { name: "6월", value: 5 },
    { name: "7월", value: 6 }, { name: "8월", value: 7 }, { name: "9월", value: 8 },
    { name: "10월", value: 9 }, { name: "11월", value: 10 }, { name: "12월", value: 11 }
  ];

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    onDateSelect(selectedYear, month);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMonth(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="date-modal-overlay flex justify-center items-center" onClick={handleClose}>
      <div className="date-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <div className="date-modal-header flex justify-between items-center pd-y-12 pd-x-8">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="date-year-select pd-y-12 fs-15 fw-600 text-gray-900"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <button
            onClick={handleClose}
            className="date-close-btn fs-24 text-gray-600 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* 월 선택 영역 */}
        <div className="pd-x-8 mg-b-16">
          <div className="date-month-grid">
            {months.map((month) => {
              const isCurrentMonth = selectedYear === currentYear && 
                                   month.value === currentMonth;
              
              return (
                <button
                  key={month.value}
                  onClick={() => handleMonthSelect(month.value)}
                  className={`date-month-btn pd-y-16 fs-15 fw-${isCurrentMonth ? '700' : '500'} text-gray-600 ${isCurrentMonth ? 'active' : ''}`}
                >
                  {month.name}
                  {isCurrentMonth && (
                    <div className="date-current-indicator" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalDateModal;