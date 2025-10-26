import { Calendar, Settings, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./index.css";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 탭 버튼 및 탭 컨텐츠 이벤트 등록
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const handleTabClick = (button) => () => {
      const tabId = button.dataset.tab;
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      tabContents.forEach((content) => {
        if (content.id === tabId) {
          content.classList.remove("hidden");
        } else {
          content.classList.add("hidden");
        }
      });
    };
    tabButtons.forEach((button) => {
      button.addEventListener("click", handleTabClick(button));
    });

    // 교대근무 차트 관련
    const shiftData = {
      "4-3": [
        "주간",
        "주간",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "오후",
        "오후",
        "주간",
        "주간",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "오후",
        "오후",
        "주간",
        "주간",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "오후",
        "오후",
        "주간",
        "주간",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "오후",
      ],
      "3-2": [
        "주간",
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "야간",
        "비번",
        "비번",
        "주간",
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "야간",
        "비번",
        "비번",
        "주간",
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "야간",
        "비번",
        "비번",
        "주간",
      ],
      "2-2": [
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "휴무",
        "휴무",
        "주간",
        "주간",
        "휴무",
        "휴무",
        "야간",
        "야간",
        "휴무",
      ],
    };
    const shiftColors = {
      주간: "rgba(253, 224, 71, 0.8)",
      야간: "rgba(30, 58, 138, 0.8)",
      오후: "rgba(134, 239, 172, 0.8)",
      휴무: "rgba(251, 146, 60, 0.8)",
    };
    const shiftTextColors = {
      주간: "#000",
      야간: "#fff",
      오후: "#000",
      휴무: "#000",
    };
    // 앵커 스크롤 이벤트
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    const handleAnchorClick = function (e) {
      e.preventDefault();
      document
        .querySelector(this.getAttribute("href"))
        .scrollIntoView({ behavior: "smooth" });
    };
    anchorLinks.forEach((anchor) => {
      anchor.addEventListener("click", handleAnchorClick);
    });
    // cleanup 함수에서 이벤트 해제
    return () => {
      tabButtons.forEach((button) => {
        button.removeEventListener("click", handleTabClick(button));
      });
      anchorLinks.forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick);
      });
    };
  }, []);

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
    <>
      <div className="bg-stone-50 text-gray-800">
        <header
          id="home"
          className="w-full bg-white shadow-sm sticky top-0 z-50"
        >
          <nav className="container mx-auto px-6 pd-y-16 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">
              dayf
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#problem" className="text-gray-600 hover:text-blue-600">
                문제점
              </a>
              <a href="#solution" className="text-gray-600 hover:text-blue-600">
                솔루션
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600">
                기대효과
              </a>
            </div>
            <a
              href={"/UserLogin"}
              className="hidden md:block bg-blue-600 text-white pd-x-4 py-2 rounded-lg transition"
            >
              서비스 바로가기
            </a>
            <button
              id="mobile-menu-button"
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </nav>
          <div
            id="mobile-menu"
            className={
              (mobileMenuOpen ? "" : "hidden ") + "md:hidden px-6 pb-4"
            }
          >
            <a
              href="#problem"
              className="block py-2 text-gray-600 hover:text-blue-600"
            >
              문제점
            </a>
            <a
              href="#solution"
              className="block py-2 text-gray-600 hover:text-blue-600"
            >
              솔루션
            </a>
            <a
              href="#benefits"
              className="block py-2 text-gray-600 hover:text-blue-600"
            >
              기대효과
            </a>
            <a
              href={"/UserLogin"}
              className="block mt-2 bg-blue-600 text-white text-center pd-x-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              서비스 바로가기
            </a>
          </div>
        </header>

        <main>
          <section class="bg-white">
            <div class="container mx-auto px-6 pd-y-80 md:py-32 text-center">
              <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                복잡한 교대근무, <br />
                <span class="text-blue-600">dayf</span>로 스마트하게!
              </h1>
              <p class="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
                단 한 번의 설정으로 <br class="md:hidden" />
                교대 근무 일정을 자동으로 관리하고, <br />
                이제 당신의 소중한 '휴일(Day Off)'을 <br class="md:hidden" />
                온전히 계획하고 즐기세요.
              </p>
              <div class="mg-t-40">
                <a
                  href="#solution"
                  class="bg-blue-600 text-white pd-x-8 pd-y-12 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
                >
                  주요 기능 살펴보기
                </a>
              </div>
            </div>
          </section>

          <section id="problem" class="pd-y-80 md:py-28">
            <div class="container mx-auto px-6">
              <div class="text-center mg-b-12">
                <h2 class="text-3xl md:text-4xl font-bold">
                  당신의 캘린더는 어떤가요?
                </h2>
                <p class="mt-4 max-w-768 mx-auto text-gray-600">
                복잡하고 불규칙한 교대근무 스케줄로 {" "}
                <br class="md:hidden" />일정 관리가 어렵지 않나요?
                </p>
              </div>
              <div class="max-w-4xl mx-auto text-center">
                <div class="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-300">
                  <div class="flex flex-col items-center justify-center space-y-8">
{/* 혼란스러운 시계 아이콘들 */}
                    <div class="relative">
                      <div class="text-8xl opacity-30 transform rotate-12">🕐</div>
                      <div class="text-6xl absolute -top-4 -right-6 opacity-40 transform -rotate-12">🕕</div>
                      <div class="text-7xl absolute -bottom-2 -left-4 opacity-35 transform rotate-45">🕘</div>
                      <div class="text-5xl absolute top-2 left-8 opacity-25 transform -rotate-30">🕛</div>
                    </div>
                    
{/* 혼란스러운 메모와 스케줄 */}
                    <div class="flex flex-wrap justify-center gap-4 max-w-2xl">
                      <div class="bg-yellow-200 px-4 py-2 rounded-lg transform rotate-3 text-sm font-medium shadow-md">
                        📝 내일 야간근무?
                      </div>
                      <div class="bg-red-200 px-4 py-2 rounded-lg transform -rotate-2 text-sm font-medium shadow-md">
                        ❓ 언제 휴무지?
                      </div>
                      <div class="bg-blue-200 px-4 py-2 rounded-lg transform rotate-1 text-sm font-medium shadow-md">
                        📱 가족 약속 잡기 어려워
                      </div>
                      <div class="bg-green-200 px-4 py-2 rounded-lg transform -rotate-1 text-sm font-medium shadow-md">
                        🤔 오후 근무였나?
                      </div>
                      <div class="bg-purple-200 px-4 py-2 rounded-lg transform rotate-2 text-sm font-medium shadow-md">
                        📅 스케줄이 헷갈려
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="solution" class="pd-y-80 md:py-28 bg-white">
            <div class="container mx-auto px-6">
              <div class="text-center mg-b-12">
                <h2 class="text-3xl md:text-4xl font-bold">
                  dayf의 명쾌한 해결책
                </h2>
                <p class="mt-4 max-w-768 mx-auto text-gray-600">
                  복잡한 교대근무 스케줄, 이제 dayf로 간단하게! <br/>
                  구글 캘린더와 연동하여 근무일정과 개인 약속을 한눈에 관리하고, <br/>
                  가족과 친구들과도 쉽게 일정을 공유하세요.
                </p>
              </div>

              <div class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                  <div>일</div>
                  <div>월</div>
                  <div>화</div>
                  <div>수</div>
                  <div>목</div>
                  <div>금</div>
                  <div>토</div>
                </div>
                <div class="grid grid-cols-7 gap-1 text-sm">
                  <div class="cell-h-64 border rounded-md bg-gray-50 text-gray-400">
                    28
                  </div>
                  <div class="cell-h-64 border rounded-md bg-gray-50 text-gray-400">
                    29
                  </div>
                  <div class="cell-h-64 border rounded-md bg-gray-50 text-gray-400">
                    30
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">1</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">2</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">3</span>
                    <span class="block mt-1 text-xs bg-red-200 rounded-sm">
                      휴무
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-blue-600">
                    <span class="font-bold">4</span>
                    <span class="block mt-1 text-xs bg-red-200 rounded-sm">
                      휴무
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-red-600">
                    <span class="font-bold">5</span>
                    <span class="block mt-1 text-xs bg-blue-900 text-white rounded-sm">
                      야간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">6</span>
                    <span class="block mt-1 text-xs bg-blue-900 text-white rounded-sm">
                      야간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">7</span>
                    <span class="block mt-1 text-xs bg-green-200 rounded-sm">
                      오후
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">8</span>
                    <span class="block mt-1 text-xs bg-green-200 rounded-sm">
                      오후
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">9</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">10</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-blue-600">
                    <span class="font-bold">11</span>
                    <span class="block mt-1 text-xs bg-red-200 rounded-sm">
                      휴무
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-red-600">
                    <span class="font-bold">12</span>
                    <span class="block mt-1 text-xs bg-red-200 rounded-sm">
                      휴무
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">13</span>
                    <span class="block mt-1 text-xs bg-blue-900 text-white rounded-sm">
                      야간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">14</span>
                    <span class="block mt-1 text-xs bg-blue-900 text-white rounded-sm">
                      야간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">15</span>
                    <span class="block mt-1 text-xs bg-green-200 rounded-sm">
                      오후
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">16</span>
                    <span class="block mt-1 text-xs bg-green-200 rounded-sm">
                      오후
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">17</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-blue-600">
                    <span class="font-bold">18</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-red-600">
                    <span class="font-bold">19</span>
                    <span class="block mt-1 text-xs bg-red-200 rounded-sm">
                      휴무
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">20</span>
                    <span class="block mt-1 text-xs bg-red-200 rounded-sm">
                      휴무
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">21</span>
                    <span class="block mt-1 text-xs bg-blue-900 text-white rounded-sm">
                      야간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">22</span>
                    <span class="block mt-1 text-xs bg-blue-900 text-white rounded-sm">
                      야간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">23</span>
                    <span class="block mt-1 text-xs bg-green-200 rounded-sm">
                      오후
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-blue-600">
                    <span class="font-bold">24</span>
                    <span class="block mt-1 text-xs bg-green-200 rounded-sm">
                      오후
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-red-600">
                    <span class="font-bold">25</span>
                    <span class="block mt-1 text-xs bg-yellow-200 rounded-sm">
                      주간
                    </span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">26</span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">27</span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">28</span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">29</span>
                  </div>
                  <div class="cell-h-64 border rounded-md ">
                    <span class="font-bold">30</span>
                  </div>
                  <div class="cell-h-64 border rounded-md text-blue-600">
                    <span class="font-bold">31</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="benefits" class="pd-y-80 md:py-28">
            <div class="container mx-auto px-6">
              <div class="text-center mg-b-12">
                <h2 class="text-3xl md:text-4xl font-bold">
                  dayf가 가져올 <br class="md:hidden" /> 긍정적인 변화
                </h2>
                <p class="mt-4 max-w-768 mx-auto text-gray-600">
                  단순한 스케줄 관리를 넘어, <br class="md:hidden" /> 당신의
                  삶의 질을 높입니다.
                </p>
              </div>
              <div class="grid md:grid-cols-2 lg:grid-cols-4 spacing-32">
                <div class="bg-white pd-32 rounded-xl shadow-md border border-gray-100 text-center">
                  <div class="text-4xl mg-b-16">⏱️</div>
                  <h3 class="text-xl font-bold mb-2">업무 효율성 증대</h3>
                  <p class="text-gray-600">
                    복잡한 스케줄 관리 시간을 단축하여 본업에 더욱 집중할 수
                    있습니다.
                  </p>
                </div>
                <div class="bg-white pd-32 rounded-xl shadow-md border border-gray-100 text-center">
                  <div class="text-4xl mg-b-16">🏖️</div>
                  <h3 class="text-xl font-bold mb-2">개인 시간 관리 용이</h3>
                  <p class="text-gray-600">
                  교대근무자의 휴무일을 미리 확인하여 개인 약속을 여유롭게 계획 할 수있습니다.
                  </p>
                </div>
                <div class="bg-white pd-32 rounded-xl shadow-md border border-gray-100 text-center">
                  <div class="text-4xl mg-b-16">👨‍👩‍👧‍👦</div>
                  <h3 class="text-xl font-bold mb-2">원활한 소통</h3>
                  <p class="text-gray-600">
                    가족•친구를 포함한 주변인과 근무•휴무 일정을 쉽게
                    공유할수 있습니다.
                  </p>
                </div>
                <div class="bg-white pd-32 rounded-xl shadow-md border border-gray-100 text-center">
                  <div class="text-4xl mg-b-16">🌐</div>
                  <h3 class="text-xl font-bold mb-2">뛰어난 접근성</h3>
                  <p class="text-gray-600">
                  별도 어플리케이션 설치가 필요 없는 웹 링크로 편리하게 이용 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer class="bg-gray-800 text-white">
          <div class="container mx-auto px-6 pd-y-48 text-center">
            <h2 class="text-3xl font-bold">
              지금 바로 <br class="md:hidden" />
              당신의 일상을 바꿔보세요.
            </h2>

            <div class="mt-8">
              <a
                href={"/UserJoin"}
                class="bg-blue-600 text-white pd-x-8 pd-y-12 rounded-lg text-lg font-semibold transition"
              >
                서비스 시작하기
              </a>
            </div>
            <div class="mg-t-40 text-gray-400 text-sm">
              <div class="mb-4">
                <a href="/privacy-policy" class="hover:text-white mr-4">개인정보처리방침</a>
                <a href="/terms-of-service" class="hover:text-white">이용약관</a>
              </div>
              <p>&copy; 2025 dayf. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
