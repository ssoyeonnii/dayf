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
    <div className={`modal ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal_header_txt">{userName}님의 dayf</div>
          <button className="modal_close fs-20" onClick={onClose}>×</button>
        </div>

        <div className="work-settings">
          <div className="work-settings-content">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button type="button" className="modal_btn" onClick={handleUserUpdate}>회원정보 수정</button>
              <button type="button" className="modal_btn" onClick={handleLogout}>로그아웃</button>
              <button type="button" className="modal_btn text-gray-500" onClick={handleDeleteAccount}>회원 탈퇴</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoModal;
