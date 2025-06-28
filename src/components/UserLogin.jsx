import React, { useState } from "react";
import { supabase } from "./supabaseClient.jsx";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import "./UserJoin.css";

function UserLogin() {
  const [userid, setUserid] = useState("");
  const [userpw, setUserpw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();


  const handleLogin = async () => {
    if (!userid || !userpw) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    // 1. DB에서 입력한 ID로 사용자 조회
    const { data, error } = await supabase
      .from("work_users")
      .select("*")
      .eq("user_id", userid)
      .single();

    if (error || !data) {
      setErrorMsg("존재하지 않는 아이디입니다.");
      return;
    }

    // 2. 비밀번호 비교
    const isPasswordCorrect = await bcrypt.compare(userpw, data.user_pw);

    if (isPasswordCorrect) {
      alert(`${data.user_name}님 환영합니다!`);

      // sessionStorage에 저장
      sessionStorage.setItem("userName", data.user_name);
      sessionStorage.setItem("userId", data.user_id);
              
      navigate("/"); //calendar.jsx로 이동
    } else {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <div className="form-container">
      <h2>로그인</h2>
      <div className="form-group">
        <label>ID</label>
        <input
          type="text"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>비밀번호</label>
        <input
          type="password"
          value={userpw}
          onChange={(e) => setUserpw(e.target.value)}
        />
      </div>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleLogin} style={{ width: "100%" }}>로그인</button>
      </div>
    </div>
  );
}

export default UserLogin;
