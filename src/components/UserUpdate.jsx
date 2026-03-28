import React, { useState, useEffect } from "react";
import { callAppApi } from "../services/appApi.js";
import { useNavigate } from "react-router-dom";
import "./UserJoin.css";
import { getUserInfoFromValidToken, attemptAutoLogin, issueTokensOnLogin } from "../services/tokenManager.js";

function UserUpdate() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 현재 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      // 자동 로그인 시도 (토큰 검증)
      const autoLoginResult = await attemptAutoLogin();
      if (!autoLoginResult.success) {
        alert("로그인이 필요합니다.");
        navigate("/UserLogin");
        return;
      }

      // JWT 토큰에서 사용자 정보 가져오기
      const userInfo = await getUserInfoFromValidToken();
      if (!userInfo || !userInfo.user_id) {
        alert("로그인이 필요합니다.");
        navigate("/UserLogin");
        return;
      }
      
      setUserid(userInfo.user_id);
      setUsername(userInfo.user_name);
    };

    loadUserInfo();
  }, [navigate]);

  // 현재 비밀번호 확인
  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      setErrorMsg("현재 비밀번호를 입력해주세요.");
      return;
    }

    setErrorMsg("");

    try {
      const result = await callAppApi("user_verify_password", {
        user_id: userid,
        user_pw: currentPassword,
      });

      if (result?.valid) {
        setIsPasswordVerified(true);
        setErrorMsg("");
      } else {
        setErrorMsg("비밀번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("비밀번호 확인 오류:", err);
      setErrorMsg("오류가 발생했습니다.");
    } finally {
    }
  };

  // 회원정보 수정
  const handleUpdate = async () => {
    if (!username) {
      alert("이름을 입력해주세요.");
      return;
    }

    // 이름은 영문자 또는 한글만 허용
    const namePattern = /^[A-Za-z가-힣]+$/;
    if (!namePattern.test(username)) {
      alert("이름은 영문자 또는 한글만 입력할 수 있습니다.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      alert("변경할 비밀번호가 일치하지 않습니다.");
      return;
    }


    try {
      await callAppApi("user_update", {
        user_id: userid,
        user_name: username,
        new_password: newPassword || null,
      });

      // JWT 토큰에서 현재 login_type 가져오기
      const userInfo = await getUserInfoFromValidToken();
      if (!userInfo || !userInfo.user_id) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/UserLogin");
        return;
      }
      const loginType = userInfo?.login_type || 'normal';

      // 이름이 변경된 경우 JWT 토큰 재발급
      await issueTokensOnLogin(
        { user_id: userid, user_name: username },
        loginType
      );

      // sessionStorage 업데이트 (fallback용, 마이그레이션 기간 동안)
      sessionStorage.setItem("userName", username);

      alert("회원정보가 수정되었습니다!");
      navigate("/");
    } catch (err) {
      console.error("회원정보 수정 실패:", err);
      alert("오류가 발생했습니다.");
    } finally {
    }
  };

  return (
    <div className="form-container text-gray-900">
      <div className="text-center text-2xl font-bold mg-b-52">회원정보 수정</div>

      {!isPasswordVerified ? (
        <>
          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              autoComplete="off"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          
          {errorMsg && <p style={{ color: "red", fontSize: "14px", marginTop: "6px" }}>{errorMsg}</p>}
          
          <div className="mg-t-24">
            <button
              onClick={verifyCurrentPassword}
              className="form-action-btn"
            >
              확인
            </button>
          </div>

        </>
      ) : (
        // 회원정보 수정 폼
        <>
          <div className="form-group">
            <label>ID</label>
            <input
              type="text"
              value={userid}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>비밀번호 변경</label>
            <input
              type="password"
              autoComplete="off"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="변경할 비밀번호를 입력하세요"
            />
          </div>

          
            <div className="form-group">
              <label>비밀번호 확인</label>
              <input
                type="password"
                autoComplete="off"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="변경할 비밀번호를 다시 입력하세요"
              />
            </div>

          <div className="mg-t-24">
            <button
              onClick={handleUpdate}
              className="form-action-btn"
            >
              수정하기
            </button>
          </div>
        </>
      )}

      
    </div>
  );
}

export default UserUpdate;
