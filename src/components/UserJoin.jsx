import React, { useState, useRef } from "react";
import { supabase } from "./supabaseClient.jsx";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import "./UserJoin.css";

function UserJoin() {
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [userpw, setUserpw] = useState("");
  const [checkMsg, setCheckMsg] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const navigate = useNavigate();
  const duplicateCheckTimerRef = useRef(null);

  const doDuplicateCheck = async (value) => {
    if (!value.trim()) {
      setCheckMsg("ID를 입력해주세요.");
      setIsDuplicate(false);
      return;
    }

    const idPattern = /^[A-Za-z0-9]+$/;
    if (!idPattern.test(value)) {
      setCheckMsg("ID는 영문자와 숫자만 사용할 수 있습니다.");
      setIsDuplicate(false);
      return;
    }

    const { data, error } = await supabase
      .from("work_users")
      .select("user_id")
      .eq("user_id", value);

    if (error) {
      console.error("중복 확인 오류:", error.message);
      setCheckMsg("오류가 발생했습니다.");
      setIsDuplicate(false);
      return;
    }

    if (data.length > 0) {
      setCheckMsg("이미 존재하는 ID입니다.");
      setIsDuplicate(true);
    } else {
      setCheckMsg("사용 가능한 ID입니다.");
      setIsDuplicate(false);
    }
  };

  const scheduleDuplicateCheck = () => {
    if (duplicateCheckTimerRef.current) {
      clearTimeout(duplicateCheckTimerRef.current);
    }
    duplicateCheckTimerRef.current = setTimeout(() => {
      doDuplicateCheck(userid);
    }, 300);
  };

  const handleSignUp = async () => {
    if (!username || !userid || !userpw) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    // 이름는 영문자 또는 한글만 허용
    const namePattern = /^[A-Za-z가-힣]+$/;
    if (!namePattern.test(username)) {
      alert("이름은 영문자 또는 한글만 입력할 수 있습니다.");
      return;
    }

    if (isDuplicate) {
      alert("중복된 ID입니다. 다른 ID를 사용해주세요.");
      return;
    }

    try {
      const hashedPw = await bcrypt.hash(userpw, 10);

      const { data, error } = await supabase.from("work_users").insert([
        {
          user_id: userid,
          user_pw: hashedPw,
          user_name: username,
        },
      ]);

      if (error) {
        console.error("회원가입 오류:", error.message);
        alert("회원가입에 실패했습니다.");
      } else {
        alert("회원가입 완료!");
        
        // 자동 로그인 처리
        sessionStorage.setItem("userName", username);
        sessionStorage.setItem("userId", userid);
        
        setUsername("");
        setUserid("");
        setUserpw("");
        setCheckMsg("");
        navigate("/"); // 캘린더 페이지로 이동
      }
    } catch (err) {
      console.error("비밀번호 암호화 실패:", err);
    }
  };

  return (
    <div className="form-container text-gray-900">
      {/* <div className="text-center text-2xl font-bold">회원가입</div> */}

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
        <label>ID</label>
        <div className="input-button-wrapper">
          <input
            type="text"
            autoComplete="off"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            onKeyDown={scheduleDuplicateCheck}
            onKeyUp={scheduleDuplicateCheck}
          />

        </div>
        <div className="check-message">{checkMsg}</div>
      </div>

      <div className="form-group">
        <label>비밀번호</label>
        <input
          type="password"
          autoComplete="off"
          value={userpw}
          onChange={(e) => setUserpw(e.target.value)}
        />
      </div>
      <div className="mg-t-24">
        <button
          onClick={handleSignUp}
          className="form-action-btn"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default UserJoin;
