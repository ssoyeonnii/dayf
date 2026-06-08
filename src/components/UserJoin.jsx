import React, { useState, useRef } from "react";
import { callAppApi } from "../services/appApi.js";
import { useNavigate } from "react-router-dom";
import { issueTokensOnLogin } from "../services/tokenManager.js";
import { motion } from "motion/react";
import {
  ArrowLeft,
  User,
  Lock,
  Tag,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function UserJoin() {
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [userpw, setUserpw] = useState("");
  const [checkMsg, setCheckMsg] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);

  const navigate = useNavigate();
  const duplicateCheckTimerRef = useRef(null);

  const doDuplicateCheck = async (value) => {
    if (!value.trim()) {
      setCheckMsg("ID를 입력해주세요.");
      setIsDuplicate(false);
      setIsChecking(false);
      return;
    }

    const idPattern = /^[A-Za-z0-9]+$/;
    if (!idPattern.test(value)) {
      setCheckMsg("ID는 영문자와 숫자만 사용할 수 있습니다.");
      setIsDuplicate(false);
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const data = await callAppApi(
        "user_duplicate_check",
        { user_id: value },
        { auth: false }
      );

      setIsChecking(false);
      if (data.exists) {
        if (data.google_sub) {
          setCheckMsg(
            "이미 Google 계정으로 가입되어 있습니다. Google 로그인을 이용해주세요."
          );
          setIsDuplicate(true);
        } else {
          setCheckMsg("이미 존재하는 ID입니다.");
          setIsDuplicate(true);
        }
      } else {
        setCheckMsg("사용 가능한 ID입니다.");
        setIsDuplicate(false);
      }
    } catch (error) {
      setIsChecking(false);
      console.error("중복 확인 오류:", error.message);
      setCheckMsg("오류가 발생했습니다.");
      setIsDuplicate(false);
    }
  };

  const scheduleDuplicateCheck = (value) => {
    setUserid(value);
    setCheckMsg("입력 중...");
    setIsChecking(true);

    if (duplicateCheckTimerRef.current) {
      clearTimeout(duplicateCheckTimerRef.current);
    }

    duplicateCheckTimerRef.current = setTimeout(() => {
      doDuplicateCheck(value);
    }, 500);
  };

  const handleSignUp = async () => {
    if (!username || !userid || !userpw) {
      alert("모든 값을 입력해주세요.");
      return;
    }

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
      setIsJoinSuccess(true);
      await callAppApi(
        "user_signup",
        { user_id: userid, user_name: username, user_pw: userpw },
        { auth: false }
      );

      alert("회원가입 완료!");

      await issueTokensOnLogin(
        { user_id: userid, user_name: username },
        "normal"
      );

      navigate("/");
    } catch (err) {
      setIsJoinSuccess(false);
      console.error("회원가입 오류:", err);
      alert("회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-100">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[150px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[130px] opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={() => navigate("/")}
          className="mb-8 p-3 rounded-2xl bg-white hover:bg-slate-100 transition-all shadow-sm border border-slate-100 flex items-center gap-2 group active:scale-95"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-semibold">홈으로</span>
        </button>

        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[40px] p-10 shadow-[0_30px_70px_-15px_rgba(30,41,59,0.08)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Dayf
            </h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-1.5 px-1">
                <Tag size={14} className="text-slate-400" />
                <span>이름</span>
              </label>
              <input
                type="text"
                placeholder="이름을 입력해주세요 (한글/영문)"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white py-4 px-5 rounded-2xl text-slate-900 placeholder-slate-400 font-medium shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-1.5 px-1">
                <User size={14} className="text-slate-400" />
                <span>아이디</span>
              </label>
              <input
                type="text"
                placeholder="아이디를 입력해주세요"
                autoComplete="off"
                value={userid}
                onChange={(e) => scheduleDuplicateCheck(e.target.value)}
                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white py-4 px-5 rounded-2xl text-slate-900 placeholder-slate-400 font-medium shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 outline-none"
              />

              {checkMsg && (
                <div className="flex items-center gap-1.5 px-2.5 pt-1 text-xs font-bold leading-none">
                  {isChecking ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : isDuplicate ? (
                    <AlertCircle size={14} className="text-red-500" />
                  ) : (
                    <CheckCircle size={14} className="text-emerald-500" />
                  )}
                  <span
                    className={
                      isChecking
                        ? "text-slate-400"
                        : isDuplicate
                          ? "text-red-500"
                          : "text-emerald-500"
                    }
                  >
                    {checkMsg}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 tracking-wide flex items-center gap-1.5 px-1">
                <Lock size={14} className="text-slate-400" />
                <span>비밀번호</span>
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                autoComplete="off"
                value={userpw}
                onChange={(e) => setUserpw(e.target.value)}
                className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white py-4 px-5 rounded-2xl text-slate-900 placeholder-slate-400 font-medium shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 outline-none"
              />
            </div>

            <button
              onClick={handleSignUp}
              disabled={isJoinSuccess || isChecking || isDuplicate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4.5 px-6 rounded-[20px] text-lg shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isJoinSuccess ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>회원가입하기</span>
              )}
            </button>

            <div className="text-center mt-8">
              <p className="text-slate-500 font-medium">
                이미 계정이 있으신가요?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/UserLogin")}
                  className="text-blue-600 hover:text-blue-700 font-bold transition-colors underline underline-offset-4 ml-1.5"
                >
                  로그인하기
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
