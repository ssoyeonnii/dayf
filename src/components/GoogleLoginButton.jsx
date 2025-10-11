import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import GoogleAccountManage from "../services/googleAuthService.jsx";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const loginWithGoogle = useGoogleLogin({
    flow: 'implicit', // token flow
    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
    prompt: 'consent',
    overrideScope:true,
    onSuccess: async ({ access_token }) => {
      try {
        if (!access_token) {
          alert('Google 액세스 토큰을 받지 못했습니다. 다시 시도해주세요.');
          return;
        }

        // Google userinfo + DB upsert (frontend)
        const result = await GoogleAccountManage.signInWithGoogle(access_token);
        if (result?.error) {
          if (result.error === 'DAYF_ACCOUNT_EXISTS') {
            alert('해당 이메일로 이미 Dayf 계정이 존재합니다.\n일반 로그인을 이용해주세요.');
          } else if (result.error === 'ALREADY_LINKED') {
            alert('해당 Google 계정은 이미 다른 Dayf 계정에 연동되어 있습니다.');
          } else {
            alert(result.message || '로그인 중 알 수 없는 오류가 발생했습니다.');
          }
          return;
        }

        const { user } = result;
        sessionStorage.setItem('userName', user?.name || 'GoogleUser');
        sessionStorage.setItem('userId', user?.email || '');
        sessionStorage.setItem('googleuser', "1");
        sessionStorage.setItem('access_token', access_token);

        alert(`${user?.name || '사용자'}님 환영합니다!`);
        navigate('/');
      } catch (e) {
        console.error('Google token flow failed', e);
        alert('Google 로그인 중 오류가 발생했습니다.');
        try {
          await GoogleAccountManage.saveErrorLog('GoogleLoginButton', 'EXCEPTION', e.message, null);
        } catch {}
      }
    },
    onError: () => {
      console.error('구글 로그인 실패');
    },
  });

  if (!clientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID 값이 설정되지 않았습니다. 구글 로그인이 작동하지 않습니다.");
  }

  return (
    <>
      <button onClick={() => { sessionStorage.removeItem('access_token'); loginWithGoogle(); }} className="form-action-btn" style={{ width: "100%" }}>
        Google로 계속하기
      </button>
    </>
  );
};

export default GoogleLoginButton;