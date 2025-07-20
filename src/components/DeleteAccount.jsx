import React, { useState } from "react";
import { supabase } from "./supabaseClient.jsx";
import bcrypt from "bcryptjs";
import { useNavigate,useParams } from "react-router-dom";

function DeleteAccount() {
 const { userId } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteUser = async () => {
    if (!agree) {
      alert("모든 정보 삭제에 동의해야 탈퇴가 가능합니다.");
      return;
    }

    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!window.confirm("정말로 탈퇴하시겠습니까? 복구는 불가능합니다.")) return;

    setLoading(true);

    try {
       // 1. DB에서 현재 유저의 해시된 비밀번호 조회
      const { data, error } = await supabase
        .from("work_users")
        .select("user_pw")
        .eq("user_id", userId)
        .single();

      if (error) {
        alert("사용자 정보를 불러오는 데 실패했습니다.");
        return;
      }
      const hashedPassword = data.user_pw;

      // 2. 입력한 비밀번호와 DB 해시값 비교
      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (!isMatch) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      // 3. 탈퇴 처리
      // 3.1. work_user_shift테이블에서 user_id를 참조하는 데이터 삭제
      const { error: deleteShiftError } = await supabase
        .from("work_user_shift")
        .delete()
        .eq("user_id", userId);

      if (deleteShiftError) {
        alert("회원 교대 근무 정보 삭제 실패: " + deleteShiftError.message);
      }

      // 3.2. work_users테이블에서 user 데이터 삭제
      const { error: deleteError } = await supabase
        .from("work_users")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        alert("회원 탈퇴 실패: " + deleteError.message);
      } else {
        alert("회원 탈퇴가 완료되었습니다.");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userName");
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      alert("예기치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>회원 탈퇴</h2>
      <p style={styles.warning}>
        탈퇴 시 계정 정보와 모든 데이터는 영구적으로 삭제되며 복구할 수 없습니다.
      </p>

      <div style={styles.section}>
        <input
          type="password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <div style={styles.section}>
        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          {" "}모든 정보를 삭제하는 데 동의합니다.
        </label>
      </div>

      <button
        onClick={deleteUser}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "처리 중..." : "회원 탈퇴"}
      </button>
    </div>
  );
}

export default DeleteAccount;

const styles = {
  container: {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "sans-serif",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  warning: {
    color: "#c00",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#c00",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
