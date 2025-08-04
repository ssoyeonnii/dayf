import { Calendar, Settings, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./index.css";

const index = () => {
  const navigate = useNavigate();

  // 세션에서 로그인 정보 불러오기
  useEffect(() => {
    const userName = sessionStorage.getItem("userName");
    const userId = sessionStorage.getItem("userId");

    if (userId && userName) {
    // 세션이 있으면 calendar.jsx로 이동
      navigate("/calendar");
    }
  }, [navigate]);

  // 회원가입 페이지
  const moveJoin = () => {
    navigate("/UserJoin");
  };
  // 로그인 페이지
  const moveLogin = () => {
    navigate("/UserLogin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 pt-70">
      {/* Hero Section */}  
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="fs-48 fw-700 text-gray-900 mb-6">쉼날</h2>
          <p className="fs-20 text-gray-600 mb-8 max-w-3xl mx-auto">
          복잡한 교대근무 패턴도<br/>
개인 설정만 하면 자동으로 정리!<br/>
정확하고 직관적인 근무 일정 캘린더
          </p>
          <div className="flex justify-center">
            <button
              onClick={moveJoin}
              className="px-8 py-4 bg-blue-700 text-white fs-18 fw-800 rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
            >
              시작하기
            </button>
            <button
              onClick={moveLogin}
              className="px-8 py-4 bg-blue-700 text-white fs-18 fw-800 rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
            >
              로그인
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="fs-35 fw-700 text-gray-900 mb-4">주요 기능</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <Settings className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <h4 className="fs-20 fw-700 text-gray-900 mb-3">맞춤형 설정</h4>
              <p className="text-gray-600">다양한 교대시스템 지원</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <Calendar className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <h4 className="fs-20 fw-700 text-gray-900 mb-3">직관적 달력</h4>
              <p className="text-gray-600">
                주간/야간/오후 근무를 <br />
                한눈에 구분
              </p>
            </div>

            <div className="text-center p-8 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
              <Clock className="w-16 h-16 text-blue-700 mx-auto mb-4" />
              <h4 className="fs-20 fw-700 text-gray-900 mb-3">자동 계산</h4>
              <p className="text-gray-600">
                사용자 설정 후 <br />
                교대근무 일정 자동 생성 및 공휴일 반영
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="fs-35 fw-700 text-gray-900 mb-4">사용 방법</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center fs-24 fw-700 mx-auto mb-4">
                1
              </div>
              <h4 className="fs-20 fw-700 text-gray-900 mb-3">
                회원가입 & 로그인
              </h4>
              <p className="text-gray-600">간단한 정보로 계정을 생성하세요</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center fs-24 fw-700 mx-auto mb-4">
                2
              </div>
              <h4 className="fs-20 fw-700 text-gray-900 mb-3">교대근무 설정</h4>
              <p className="text-gray-600">
                나의 교대 유형과 <br />
                근무 패턴을 설정하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center fs-24 fw-700 mx-auto mb-4">
                3
              </div>
              <h4 className="fs-20 fw-700 text-gray-900 mb-3">일정 확인</h4>
              <p className="text-gray-600">
                달력에서 교대근무 일정을 <br />
                한눈에 확인하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">© 2025 교대플래너</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default index;
