import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient.jsx";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    try {
        //Google credentialResponse: 구글에서 내려준 전체 응답 객체(여기서는 토큰 포함)
      //구글 로그인 성공 시 토큰 받아오기
      //console.log("Google credentialResponse:", credentialResponse);
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        console.error("구글 토큰 정보를 불러올 수 없습니다.");
        return;
      }
      //console.log("Google ID token:", idToken);

      const base64Payload = idToken.split(".")[1];
      const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
      const binaryString = atob(base64);
      const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      const payload = JSON.parse(json);

      const userName = payload?.name || payload?.given_name || payload?.email || "GoogleUser";
      const googleSub = payload?.sub;
      const userEmail = payload?.email;

      if (!userEmail) {
        console.error("google 이메일 정보를 불러올 수 없습니다.");
        return;
      }

      // work_users 테이블에 userEmail로 유저데이터 있는지 확인
      const { data: existingRows, error: findError } = await supabase
        .from("work_users")
        .select("user_id")
        .eq("user_id", userEmail);

      if (findError) {
        console.error("user_id로 유저데이터 조회 실패:", findError);
        return;
      }

      if (!existingRows || existingRows.length === 0) {
        // work_users 테이블에 유저데이터없으면 Insert
        const { error: insertError } = await supabase.from("work_users").insert([
          {
            user_id: userEmail,
            user_pw: null,
            user_name: userName,
            google_sub: googleSub || null,
          },
        ]);
        if (insertError) {
          console.error("구글 유저 데이터 DB insert 실패:", insertError);
          return;
        }
      }

      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("userId", userEmail);
      sessionStorage.setItem("googleuser", "1");

      alert(`${userName}님 환영합니다!`);
      navigate("/");
    } catch (e) {
      console.error("구글 로그인 응답 처리 실패:", e);
    }
  };

  const handleError = () => {
    console.error("구글 로그인 실패");
  };

  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID 값이 설정되지 않았습니다. 구글 로그인이 작동하지 않습니다.");
  }

  return (
    <>
      <GoogleOAuthProvider clientId={clientId || ""}>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} use_fedcm_for_prompt />
      </GoogleOAuthProvider>
    </>
  );
};

export default GoogleLoginButton;