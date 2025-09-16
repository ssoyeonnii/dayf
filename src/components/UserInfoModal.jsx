import React from "react";
import "./Modal.css";
import { useNavigate } from "react-router-dom";

function UserInfoModal({ isOpen, onClose, userId, userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");
    window.location.href = "/";
  };

  const handleUserUpdate = () => {
    navigate("/UserUpdate");
    onClose && onClose();
  };

  const handleDeleteAccount = () => {
    navigate(`/DeleteAccount/${userId}`);
    onClose && onClose();
  };

  return (
    <div className={`user-modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="user-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 섹션 */}
        <div className="user-modal-header">
          <div className="modal_header_txt">{userName}님의 계정관리</div>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 컨텐츠 섹션 */}
        <div className="user-modal-content">
          <div className="user-action-grid">
            <button type="button" className="user-action-btn primary" onClick={handleUserUpdate}>
              <div className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="btn-content">
                <div className="btn-title">회원정보 수정</div>
                <div className="btn-subtitle">프로필 및 설정 변경</div>
              </div>
              <div className="btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
            
            <div className="user-secondary-actions">
              <button type="button" className="user-action-btn secondary" onClick={handleLogout}>
                <div className="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>로그아웃</span>
              </button>
              <button type="button" className="user-action-btn danger" onClick={handleDeleteAccount}>
                <div className="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>회원 탈퇴</span>
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="user-modal-footer">
          <p className="app-version">dayf v1.0</p>
        </div>
      </div>
    </div>
  );
}

export default UserInfoModal;
