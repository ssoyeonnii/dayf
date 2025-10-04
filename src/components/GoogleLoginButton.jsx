import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const loginWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
    prompt: 'consent',
    overrideScope:true,
    onSuccess: async ({ code }) => {
      try {
        //구글에서 받아온 토큰을 백엔드 서버로 전달
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/oauth/google/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });
        if (!res.ok) {
          console.error('Token exchange failed', await res.text());
          return;
        }
        const { user, access_token } = await res.json();

        sessionStorage.setItem('userName', user?.name || 'GoogleUser');
        sessionStorage.setItem('userId', user?.email || '');
        sessionStorage.setItem('googleuser', '1');
        if (access_token) sessionStorage.setItem('access_token', access_token);

        alert(`${user?.name || '사용자'}님 환영합니다!`);
        navigate('/');
      } catch (e) {
        console.error('Auth code flow processing failed', e);
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