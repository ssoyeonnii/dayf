import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import GoogleAccountManage from "../services/googleAuthService.jsx";
import { issueTokensOnLogin } from "../services/tokenManager.js";

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
        
        // Google Calendar API용 토큰 및 이메일 저장 (JWT와 별개)
        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('google_email', user?.email || '');

        // DAYF JWT 토큰 발급 (user_id, user_name, login_type 포함)
        await issueTokensOnLogin(
          { user_id: user?.email, user_name: user?.name || 'GoogleUser' },
          'google'
        );

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
    <button 
      onClick={() => { 
        sessionStorage.removeItem('access_token'); 
        loginWithGoogle(); 
      }} 
      style={{
        width: "100%",
        height: "40px",
        backgroundColor: "#fff",
        color: "#3c4043",
        border: "1px solid #dadce0",
        borderRadius: "12px",
        fontSize: "14px",
        fontFamily: "Roboto, arial, sans-serif",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: "pointer",
        padding: "25px 20px",
        transition: "background-color 0.2s, box-shadow 0.2s",
      }}
    >
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <path d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z" fill="#4285F4"/>
          <path d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z" fill="#34A853"/>
          <path d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z" fill="#FBBC05"/>
          <path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z" fill="#EA4335"/>
        </g>
      </svg>
      Google로 시작하기
    </button>
  );
};


export default GoogleLoginButton;