import React, { useState } from "react";
import { callAppApi } from "../services/appApi.js";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton.jsx";
import { issueTokensOnLogin } from "../services/tokenManager.js";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Lock,
  User,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function UserLogin() {
  const [userid, setUserid] = useState("");
  const [userpw, setUserpw] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!userid || !userpw) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const data = await callAppApi(
        "user_login",
        { user_id: userid, user_pw: userpw },
        { auth: false }
      );

      alert(`${data.user_name}님 환영합니다!`);

      if (data.google_email) {
        sessionStorage.setItem("google_email", data.google_email);
      }

      const tokenResult = await issueTokensOnLogin(
        { user_id: data.user_id, user_name: data.user_name },
        "normal"
      );

      setIsLoading(false);
      if (!tokenResult?.accessToken) {
        setErrorMsg("로그인 토큰 발급에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      navigate("/");
    } catch (error) {
      setIsLoading(false);
      const code = error?.message || "";
      if (code === "GOOGLE_ACCOUNT") {
        setErrorMsg(
          "Google 계정으로 가입하셨습니다. 'Google로 계속하기' 버튼을 이용해주세요."
        );
      } else if (code === "NOT_FOUND") {
        setErrorMsg("존재하지 않는 아이디입니다.");
      } else if (code === "INVALID_PASSWORD") {
        setErrorMsg("비밀번호가 일치하지 않습니다.");
      } else {
        setErrorMsg("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-100">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[150px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[130px] opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => navigate("/")}
          className="mb-8 p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all shadow-sm border border-slate-100 flex items-center gap-2 group active:scale-95"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-semibold">홈으로</span>
        </button>

        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[40px] p-10 shadow-[0_30px_70px_-15px_rgba(30,41,59,0.08)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white font-bold text-3xl shadow-lg shadow-blue-100 mb-6">
              d
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              Dayf
            </h2>
            <p className="text-slate-500 font-medium">
              교대근무 라이프스타일 통합 관리 플랫폼
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-1.5 px-1">
                <User size={14} className="text-slate-400" />
                <span>아이디</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="아이디를 입력해주세요"
                  value={userid}
                  onChange={(e) => setUserid(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white py-4 px-5 rounded-2xl text-slate-900 placeholder-slate-400 font-medium shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-1.5 px-1">
                <Lock size={14} className="text-slate-400" />
                <span>비밀번호</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="off"
                  value={userpw}
                  onChange={(e) => setUserpw(e.target.value)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white py-4 px-5 rounded-2xl text-slate-900 placeholder-slate-400 font-medium shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-start gap-2.5 text-sm font-semibold"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4.5 px-6 rounded-[20px] font-bold text-lg shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} fill="currentColor" />
                  <span>로그인</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <GoogleLoginButton />

          <div className="text-center mt-10">
            <p className="text-slate-500 font-medium">
              dayf가 처음이신가요?{" "}
              <button
                type="button"
                onClick={() => navigate("/UserJoin")}
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors underline underline-offset-4 ml-1.5"
              >
                회원가입하기
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
