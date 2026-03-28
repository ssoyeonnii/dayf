import React, { useState, useEffect } from "react";
import { callAppApi } from "../services/appApi.js";
import { useNavigate,useParams } from "react-router-dom";
import { clearClientSession, getUserInfoFromValidToken } from "../services/tokenManager.js";
import GoogleAccountManage from "../services/googleAuthService.jsx";

function DeleteAccount() {
 const { userId } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [tokenUserId, setTokenUserId] = useState(null);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [agreemsg, setAgreemsg] = useState(""); //사용자가 입력하는 탈퇴 동의 메세지
  const canSubmit = isGoogleUser ? agreemsg.trim() === "동의합니다" : !!password.trim();
  //구글 유저면 탈퇴 동의 메세지 입력해야 탈퇴버튼 활성화, 구글 유저가 아닐 경우 비밀번호 입력 시 활성화

  useEffect(() => {
    const loadTokenInfo = async () => {
      const userInfo = await getUserInfoFromValidToken();
      if (userInfo?.user_id) {
        setHasValidToken(true);
        setTokenUserId(userInfo.user_id);
        setIsGoogleUser(userInfo.login_type === "google");
      } else {
        setHasValidToken(false);
        setTokenUserId(null);
        setIsGoogleUser(false);
      }
    };
    loadTokenInfo();
  }, []);

  const deleteUser = async () => {
    
    if (!password && !isGoogleUser) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if ((!agreemsg && isGoogleUser) || (isGoogleUser && agreemsg !== "동의합니다")) {
      alert("동의합니다를 입력해주세요.");
      return;
    }

    if (!window.confirm("정말로 탈퇴하시겠습니까? 복구는 불가능합니다.")) return;

    setLoading(true);

    try {
      // 유효 토큰이 있으면 URL userId와 토큰 userId 일치 여부 확인
      if (hasValidToken && tokenUserId && tokenUserId !== userId) {
        alert("본인 계정이 아닙니다. 다시 로그인해주세요.");
        return;
      }

      if (!hasValidToken) {
        try {
          await GoogleAccountManage.saveErrorLog(
            "DeleteAccount",
            "NO_VALID_TOKEN",
            "탈퇴 요청 시 유효한 JWT가 없음",
            userId
          );
        } catch {}
      }
      if (!isGoogleUser) {
        const result = await callAppApi("user_verify_password", {
          user_id: userId,
          user_pw: password,
        });
        if (!result?.valid) {
          alert("비밀번호가 일치하지 않습니다.");
          return;
        }
      } else if (!hasValidToken) {
        alert("로그인이 만료되었습니다. Google 재로그인이 필요합니다.");
        return;
      }
      // 3. 탈퇴 처리
      await callAppApi("user_delete", { user_id: userId });

      alert("회원 탈퇴가 완료되었습니다.");
      clearClientSession();
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("예기치 못한 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container text-gray-900">
      <div className="text-center text-2xl font-bold mg-b-52">회원 탈퇴</div>
      <p className="text-red-500 fs-18 fw-800 mg-b-24">
        탈퇴 시 계정 정보와 모든 데이터는<br/>
        영구적으로 삭제되며 복구할 수 없으며, 이에 동의합니다.
      </p>

      {/* 구글유저가 아닐 경우 비밀번호 입력 */}
      {!isGoogleUser && (
      <div className="form-group">
        <input
        autoComplete="off"
          type="password"
          style={{borderBottom:"1px solid #000"}}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      )}

      {/* 구글 유저인 경우 동의합니다 입력 */}
      {isGoogleUser && (
      <div className="form-group">
        <input
        autoComplete="off"
          type="text"
          name="agreemsg"
          value={agreemsg}
          style={{borderBottom:"1px solid #000"}}
          onChange={(e) => setAgreemsg(e.target.value)}
          placeholder="동의합니다"
        />
      </div>

      )}

      <div className="mg-t-40 flex justify-center">
        <button
          type="button"
          onClick={deleteUser}
          disabled={!canSubmit}
          className={`user-action-btn danger ${canSubmit ? "active" : "disabled"}`}
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}

export default DeleteAccount;
