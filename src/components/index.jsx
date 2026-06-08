import { Calendar, Settings, Clock, CheckCircle2, Share2, Zap, ChevronRight, Menu, X, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { getUserInfoFromValidToken } from "../services/tokenManager";
import { motion, AnimatePresence } from "motion/react";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("4-3");

  useEffect(() => {
    const checkLogin = async () => {
      const userInfo = await getUserInfoFromValidToken();
      if (userInfo?.user_id) navigate("/calendar");
    };
    checkLogin();
  }, [navigate]);

  const navLinks = [
    { title: "문제점", href: "#problem" },
    { title: "솔루션", href: "#solution" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 overflow-x-hidden">
      {/* --- Navigation --- */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <nav className="container mx-auto px-6 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-2xl leading-none">d</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-display">dayf</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10 font-medium text-slate-600">
            {navLinks.map((link) => (
              <a key={link.title} href={link.href} className="hover:text-blue-600 transition-colors">
                {link.title}
              </a>
            ))}
            <button 
              onClick={() => navigate("/UserLogin")}
              className="ml-4 bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
              로그인
            </button>
          </div>

          <button className="md:hidden p-2 text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl"
            >
              {navLinks.map((link) => (
                <a 
                  key={link.title}
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium p-2 hover:bg-slate-50 rounded-lg"
                >
                  {link.title}
                </a>
              ))}
              <button 
                onClick={() => navigate("/UserLogin")} 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg mt-2 shadow-lg shadow-blue-100"
              >
                서비스 시작하기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute bottom-0 right-[-5%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-40"></div>
          </div>

          <div className="container mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8"
            >
              <Zap size={16} fill="currentColor" /> <span>지능형 교대근무 관리 서비스</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.05] font-display"
            >
              교대근무의 혼란을 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
                확신으로 바꾸세요
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-600 mb-12 leading-relaxed"
            >
              더 이상 갤러리 속 근무표 사진을 찾지 마세요.<br className="hidden md:block"/>
              단 한 번의 패턴 설정으로 당신의 1년을 완벽하게 계획할 수 있습니다.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-5"
            >
              <button 
                onClick={() => navigate("/UserJoin")}
                className="group bg-blue-600 text-white px-10 py-5 rounded-[2rem] text-xl font-bold hover:bg-blue-700 transition-all shadow-2xl shadow-blue-300 flex items-center justify-center gap-3 active:scale-95"
              >
                지금 무료로 시작하기 <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* --- Problem Cards (Bento style) --- */}
        <section id="problem" className="py-32 bg-slate-50/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display">아직도 이렇게 관리하시나요?</h2>
              <div className="h-2 w-24 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "📸", title: "갤러리 속 근무표", desc: "약속 잡을 때마다 근무표 사진 찾느라 스크롤 내리는 불편함" },
                { icon: "✍️", title: "매달 반복되는 수기 입력", desc: "달력에 하나하나 주간, 야간을 적어넣는 번거로운 과정" },
                { icon: "❓", title: "예측 불가능한 휴일", desc: "3개월 뒤 내 휴일이 언제인지 몰라 여행 계획조차 못 세우는 현실" }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -10 }}
                  className="bg-white p-12 rounded-[40px] border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <div className="text-6xl mb-8 select-none">{item.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 font-display">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-lg">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Solution Section (Modern Widget UI) --- */}
        <section id="solution" className="py-32 overflow-hidden">
          <div className="container mx-auto px-6">
            {/* 중앙 상단 타이틀 배치 */}
            <div className="text-center mb-20 md:mb-28">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-extrabold leading-[1.1] font-display"
              >
                <span className="text-blue-600 font-display">dayf가 가져온 변화</span>
              </motion.h2>
              <div className="h-2 w-24 bg-blue-600 mx-auto rounded-full mt-8 opacity-20"></div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="lg:w-5/12">
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { icon: <Settings size={22} />, title: "간편한 패턴 맞춤 설정", desc: "주/야/비/휴 등 본인의 근무 패턴을 입력하면 자동으로 미래 일정이 생성됩니다.", bg: "bg-blue-600", lightBg: "bg-blue-50" },
                    { icon: <Calendar size={22} />, title: "구글 캘린더 연동", desc: "생성된 근무 일정을 개인 캘린더에 바로 동기화하여 약속 관리와 병행하세요.", bg: "bg-indigo-600", lightBg: "bg-indigo-50" },
                    { icon: <Share2 size={22} />, title: "원터치 스케줄 공유", desc: "가족이나 연인에게 전용 링크를 보내 실시간으로 내 근무 상황을 알릴 수 있습니다.", bg: "bg-emerald-600", lightBg: "bg-emerald-50" }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`group p-8 rounded-[32px] border border-slate-100 ${feature.lightBg} hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                    >
                      <div className="flex items-start gap-6 relative z-10">
                        <div className={`w-12 h-12 shrink-0 ${feature.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-2 font-display">{feature.title}</h4>
                          <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                      </div>
                      {/* Decorative background circle */}
                      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mockup UI */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="lg:w-7/12 w-full relative"
              >
                <div className="bg-slate-900 rounded-[56px] p-5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative z-10 border-8 border-slate-800">
                  <div className="bg-white rounded-[40px] overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="font-bold text-xl text-slate-800 font-display">2025년 5월</span>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-7 gap-3">
                      {Array.from({length: 31}).map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl border border-slate-50 flex flex-col items-center justify-center relative group cursor-default transition-all hover:bg-slate-50">
                          <span className="text-xs font-semibold text-slate-400 mb-2">{i + 1}</span>
                          <div className={`w-full h-2 rounded-full absolute bottom-2 px-1`}>
                            <div className={`h-full rounded-full transition-all duration-500 ${i % 4 === 0 ? 'bg-amber-400 scale-x-100' : i % 4 === 1 ? 'bg-blue-600 scale-x-100' : 'bg-slate-100 scale-x-0'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 overflow-x-auto no-scrollbar">
                      <span className="px-5 py-2 bg-amber-100 text-amber-700 rounded-2xl text-sm font-bold whitespace-nowrap">☀️ 주간 근무</span>
                      <span className="px-5 py-2 bg-blue-100 text-blue-700 rounded-2xl text-sm font-bold whitespace-nowrap">🌙 야간 근무</span>
                      <span className="px-5 py-2 bg-slate-200 text-slate-600 rounded-2xl text-sm font-bold whitespace-nowrap">🏠 휴무</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[32px] shadow-2xl border border-blue-50 hidden md:block z-20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status</p>
                      <span className="font-bold text-lg">패턴 연동 완료</span>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative background element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[64px] p-16 md:p-32 text-center text-white shadow-[0_50px_100px_-20px_rgba(37,99,235,0.4)] relative overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px]"></div>
              
              <h2 className="text-4xl md:text-7xl font-bold mb-10 tracking-tight leading-[1.1] font-display">당신의 소중한 휴무를 <br /> 이제 온전히 누리세요.</h2>
              <p className="text-blue-100 text-xl md:text-2xl mb-16 max-w-2xl mx-auto opacity-90 font-medium">
                지금 가입하고 1년 치 근무표를 3초 만에 생성해 보세요.
              </p>
              <button 
                onClick={() => navigate("/UserJoin")}
                className="bg-white text-blue-600 px-16 py-6 rounded-3xl text-2xl font-bold hover:bg-slate-50 transition-all shadow-2xl active:scale-95"
              >
                무료로 시작하기
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">d</span>
              </div>
              <span className="text-2xl font-bold font-display tracking-tight">dayf</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-slate-500 font-medium">
              <a href="#" className="hover:text-slate-900 transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-slate-900 transition-colors">이용약관</a>
              <a href="#" className="hover:text-slate-900 transition-colors">고객지원</a>
            </div>
            <p className="text-slate-400 font-medium">© 2026 dayf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
