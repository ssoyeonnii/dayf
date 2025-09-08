import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.jsx";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import "./UserJoin.css";

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
    const currentUserId = sessionStorage.getItem("userId");
    const currentUserName = sessionStorage.getItem("userName");
    
    if (!currentUserId || !currentUserName) {
      alert("로그인이 필요합니다.");
      navigate("/UserLogin");
      return;
    }
    
    setUserid(currentUserId);
    setUsername(currentUserName);
  }, [navigate]);

  // 현재 비밀번호 확인
  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      setErrorMsg("현재 비밀번호를 입력해주세요.");
      return;
    }

    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("work_users")
        .select("user_pw")
        .eq("user_id", userid)
        .single();

      if (error) {
        setErrorMsg("사용자 정보를 불러오는 데 실패했습니다.");
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(currentPassword, data.user_pw);
      
      if (isPasswordCorrect) {
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
      let updateData = { user_name: username };
      
      // 새 비밀번호가 입력된 경우에만 업데이트
      if (newPassword) {
        const hashedPw = await bcrypt.hash(newPassword, 10);
        updateData.user_pw = hashedPw;
      }

      const { error } = await supabase
        .from("work_users")
        .update(updateData)
        .eq("user_id", userid);

      if (error) {
        console.error("회원정보 수정 오류:", error.message);
        alert("회원정보 수정에 실패했습니다.");
      } else {
        alert("회원정보가 수정되었습니다!");
        // sessionStorage 업데이트
        sessionStorage.setItem("userName", username);
        navigate("/");
      }
    } catch (err) {
      console.error("회원정보 수정 실패:", err);
      alert("오류가 발생했습니다.");
    } finally {
    }
  };

  return (
    <div className="form-container text-gray-900">
      <div className="text-center text-2xl font-bold mg-b-24">회원정보 수정</div>

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
              className="pd-x-8 pd-y-12 rounded-lg font-semibold transition w-full text-gray-900 border-blue-700 border-2 bg-white disabled:bg-gray-300"
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
              className="pd-x-8 pd-y-12 rounded-lg font-semibold transition w-full text-gray-900 border-blue-700 border-2 bg-white disabled:bg-gray-300"
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
